const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const archiver = require('archiver');
const csv = require('csv-parser');
const ExcelJS = require('exceljs');
const axios = require('axios');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://imageconverter-neon.vercel.app',
    'https://*.vercel.app',
    'https://*.netlify.app',
    'https://*.railway.app',
    'https://*.onrender.com'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/gif', 'image/bmp'];
    if (allowedFormats.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Allowed: JPEG, PNG, WebP, TIFF, GIF, BMP'));
    }
  }
});

// Separate multer instance for CSV uploads
const uploadCSV = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedFormats = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];
    if (allowedFormats.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only CSV files allowed'));
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Convert images
app.post('/api/convert', upload.array('images', 500), async (req, res) => {
  try {
    const { targetFormat } = req.body;
    
    if (!targetFormat) {
      return res.status(400).json({ error: 'Target format is required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const convertedDir = path.join('converted', `batch-${Date.now()}`);
    await fs.mkdir(convertedDir, { recursive: true });

    const conversionPromises = req.files.map(async (file) => {
      const filename = path.parse(file.filename).name;
      const outputPath = path.join(convertedDir, `${filename}.${targetFormat}`);

      try {
        // Handle different formats
        let pipeline = sharp(file.path);

        switch(targetFormat.toLowerCase()) {
          case 'jpg':
          case 'jpeg':
            pipeline = pipeline.jpeg({ quality: 90 });
            break;
          case 'png':
            pipeline = pipeline.png({ compressionLevel: 9 });
            break;
          case 'webp':
            pipeline = pipeline.webp({ quality: 90 });
            break;
          case 'gif':
            pipeline = pipeline.gif();
            break;
          case 'tiff':
            pipeline = pipeline.tiff();
            break;
          case 'bmp':
            pipeline = pipeline.bmp();
            break;
          default:
            pipeline = pipeline.png();
        }

        await pipeline.toFile(outputPath);
        return { success: true, filename: `${filename}.${targetFormat}` };
      } catch (error) {
        return { success: false, filename: file.originalname, error: error.message };
      }
    });

    const results = await Promise.all(conversionPromises);
    const successCount = results.filter(r => r.success).length;

    res.json({
      message: `Successfully converted ${successCount}/${req.files.length} images`,
      convertedPath: convertedDir,
      results
    });

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Error converting images: ' + error.message });
  }
});

// Helper function to parse CSV file
function parseCSVFile(fileBuffer) {
  return new Promise((resolve, reject) => {
    try {
      const content = fileBuffer.toString('utf-8');
      
      // Handle both comma-separated and newline-separated URLs
      // Also handle standard CSV format with URLs in first column
      const lines = content.split('\n');
      const urls = new Set(); // Use Set to avoid duplicates
      
      for (const line of lines) {
        if (!line.trim()) continue; // Skip empty lines
        
        // Split by comma for comma-separated URLs
        const parts = line.split(',');
        
        for (const part of parts) {
          const trimmed = part.trim().replace(/^["']|["']$/g, ''); // Remove quotes
          // Check if it's a valid URL
          if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            urls.add(trimmed);
          }
        }
      }
      
      resolve(Array.from(urls));
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function to download image from URL
async function downloadImageFromURL(url) {
  try {
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    throw new Error(`Failed to download from ${url}: ${error.message}`);
  }
}

// Convert images from URLs
app.post('/api/convert-urls', uploadCSV.single('csvFile'), async (req, res) => {
  try {
    const { targetFormat, outputFormat } = req.body;

    if (!targetFormat) {
      return res.status(400).json({ error: 'Target format is required' });
    }

    if (!outputFormat) {
      return res.status(400).json({ error: 'Output format is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    // Parse CSV file to extract URLs
    const fileBuffer = await fs.readFile(req.file.path);
    const urls = await parseCSVFile(fileBuffer);

    if (urls.length === 0) {
      return res.status(400).json({ error: 'No valid URLs found in CSV file' });
    }

    const batchId = Date.now();
    const convertedDir = path.join('converted', `batch-${batchId}`);
    await fs.mkdir(convertedDir, { recursive: true });

    const conversionResults = [];

    // Download and convert each image
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        const imageBuffer = await downloadImageFromURL(url);
        const filename = `image-${i + 1}`;
        const outputPath = path.join(convertedDir, `${filename}.${targetFormat}`);

        // Convert image using Sharp
        let pipeline = sharp(imageBuffer);

        switch(targetFormat.toLowerCase()) {
          case 'jpg':
          case 'jpeg':
            pipeline = pipeline.jpeg({ quality: 90 });
            break;
          case 'png':
            pipeline = pipeline.png({ compressionLevel: 9 });
            break;
          case 'webp':
            pipeline = pipeline.webp({ quality: 90 });
            break;
          case 'gif':
            pipeline = pipeline.gif();
            break;
          case 'tiff':
            pipeline = pipeline.tiff();
            break;
          case 'bmp':
            pipeline = pipeline.bmp();
            break;
          default:
            pipeline = pipeline.png();
        }

        await pipeline.toFile(outputPath);
        conversionResults.push({
          url,
          filename: `${filename}.${targetFormat}`,
          status: 'success'
        });
      } catch (error) {
        conversionResults.push({
          url,
          status: 'failed',
          error: error.message
        });
      }
    }

    const successCount = conversionResults.filter(r => r.status === 'success').length;

    res.json({
      message: `Successfully converted ${successCount}/${urls.length} images`,
      batchId: batchId,
      convertedPath: convertedDir,
      outputFormat,
      results: conversionResults
    });

  } catch (error) {
    console.error('URL Conversion error:', error);
    res.status(500).json({ error: 'Error converting images from URLs: ' + error.message });
  }
});

// Download converted images as ZIP
app.get('/api/download/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const { format } = req.query;
    const downloadFormat = format || 'zip'; // Default to zip

    const convertedDir = path.join('converted', `batch-${batchId}`);

    // Check if directory exists
    try {
      await fs.access(convertedDir);
    } catch {
      return res.status(404).json({ error: 'Batch not found' });
    }

    if (downloadFormat === 'zip') {
      // Create and send ZIP file
      const zipName = `converted-images-${batchId}.zip`;
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

      const archive = archiver('zip', { zlib: { level: 9 } });
      
      archive.on('error', (err) => {
        res.status(500).json({ error: err.message });
      });

      archive.pipe(res);
      archive.directory(convertedDir, false);
      await archive.finalize();
    } else if (downloadFormat === 'csv') {
      // Generate CSV report
      const files = await fs.readdir(convertedDir);
      const csvName = `conversion-report-${batchId}.csv`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${csvName}"`);

      // Write CSV header
      res.write('File Name,File Size (KB),Conversion Status\n');

      // Write file data
      for (const file of files) {
        const filePath = path.join(convertedDir, file);
        const stats = await fs.stat(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        res.write(`"${file}",${sizeKB},Success\n`);
      }

      res.end();
    } else if (downloadFormat === 'excel') {
      // Generate Excel report with embedded images
      const files = await fs.readdir(convertedDir);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Converted Images');

      // Add headers
      worksheet.columns = [
        { header: 'File Name', key: 'filename', width: 25 },
        { header: 'File Size (KB)', key: 'filesize', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Preview', key: 'preview', width: 25 }
      ];

      // Style header row
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF667eea' } };
      worksheet.getRow(1).height = 25;

      // Add file data with embedded images
      let rowIndex = 2;
      for (const file of files) {
        const filePath = path.join(convertedDir, file);
        const stats = await fs.stat(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        
        worksheet.addRow({
          filename: file,
          filesize: sizeKB,
          status: 'Success',
          preview: ''
        });

        // Try to embed image if it's a readable format
        try {
          const imageId = workbook.addImage({
            filename: filePath,
            extension: file.split('.').pop().toLowerCase()
          });

          worksheet.addImage(imageId, {
            tl: { col: 3, row: rowIndex - 1 },
            ext: { width: 200, height: 200 }
          });

          worksheet.getRow(rowIndex).height = 120;
        } catch (err) {
          // If image can't be embedded, just show the filename
          console.log(`Could not embed image ${file}: ${err.message}`);
        }

        rowIndex++;
      }

      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="conversion-report-${batchId}.xlsx"`);

      // Write workbook to response
      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.status(400).json({ error: 'Invalid format. Supported: zip, csv, excel' });
    }

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Error downloading images: ' + error.message });
  }
});

// Cleanup uploaded files
app.post('/api/cleanup', async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = await fs.readdir(uploadsDir);
    
    for (const file of files) {
      await fs.unlink(path.join(uploadsDir, file));
    }

    res.json({ message: 'Cleanup completed' });
  } catch (error) {
    res.status(500).json({ error: 'Error during cleanup: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
