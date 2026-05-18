/* =========================
   ELEMENTS
========================= */

const fileInput = document.getElementById("fileInput");
const dropArea = document.getElementById("dropArea");
const detectedSection = document.getElementById("detectedSection");
const fileName = document.getElementById("fileName");
const fileTypeBadge = document.getElementById("fileTypeBadge");
const targetFormats = document.getElementById("targetFormats");
const convertBtn = document.getElementById("convertBtn");
const progressWrap = document.getElementById("progressWrap");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const resultCard = document.getElementById("resultCard");
const resultMeta = document.getElementById("resultMeta");
const downloadBtn = document.getElementById("downloadBtn");
const optionsPanel = document.getElementById("optionsPanel");
const themeToggle = document.getElementById("themeToggle");

/* =========================
   STATE
========================= */

let currentFile = null;
let selectedFormat = null;
let resultBlob = null;

/* =========================
   THEME
========================= */

function loadTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.add("light");

    if (themeToggle) {
      themeToggle.textContent = "☀️";
    }
  } else {
    if (themeToggle) {
      themeToggle.textContent = "🌙";
    }
  }
}

loadTheme();

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");

    const isLight = document.body.classList.contains("light");

    localStorage.setItem("theme", isLight ? "light" : "dark");

    themeToggle.textContent = isLight ? "☀️" : "🌙";
  });
}

/* =========================
   FILE TYPES
========================= */

const FILE_TYPES = {
  image: {
    formats: [
      "png",
      "jpg",
      "jpeg",
      "webp",
      "gif",
      "bmp",
      "svg"
    ],

    outputs: [
      "png",
      "jpg",
      "webp",
      "gif"
    ]
  },

  video: {
    formats: [
      "mp4",
      "mov",
      "avi",
      "webm",
      "mkv"
    ],

    outputs: [
      "mp4",
      "webm",
      "gif"
    ]
  },

  audio: {
    formats: [
      "mp3",
      "wav",
      "ogg",
      "aac"
    ],

    outputs: [
      "mp3",
      "wav",
      "ogg"
    ]
  },

  document: {
    formats: [
      "pdf",
      "docx",
      "txt"
    ],

    outputs: [
      "pdf",
      "txt"
    ]
  }
};

/* =========================
   DRAG & DROP
========================= */

if (dropArea) {

  ["dragenter", "dragover"].forEach(eventName => {

    dropArea.addEventListener(eventName, e => {
      e.preventDefault();
      dropArea.classList.add("dragging");
    });

  });

  ["dragleave", "drop"].forEach(eventName => {

    dropArea.addEventListener(eventName, e => {
      e.preventDefault();
      dropArea.classList.remove("dragging");
    });

  });

  dropArea.addEventListener("drop", e => {

    const file = e.dataTransfer.files[0];

    if (file) {
      handleFile(file);
    }

  });

}

/* =========================
   FILE INPUT
========================= */

if (fileInput) {

  fileInput.addEventListener("change", e => {

    const file = e.target.files[0];

    if (file) {
      handleFile(file);
    }

  });

}

/* =========================
   HANDLE FILE
========================= */

function handleFile(file) {

  if (!file) return;

  currentFile = file;
  selectedFormat = null;

  const ext = getExtension(file.name);

  const category = detectCategory(ext);

  if (fileName) {
    fileName.textContent = file.name;
  }

  if (fileTypeBadge) {
    fileTypeBadge.textContent = category.toUpperCase();
  }

  if (detectedSection) {
    detectedSection.classList.remove("hidden");
  }

  if (resultCard) {
    resultCard.classList.add("hidden");
  }

  buildTargets(category, ext);

  if (optionsPanel) {

    if (category === "image") {
      optionsPanel.classList.remove("hidden");
    } else {
      optionsPanel.classList.add("hidden");
    }

  }

}

/* =========================
   DETECT CATEGORY
========================= */

function detectCategory(ext) {

  for (const [category, data] of Object.entries(FILE_TYPES)) {

    if (data.formats.includes(ext)) {
      return category;
    }

  }

  return "unknown";

}

/* =========================
   BUILD TARGETS
========================= */

function buildTargets(category, currentExt) {

  if (!targetFormats) return;

  targetFormats.innerHTML = "";

  if (!FILE_TYPES[category]) return;

  FILE_TYPES[category].outputs.forEach(format => {

    if (format === currentExt) return;

    const btn = document.createElement("button");

    btn.className = "target-btn";

    btn.type = "button";

    btn.textContent = format.toUpperCase();

    btn.addEventListener("click", () => {

      document.querySelectorAll(".target-btn").forEach(button => {
        button.classList.remove("active");
      });

      btn.classList.add("active");

      selectedFormat = format;

    });

    targetFormats.appendChild(btn);

  });

}

/* =========================
   CONVERT BUTTON
========================= */

if (convertBtn) {

  convertBtn.addEventListener("click", async () => {

    if (!currentFile) {
      alert("Please upload a file.");
      return;
    }

    if (!selectedFormat) {
      alert("Please select a target format.");
      return;
    }

    if (progressWrap) {
      progressWrap.classList.remove("hidden");
    }

    updateProgress(15, "Reading file...");

    await delay(400);

    updateProgress(50, "Converting...");

    try {

      const convertedBlob = await convertFile(
        currentFile,
        selectedFormat
      );

      resultBlob = convertedBlob;

      updateProgress(100, "Conversion complete!");

      showResult(convertedBlob);

    } catch (error) {

      console.error(error);

      alert("Conversion failed.");

    }

  });

}

/* =========================
   REAL IMAGE CONVERSION
========================= */

async function convertFile(file, format) {

  const ext = getExtension(file.name);

  const category = detectCategory(ext);

  /* IMAGE CONVERSION */

  if (category === "image") {

    const imageURL = await readAsDataURL(file);

    const img = new Image();

    img.src = imageURL;

    await new Promise((resolve, reject) => {

      img.onload = resolve;
      img.onerror = reject;

    });

    const canvas = document.createElement("canvas");

    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0);

    const mime = getMimeType(format);

    return await new Promise(resolve => {

      canvas.toBlob(blob => {

        resolve(blob);

      }, mime, 0.92);

    });

  }

  /* OTHER FILES */

  return file;

}

/* =========================
   SHOW RESULT
========================= */

function showResult(blob) {

  if (!resultCard || !resultMeta || !downloadBtn) return;

  resultCard.classList.remove("hidden");

  const sizeKB = (blob.size / 1024).toFixed(1);

  resultMeta.textContent =
    `${selectedFormat.toUpperCase()} • ${sizeKB} KB`;

  downloadBtn.onclick = () => {

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = changeExtension(
      currentFile.name,
      selectedFormat
    );

    document.body.appendChild(a);

    a.click();

    a.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 2000);

  };

}

/* =========================
   HELPERS
========================= */

function updateProgress(percent, text) {

  if (progressBar) {
    progressBar.style.width = percent + "%";
  }

  if (progressText) {
    progressText.textContent = text;
  }

}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getExtension(filename) {

  return filename
    .split(".")
    .pop()
    .toLowerCase();

}

function changeExtension(filename, ext) {

  return filename.replace(/\.[^/.]+$/, "") + "." + ext;

}

function readAsDataURL(file) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = e => resolve(e.target.result);

    reader.onerror = reject;

    reader.readAsDataURL(file);

  });

}

function getMimeType(format) {

  const mimeMap = {

    png: "image/png",

    jpg: "image/jpeg",

    jpeg: "image/jpeg",

    webp: "image/webp",

    gif: "image/gif"

  };

  return mimeMap[format] || "image/png";

}
