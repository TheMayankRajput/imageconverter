# CSV/URL Image Conversion Feature

## Overview
The Image Converter now supports batch image conversion from URLs via CSV files. You can upload a CSV file containing image URLs, convert them to your desired format, and download the results in three different formats: ZIP, CSV report, or Excel file.

## Features
- **CSV Upload**: Upload CSV files containing image URLs (one per line or comma-separated)
- **Batch Processing**: Convert up to 500 images in a single batch
- **Format Conversion**: Convert URLs images to: JPEG, PNG, WebP, GIF, TIFF, BMP
- **Multiple Output Formats**:
  - **ZIP**: Compressed folder with all converted images
  - **CSV Report**: Detailed report of conversion results
  - **Excel File**: Professional .xlsx file with conversion metrics

## CSV File Format

### Option 1: One URL per line
```
https://example.com/image1.jpg
https://example.com/image2.jpg
https://example.com/image3.png
```

### Option 2: Comma-separated values
```
URL,Title,Category
https://example.com/image1.jpg,Product 1,Electronics
https://example.com/image2.jpg,Product 2,Clothing
https://example.com/image3.png,Product 3,Books
```

The system extracts the first column (URL column) and processes all valid HTTPS/HTTP URLs.

## How to Use

### Step 1: Switch to CSV Mode
- Click the **"🔗 CSV with URLs"** button to switch from file upload mode to CSV/URL mode

### Step 2: Upload CSV File
- Click **"Choose CSV File"** and select your CSV file
- The system will display the filename once selected

### Step 3: Select Conversion Format
- **Target Format**: Select the output image format (jpg, png, webp, gif, tiff, bmp)
- **Output Format**: Select how you want to receive the results:
  - **ZIP File**: All converted images in a compressed folder
  - **CSV Report**: Conversion details in a CSV file
  - **Excel File**: Professional report in .xlsx format

### Step 4: Convert
- Click **"⚡ Convert Images"**
- The system will:
  1. Parse your CSV file
  2. Extract all URLs
  3. Download each image
  4. Convert to selected format
  5. Generate output in requested format

### Step 5: Download Results
- Once conversion is complete, click **"⬇️ Download as [FORMAT]"**
- The button will show the selected output format

## Output Formats Explained

### ZIP File
- Contains all converted images with automatic naming (image-1.jpg, image-2.jpg, etc.)
- Best for: Bulk download and storage
- File size: Compressed for easy transfer

### CSV Report
- Contains detailed information about each conversion:
  - File Name
  - File Size (KB)
  - Conversion Status
- Best for: Tracking and documentation
- Format: Plain text CSV file

### Excel File (.xlsx)
- Professional spreadsheet format with:
  - File Name
  - File Size (KB)
  - Conversion Status
  - Conversion Time
- Best for: Professional reports and analysis
- Includes formatted headers and styled rows

## Supported Image Formats

### Input Formats (from URLs)
- JPEG, JPG
- PNG
- WebP
- GIF
- TIFF
- BMP

### Output Formats
- **JPG**: Quality optimized at 90%
- **PNG**: Maximum compression level 9
- **WebP**: Quality optimized at 90%
- **GIF**: Standard GIF format
- **TIFF**: Standard TIFF format
- **BMP**: Standard BMP format

## Limits & Specifications

| Parameter | Limit |
|-----------|-------|
| Maximum URLs per batch | 500 |
| Max file size per image | No limit (handled by server) |
| Timeout per URL download | 10 seconds |
| Supported protocols | HTTP, HTTPS |
| CSV file size | Unlimited |

## Error Handling

### Common Issues & Solutions

**"No valid URLs found in CSV file"**
- Ensure your CSV contains valid HTTP/HTTPS URLs
- Check that URLs are in the first column
- Verify URLs are properly formatted

**"Failed to download from [URL]"**
- The URL may be invalid or unreachable
- Image server might be blocking requests
- Try using a different image source
- The system will continue processing other URLs

**"Batch not found"**
- Conversion session may have expired
- Clear browser cache and try again
- Batch data is stored temporarily and cleaned up after download

## API Endpoints

### Convert Images from CSV URLs
```
POST /api/convert-urls
Content-Type: multipart/form-data

Parameters:
- csvFile: File (CSV file with URLs)
- targetFormat: string (jpg, png, webp, gif, tiff, bmp)
- outputFormat: string (zip, csv, excel)

Response:
{
  "message": "Successfully converted X/Y images",
  "batchId": "1234567890",
  "convertedPath": "converted/batch-1234567890",
  "outputFormat": "zip",
  "results": [
    {
      "url": "https://example.com/image1.jpg",
      "filename": "image-1.jpg",
      "status": "success"
    }
  ]
}
```

### Download Converted Files
```
GET /api/download/:batchId?format=zip|csv|excel

Query Parameters:
- format: string (zip, csv, or excel) - defaults to zip

Response: File download (zip, csv, or xlsx)
```

## Performance Tips

1. **Batch Size**: Process 50-100 URLs at a time for best performance
2. **URL Quality**: Ensure all URLs are valid and accessible
3. **Network**: Process during off-peak hours for faster conversions
4. **Storage**: Downloaded files are cached; clear cache periodically

## Troubleshooting

### Slow Conversion
- Check your internet connection
- Verify image URLs are accessible
- Reduce batch size to 50 URLs

### Download Not Working
- Refresh the page and try downloading again
- Check browser's download settings
- Try a different browser

### Missing Images in ZIP
- Check the conversion report (CSV/Excel) for failed conversions
- Re-upload failed URLs in a new batch
- Verify image URLs are still accessible

## Browser Support

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Internet Explorer**: Not supported

## Deployment Notes

### Render.com (Backend)
The `/api/convert-urls` endpoint is now deployed and available at:
`https://img-converter-api.onrender.com/api/convert-urls`

### Vercel (Frontend)
The updated UI with CSV/URL mode switching is deployed at:
`https://imageconverter-neon.vercel.app`

### Environment Variables
- **REACT_APP_API_URL**: Backend API base URL
  - Production: `https://img-converter-api.onrender.com`
  - Development: `http://localhost:5000`

## Dependencies Added

- `csv-parser`: ^3.0.0 (CSV file parsing)
- `exceljs`: ^4.3.0 (Excel file generation)
- `axios`: ^1.6.0 (URL image downloading)

## Future Enhancements

- [ ] Batch progress tracking with real-time updates
- [ ] Resume incomplete conversions
- [ ] Direct URL support (without CSV)
- [ ] Webhook notifications for large batches
- [ ] Scheduled conversions
- [ ] Image watermarking
- [ ] Compression level customization
