const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const archiver = require('archiver');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
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

// Download converted images as ZIP
app.get('/api/download/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const convertedDir = path.join('converted', `batch-${batchId}`);

    // Check if directory exists
    try {
      await fs.access(convertedDir);
    } catch {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Create zip file
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
