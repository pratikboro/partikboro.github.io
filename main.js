// main.js — shared utilities for Convertly

window.Convertly = {

  // Format file size
  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  // Trigger download of a blob
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  },

  // Trigger download of a data URL
  downloadDataURL(dataURL, filename) {
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = filename;
    a.click();
  },

  // Change file extension
  changeExt(filename, newExt) {
    return filename.replace(/\.[^/.]+$/, '') + '.' + newExt;
  },

  // Load a file as ArrayBuffer
  readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  },

  // Load a file as DataURL
  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Load a file as text
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  // Load an image from dataURL → Image element
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  },

  // Draw image to canvas and return blob
  async imageToBlob(img, mimeType, quality = 0.92) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (mimeType === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    return new Promise(resolve => canvas.toBlob(resolve, mimeType, quality));
  },

  // Setup drag & drop + click for a drop zone
  setupDropZone(dropArea, onFile, acceptedTypes = null) {
    const input = dropArea.querySelector('input[type="file"]');

    dropArea.addEventListener('dragover', e => {
      e.preventDefault();
      dropArea.classList.add('dragging');
    });
    dropArea.addEventListener('dragleave', () => dropArea.classList.remove('dragging'));
    dropArea.addEventListener('drop', e => {
      e.preventDefault();
      dropArea.classList.remove('dragging');
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    });

    if (input) {
      input.addEventListener('change', () => {
        if (input.files[0]) onFile(input.files[0]);
      });
    }
  },

  // Show progress
  showProgress(pWrap, pBar, pLabel, percent, label) {
    pWrap.style.display = 'block';
    pBar.style.width = percent + '%';
    pLabel.textContent = label;
  },

  // Show result card
  showResult(resultArea, filename, meta, downloadFn) {
    resultArea.style.display = 'block';
    resultArea.querySelector('.result-name').textContent = filename;
    resultArea.querySelector('.result-meta').textContent = meta;
    const btn = resultArea.querySelector('.download-btn');
    btn.onclick = downloadFn;
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  // Read URL params
  getParams() {
    const p = new URLSearchParams(window.location.search);
    return { from: p.get('from') || '', to: p.get('to') || '' };
  },

  // Set select values from URL params
  applyParams(fromSelect, toSelect) {
    const { from, to } = this.getParams();
    if (from && fromSelect) {
      [...fromSelect.options].forEach(o => { if (o.value === from) fromSelect.value = from; });
    }
    if (to && toSelect) {
      [...toSelect.options].forEach(o => { if (o.value === to) toSelect.value = to; });
    }
  },

  // Canvas to data URL with mime
  mimeForFormat(fmt) {
    const map = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      gif: 'image/gif',
      bmp: 'image/bmp',
      ico: 'image/x-icon',
      avif: 'image/avif',
    };
    return map[fmt.toLowerCase()] || 'image/png';
  }
};
