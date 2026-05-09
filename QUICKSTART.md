# Batch Image Converter - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
npm run install-all
```

### Step 2: Start the Application
```bash
npm start
```

This will automatically start:
- Backend Server on http://localhost:5000
- React Frontend on http://localhost:3000

### Step 3: Start Converting!
1. Open http://localhost:3000 in your browser
2. Select multiple image files
3. Choose your target format
4. Click "Convert Images"
5. Download the ZIP file

---

## 📋 System Requirements

- Node.js v14+ ([Download](https://nodejs.org/))
- npm v6+ (comes with Node.js)
- Modern web browser (Chrome, Firefox, Safari, or Edge)

---

## 🛠️ Common Commands

```bash
# Install all dependencies
npm run install-all

# Start both server and client
npm start

# Start only the server
cd server && npm start

# Start only the client
cd client && npm start

# Development mode with auto-reload (server only)
cd server && npm run dev
```

---

## 🎯 Features Explained

### File Upload
- Select single or multiple image files at once
- Supported formats: JPEG, PNG, WebP, GIF, TIFF, BMP
- Up to 500 images per conversion

### Format Selection
- Choose from 6 different output formats
- Each format optimized with best quality settings
- Real-time format preview

### Batch Conversion
- Converts all images simultaneously
- Progress indicator shows real-time status
- Automatic error handling for individual files

### Download
- All converted images packaged in a single ZIP file
- Easy one-click download
- Original filenames preserved (only extension changed)

---

## 🔧 Customization

### Change Server Port
Edit `server/.env`:
```
PORT=5001
```

### Adjust Image Quality
Edit `server/index.js` in the `/api/convert` route to modify quality settings for different formats.

### Modify UI Colors
Edit `client/src/components/ImageConverter.css` to customize the color scheme.

---

## ❓ Frequently Asked Questions

**Q: Can I convert .ico files?**  
A: Not currently, but you can easily extend it by adding the `ico` format to Sharp library.

**Q: What's the file size limit?**  
A: Limited only by available system RAM. Typically handles images up to 100MB+ each.

**Q: Can I use this on mobile?**  
A: The UI is responsive, but file upload limitations depend on your browser.

**Q: How are files stored?**  
A: Temporarily in `/server/uploads/` during processing, then converted images in `/server/converted/`.

---

## 📞 Need Help?

1. Check the main [README.md](README.md) for detailed documentation
2. Check server terminal for error messages
3. Check browser console (F12) for frontend errors
4. Ensure all dependencies are installed: `npm run install-all`

---

Enjoy converting! 🎉
