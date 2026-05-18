const fileInput = document.getElementById('fileInput');
const dropArea = document.getElementById('dropArea');
const detectedSection = document.getElementById('detectedSection');
const fileName = document.getElementById('fileName');
const fileTypeBadge = document.getElementById('fileTypeBadge');
const targetFormats = document.getElementById('targetFormats');
const convertBtn = document.getElementById('convertBtn');
const progressWrap = document.getElementById('progressWrap');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const resultCard = document.getElementById('resultCard');
const resultMeta = document.getElementById('resultMeta');
const downloadBtn = document.getElementById('downloadBtn');
const optionsPanel = document.getElementById('optionsPanel');
const themeToggle = document.getElementById('themeToggle');

let currentFile = null;
let selectedFormat = null;
let resultBlob = null;

/* THEME */

if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {

  document.body.classList.toggle('light');

  const light = document.body.classList.contains('light');

  localStorage.setItem('theme', light ? 'light' : 'dark');

  themeToggle.textContent = light ? '☀️' : '🌙';

});

/* FILE TYPES */

const FILE_TYPES = {

  image: {
    formats: ['png','jpg','jpeg','webp','gif','bmp','svg','heic','avif','ico'],
    outputs: ['png','jpg','webp','gif','bmp','ico','pdf']
  },

  video: {
    formats: ['mp4','mov','avi','webm','mkv'],
    outputs: ['mp4','webm','gif','mp3']
  },

  audio: {
    formats: ['mp3','wav','ogg','flac','aac'],
    outputs: ['mp3','wav','ogg']
  },

  document: {
    formats: ['pdf','docx','epub'],
    outputs: ['pdf','docx','epub']
  }

};

/* DROPZONE */

['dragenter','dragover'].forEach(event => {

  dropArea.addEventListener(event, e => {
    e.preventDefault();
    dropArea.classList.add('dragging');
  });

});

['dragleave','drop'].forEach(event => {

  dropArea.addEventListener(event, e => {
    e.preventDefault();
    dropArea.classList.remove('dragging');
  });

});

fileInput.addEventListener('change', e => {
  handleFile(e.target.files[0]);
});

dropArea.addEventListener('drop', e => {
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

/* HANDLE FILE */

function handleFile(file) {

  currentFile = file;

  const ext = file.name.split('.').pop().toLowerCase();

  const category = detectCategory(ext);

  fileName.textContent = file.name;

  fileTypeBadge.textContent = category.toUpperCase();

  detectedSection.classList.remove('hidden');

  resultCard.classList.add('hidden');

  buildTargets(category, ext);

  if (category === 'image') {
    optionsPanel.classList.remove('hidden');
  } else {
    optionsPanel.classList.add('hidden');
  }

}

/* DETECT CATEGORY */

function detectCategory(ext) {

  for (const [key,val] of Object.entries(FILE_TYPES)) {

    if (val.formats.includes(ext)) {
      return key;
    }

  }

  return 'unknown';

}

/* BUILD TARGETS */

function buildTargets(category, currentExt) {

  targetFormats.innerHTML = '';

  if (!FILE_TYPES[category]) return;

  FILE_TYPES[category].outputs.forEach(fmt => {

    if (fmt === currentExt) return;

    const btn = document.createElement('button');

    btn.className = 'target-btn';

    btn.textContent = fmt.toUpperCase();

    btn.onclick = () => {

      document
        .querySelectorAll('.target-btn')
        .forEach(el => el.classList.remove('active'));

      btn.classList.add('active');

      selectedFormat = fmt;

    };

    targetFormats.appendChild(btn);

  });

}

/* CONVERT */

convertBtn.addEventListener('click', async () => {

  if (!currentFile || !selectedFormat) {
    alert('Please select a target format');
    return;
  }

  progressWrap.classList.remove('hidden');

  updateProgress(20, 'Reading file...');

  await delay(500);

  updateProgress(60, 'Converting...');

  const blob = await fakeConvert(currentFile, selectedFormat);

  updateProgress(100, 'Done!');

  resultBlob = blob;

  resultCard.classList.remove('hidden');

  resultMeta.textContent = `${selectedFormat.toUpperCase()} • ${(blob.size / 1024).toFixed(1)} KB`;

  downloadBtn.onclick = () => {

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = changeExt(currentFile.name, selectedFormat);

    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 3000);

  };

});

/* SIMPLE IMAGE CONVERSION */

async function fakeConvert(file, format) {

  const ext = file.name.split('.').pop().toLowerCase();

  const category = detectCategory(ext);

  if (category !== 'image') {
    return file;
  }

  const img = new Image();

  const dataURL = await readAsDataURL(file);

  img.src = dataURL;

  await img.decode();

  const canvas = document.createElement('canvas');

  const ctx = canvas.getContext('2d');

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img,0,0);

  const mime = mimeFor(format);

  return new Promise(resolve => {

    canvas.toBlob(blob => {
      resolve(blob);
    }, mime, .92);

  });

}

/* HELPERS */

function updateProgress(percent,text) {

  progressBar.style.width = percent + '%';

  progressText.textContent = text;

}

function delay(ms) {
  return new Promise(r => setTimeout(r,ms));
}

function changeExt(name,ext) {
  return name.replace(/\.[^/.]+$/, '') + '.' + ext;
}

function readAsDataURL(file) {

  return new Promise(resolve => {

    const reader = new FileReader();

    reader.onload = e => resolve(e.target.result);

    reader.readAsDataURL(file);

  });

}

function mimeFor(fmt) {

  return {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    bmp: 'image/bmp'
  }[fmt] || 'image/png';

}
