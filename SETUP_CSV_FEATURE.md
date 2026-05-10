# Updated Setup Guide - CSV/URL Conversion Feature

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

## Quick Start

### 1. Install New Dependencies

The following new packages have been added to support CSV/URL conversion:

```bash
# Navigate to server directory
cd server

# Install new dependencies
npm install csv-parser exceljs axios

# Or install all dependencies fresh
npm install
```

### 2. Start Backend Server

```bash
# From server directory
npm start
# or for development with auto-reload
npm run dev
```

Server will run at: `http://localhost:5000`

### 3. Start Frontend Development Server

```bash
# From client directory (in a new terminal)
cd ../client
npm install
npm start
```

Frontend will run at: `http://localhost:3000`

## New Features Enabled

### CSV/URL Conversion Mode
- Switch between file upload and CSV URL modes using toggle buttons
- Upload CSV files with image URLs (one per line)
- Convert downloaded images to target format
- Download results in ZIP, CSV, or Excel format

### Multiple Output Formats
- **ZIP**: Compressed folder with converted images
- **CSV**: Conversion report with file details
- **Excel**: Professional .xlsx report with metadata

## Testing the New Features

### Test CSV File Format

Create a test file `test.csv`:

```csv
URL
https://via.placeholder.com/500x500.jpg?text=Image1
https://via.placeholder.com/500x500.png?text=Image2
https://via.placeholder.com/500x500.jpg?text=Image3
```

Or with headers:

```csv
ImageURL,ProductName
https://via.placeholder.com/500x500.jpg?text=Product1,Test Product 1
https://via.placeholder.com/500x500.png?text=Product2,Test Product 2
```

### Test Steps

1. Open http://localhost:3000
2. Click **"🔗 CSV with URLs"** button
3. Upload your test CSV file
4. Select target format (e.g., "png")
5. Select output format (e.g., "csv" or "excel")
6. Click "⚡ Convert Images"
7. Download the results

## Environment Configuration

### Development (.env.development)
```
REACT_APP_API_URL=http://localhost:5000
```

### Production (.env.production)
```
REACT_APP_API_URL=https://img-converter-api.onrender.com
```

## New API Endpoints

### POST /api/convert-urls
Converts images from URLs in a CSV file

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `csvFile`: CSV file with URLs
  - `targetFormat`: jpg, png, webp, gif, tiff, bmp
  - `outputFormat`: zip, csv, or excel

**Response:**
```json
{
  "message": "Successfully converted X/Y images",
  "batchId": "1234567890",
  "convertedPath": "converted/batch-1234567890",
  "outputFormat": "zip",
  "results": [...]
}
```

### GET /api/download/:batchId
Download converted images or report

**Query Parameters:**
- `format`: zip (default), csv, or excel

**Response:** File download

## Troubleshooting

### Dependencies Not Installing
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Sharp Build Issues on Windows
```bash
# Install Python and C++ build tools
# Then reinstall node-gyp dependencies
npm install --build-from-source
```

### Port Already in Use
```bash
# Change port by modifying .env or passing PORT variable
PORT=5001 npm start
```

### CORS Errors
- Verify the frontend URL is in server's CORS origins list
- Check that API_URL is correctly set in frontend .env file

## Deployment to Production

### Render.com (Backend)

1. Connect GitHub repo to Render
2. Set environment variables:
   - `NODE_ENV`: production
   - `PORT`: 5000 (default)
3. Build command: `cd server && npm install`
4. Start command: `npm start`

### Vercel (Frontend)

1. Connect GitHub repo to Vercel
2. Set project root to `./client`
3. Environment variable:
   - `REACT_APP_API_URL`: https://img-converter-api.onrender.com
4. Deploy with `npm run build`

## File Structure

```
ImgConverter/
├── server/
│   ├── index.js (Updated with /api/convert-urls endpoint)
│   ├── package.json (Updated with new dependencies)
│   └── uploads/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageConverter.js (Updated with CSV mode)
│   │   │   └── ImageConverter.css (Updated styling)
│   │   └── index.js
│   ├── package.json
│   └── .env.production
├── CSV_URL_CONVERSION.md (New - Feature documentation)
└── DEPLOYMENT.md
```

## Performance Optimization

### For Large Batches
- Process in smaller batches (50-100 URLs at a time)
- Schedule conversions during off-peak hours
- Monitor server memory usage

### Caching
- Converted files are stored temporarily in `converted/` directory
- Clean up old batches periodically with `/api/cleanup` endpoint

## Monitoring

### Server Logs
- Conversion start/end times
- Error messages for failed conversions
- Download requests and formats

### Client Metrics
- Conversion progress percentage
- File selection counts
- Download completion status

## Support & Documentation

- **API Documentation**: See `/api/` endpoints in ImageConverter.js
- **Feature Guide**: Read CSV_URL_CONVERSION.md
- **Deployment Guide**: Read DEPLOYMENT.md
- **Quick Start**: Read QUICKSTART.md

## Next Steps

1. Install dependencies: `npm install`
2. Test CSV/URL conversion locally
3. Deploy to Render and Vercel
4. Update production URLs if needed
5. Test with real URLs from your CSV file

## Additional Resources

- Sharp documentation: https://sharp.pixelplumbing.com/
- ExcelJS documentation: https://github.com/exceljs/exceljs
- Express.js documentation: https://expressjs.com/
- React documentation: https://reactjs.org/
