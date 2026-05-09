# 🖼️ Batch Image Converter

A powerful Node.js + React application that converts multiple images from one format to another in bulk. Perfect for converting entire folders of images at once!

## Features

✨ **Batch Processing** - Convert multiple images at once (up to 500)
✨ **Multiple Formats** - Support for JPEG, PNG, WebP, GIF, TIFF, and BMP
✨ **Auto Quality** - Intelligent compression settings for each format
✨ **One-Click Download** - Download all converted images as a ZIP file
✨ **Real-time Progress** - Visual progress indicator during conversion
✨ **Beautiful UI** - Modern, responsive, and user-friendly interface

## Supported Formats

- JPEG / JPG
- PNG
- WebP
- GIF
- TIFF
- BMP

## Project Structure

```
ImgConverter/
├── server/                 # Express.js backend
│   ├── index.js           # Main server file
│   ├── package.json       # Server dependencies
│   ├── .env               # Environment variables
│   ├── uploads/           # Temporary upload directory
│   └── converted/         # Converted images storage
├── client/                # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js         # Main App component
│   │   ├── App.css        # App styles
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   └── package.json       # Client dependencies
└── package.json           # Root package.json for running both
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

### 1. Install Dependencies

Navigate to the project directory and run:

```bash
npm run install-all
```

This will install dependencies for the root project, server, and client.

### 2. Alternative Installation (Manual)

If the above doesn't work, run these commands separately:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Running the Application

### Option 1: Run Both Server and Client (Recommended)

From the root directory:

```bash
npm start
```

This will start both the backend server (port 5000) and React frontend (port 3000) concurrently.

### Option 2: Run Server and Client Separately

**Terminal 1 - Start the server:**
```bash
cd server
npm start
```

**Terminal 2 - Start the client:**
```bash
cd client
npm start
```

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Click on "Choose Files" to select images from your computer
3. You can select multiple files at once
4. Choose your target format (JPEG, PNG, WebP, etc.)
5. Click "Convert Images" to start the conversion
6. Wait for the conversion to complete
7. Click "Download as ZIP" to download all converted images
8. The ZIP file contains all your converted images

## API Endpoints

### POST `/api/convert`
Converts uploaded images to the specified format.

**Request:**
- `images` (multipart): Array of image files
- `targetFormat` (form-data): Target format (jpg, png, webp, gif, tiff, bmp)

**Response:**
```json
{
  "message": "Successfully converted 10/10 images",
  "convertedPath": "converted/batch-1234567890",
  "results": [
    { "success": true, "filename": "image1.png" },
    { "success": false, "filename": "image2.jpg", "error": "Error message" }
  ]
}
```

### GET `/api/download/:batchId`
Downloads converted images as a ZIP file.

**Parameters:**
- `batchId`: The batch ID from the conversion response

**Response:** ZIP file containing all converted images

### POST `/api/cleanup`
Cleans up old uploaded files.

### GET `/api/health`
Health check endpoint.

## Configuration

### Server Configuration

Edit `server/.env` to configure:

```
PORT=5000
NODE_ENV=development
```

### Max File Size

The current configuration allows:
- Max 500 files per conversion
- No specific file size limit (depends on system RAM)

To modify, edit `server/index.js` - look for the multer configuration.

## Image Format Options

- **JPEG**: Compressed format, best for photographs (quality: 90%)
- **PNG**: Lossless format, best for graphics and transparency (compression: 9)
- **WebP**: Modern format with excellent compression (quality: 90%)
- **GIF**: Animated or simple graphics
- **TIFF**: High-quality format, commonly used in professional settings
- **BMP**: Uncompressed bitmap format

## Troubleshooting

### Issue: "Cannot find module" error

**Solution:** Make sure all dependencies are installed:
```bash
npm run install-all
```

### Issue: Port already in use

**Solution:** Change the port in `server/.env`:
```
PORT=5001
```

### Issue: Images not converting

**Solution:** 
- Check server logs for errors
- Ensure image format is supported
- Try with a smaller file size first

### Issue: Download not working

**Solution:**
- Check browser console for errors
- Ensure pop-ups are not blocked
- Try a different browser

## Performance Tips

- For batch processing large numbers of images, consider increasing Node.js memory:
  ```bash
  node --max-old-space-size=4096 index.js
  ```

- For very large images (>10MB), process in smaller batches

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Technologies Used

### Backend
- **Express.js** - Web framework
- **Sharp** - Image processing
- **Multer** - File upload handling
- **Archiver** - ZIP file creation
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **Axios** - HTTP client
- **CSS3** - Styling with animations

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please check:
1. The troubleshooting section above
2. Server logs in the terminal
3. Browser console for frontend errors

---

**Happy Converting!** 🎉
