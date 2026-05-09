import React, { useState } from 'react';
import axios from 'axios';
import './ImageConverter.css';

const ImageConverter = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState('png');
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [batchId, setBatchId] = useState('');

  const formats = ['jpg', 'png', 'webp', 'gif', 'tiff', 'bmp'];

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
    setError('');
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image');
      return;
    }

    if (!targetFormat) {
      setError('Please select a target format');
      return;
    }

    setConverting(true);
    setError('');
    setProgress(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });
      formData.append('targetFormat', targetFormat);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + Math.random() * 20 : prev));
      }, 200);

      const response = await axios.post('/api/convert', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearInterval(progressInterval);
      setProgress(100);

      const batchId = response.data.convertedPath.split('-')[1];
      setBatchId(batchId);
      setResult(response.data);
      setSelectedFiles([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Error converting images');
      console.error('Conversion error:', err);
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/download/${batchId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `converted-images-${batchId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
    } catch (err) {
      setError('Error downloading images');
      console.error('Download error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversion = () => {
    setResult(null);
    setBatchId('');
    setProgress(0);
    setSelectedFiles([]);
  };

  return (
    <div className="converter-container">
      <div className="converter-card">
        <div className="header">
          <h1>🖼️ Batch Image Converter</h1>
          <p>Convert multiple images to any format at once</p>
        </div>

        {!result ? (
          <div className="upload-section">
            <div className="upload-area">
              <div className="upload-icon">📁</div>
              <h2>Select Images to Convert</h2>
              <p>Support: JPEG, PNG, WebP, GIF, TIFF, BMP</p>
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
                disabled={converting}
              />
              <label className="file-label" htmlFor="file-input">
                Choose Files
              </label>
              {selectedFiles.length > 0 && (
                <p className="selected-count">
                  ✓ {selectedFiles.length} file(s) selected
                </p>
              )}
            </div>

            <div className="format-section">
              <label htmlFor="format-select">Target Format:</label>
              <select
                id="format-select"
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                disabled={converting}
                className="format-select"
              >
                {formats.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              onClick={handleConvert}
              disabled={converting || selectedFiles.length === 0}
              className="convert-button"
            >
              {converting ? (
                <>
                  <span className="spinner"></span> Converting...
                </>
              ) : (
                '⚡ Convert Images'
              )}
            </button>

            {converting && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="progress-text">{Math.round(progress)}%</p>
              </div>
            )}
          </div>
        ) : (
          <div className="result-section">
            <div className="success-icon">✅</div>
            <h2>Conversion Complete!</h2>
            <p className="result-message">{result.message}</p>

            {result.results && (
              <div className="results-list">
                <h3>Converted Files:</h3>
                <ul>
                  {result.results.map((item, idx) => (
                    <li key={idx} className={item.success ? 'success' : 'failed'}>
                      {item.success ? '✓' : '✗'} {item.filename || item.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleDownload}
              disabled={loading}
              className="download-button"
            >
              {loading ? 'Downloading...' : '⬇️ Download as ZIP'}
            </button>

            <button
              onClick={handleNewConversion}
              className="new-conversion-button"
            >
              ➕ New Conversion
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageConverter;
