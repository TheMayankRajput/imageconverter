import React, { useState } from 'react';
import axios from 'axios';
import './ImageConverter.css';

const ImageConverter = () => {
  // Use environment variable for API URL (production) or fallback to localhost (development)
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [conversionMode, setConversionMode] = useState('files'); // 'files' or 'urls'
  const [targetFormat, setTargetFormat] = useState('png');
  const [outputFormat, setOutputFormat] = useState('zip'); // 'zip', 'csv', 'excel'
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [batchId, setBatchId] = useState('');

  const formats = ['jpg', 'png', 'webp', 'gif', 'tiff', 'bmp'];
  const MAX_FILES = 500;
  const outputFormats = [
    { value: 'zip', label: 'ZIP File' },
    { value: 'csv', label: 'CSV Report' },
    { value: 'excel', label: 'Excel File' }
  ];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed. You selected ${files.length}`);
      return;
    }
    setSelectedFiles(files);
    setError('');
  };

  const handleCsvChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setError('');
    }
  };

  const handleConvert = async () => {
    if (conversionMode === 'files') {
      if (selectedFiles.length === 0) {
        setError('Please select at least one image');
        return;
      }
    } else {
      if (!csvFile) {
        setError('Please select a CSV file with image URLs');
        return;
      }
    }

    if (!targetFormat) {
      setError('Please select a target format');
      return;
    }

    setConverting(true);
    setError('');
    setProgress(0);

    let progressInterval;

    try {
      const formData = new FormData();
      
      if (conversionMode === 'files') {
        selectedFiles.forEach((file) => {
          formData.append('images', file);
        });
        formData.append('targetFormat', targetFormat);
        formData.append('outputFormat', outputFormat);

        progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 95) return prev; // Stop incrementing at 95%
            return Math.min(prev + Math.random() * 15, 95);
          });
        }, 200);

        const response = await axios.post(`${API_URL}/api/convert`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        clearInterval(progressInterval);
        setProgress(100);

        const batchId = response.data.convertedPath.split('-')[1];
        setBatchId(batchId);
        setResult(response.data);
        setSelectedFiles([]);
      } else {
        // CSV mode
        formData.append('csvFile', csvFile);
        formData.append('targetFormat', targetFormat);
        formData.append('outputFormat', outputFormat);

        progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 95) return prev; // Stop incrementing at 95%
            return Math.min(prev + Math.random() * 15, 95);
          });
        }, 200);

        const response = await axios.post(`${API_URL}/api/convert-urls`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        clearInterval(progressInterval);
        setProgress(100);

        const batchId = response.data.batchId;
        setBatchId(batchId);
        setResult(response.data);
        setCsvFile(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error converting images');
      console.error('Conversion error:', err);
      clearInterval(progressInterval);
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const fileExtension = outputFormat === 'excel' ? 'xlsx' : outputFormat;
      const response = await axios.get(
        `${API_URL}/api/download/${batchId}?format=${outputFormat}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `converted-images-${batchId}.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
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
            <div className="mode-selector">
              <button
                className={`mode-btn ${conversionMode === 'files' ? 'active' : ''}`}
                onClick={() => {
                  setConversionMode('files');
                  setError('');
                  setCsvFile(null);
                }}
              >
                📁 Upload Files
              </button>
              <button
                className={`mode-btn ${conversionMode === 'urls' ? 'active' : ''}`}
                onClick={() => {
                  setConversionMode('urls');
                  setError('');
                  setSelectedFiles([]);
                }}
              >
                🔗 CSV with URLs
              </button>
            </div>

            {conversionMode === 'files' ? (
              <div className="upload-area">
                <div className="upload-icon">📁</div>
                <h2>Select Images to Convert</h2>
                <p>Support: JPEG, PNG, WebP, GIF, TIFF, BMP</p>
                <p className="file-limit">Maximum: {MAX_FILES} files per conversion</p>
                <input
                  type="file"
                  id="file-input"
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
                    ✓ {selectedFiles.length}/{MAX_FILES} file(s) selected
                  </p>
                )}
              </div>
            ) : (
              <div className="upload-area">
                <div className="upload-icon">📊</div>
                <h2>Upload CSV with Image URLs</h2>
                <p>CSV format: One URL per line or comma-separated</p>
                <input
                  type="file"
                  id="csv-input"
                  accept=".csv"
                  onChange={handleCsvChange}
                  className="file-input"
                  disabled={converting}
                />
                <label className="file-label" htmlFor="csv-input">
                  Choose CSV File
                </label>
                {csvFile && (
                  <p className="selected-count">
                    ✓ {csvFile.name} selected
                  </p>
                )}
              </div>
            )}

            <div className="format-section">
              <div className="format-row">
                <div className="format-group">
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

                <div className="format-group">
                  <label htmlFor="output-select">Output Format:</label>
                  <select
                    id="output-select"
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    disabled={converting}
                    className="format-select"
                  >
                    {outputFormats.map((fmt) => (
                      <option key={fmt.value} value={fmt.value}>
                        {fmt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              onClick={handleConvert}
              disabled={
                converting ||
                (conversionMode === 'files' ? selectedFiles.length === 0 : !csvFile)
              }
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
                    <li key={idx} className={item.status === 'success' || item.success ? 'success' : 'failed'}>
                      {item.status === 'success' || item.success ? '✓' : '✗'} {item.filename || item.url || item.error}
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
              {loading ? 'Downloading...' : `⬇️ Download as ${outputFormat.toUpperCase()}`}
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
