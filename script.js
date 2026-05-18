const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

async function convert() {
  const fileInput = document.getElementById("fileInput");
  const type = document.getElementById("convertType").value;
  const file = fileInput.files[0];

  if (!file) {
    alert("Upload a file first");
    return;
  }

  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  const inputName = "input";
  ffmpeg.FS("writeFile", inputName, await fetchFile(file));

  let outputName = "";

  if (type === "mp4-mp3") {
    outputName = "output.mp3";
    await ffmpeg.run("-i", inputName, outputName);
  }

  if (type === "video-gif") {
    outputName = "output.gif";
    await ffmpeg.run("-i", inputName, outputName);
  }

  if (type.startsWith("image")) {
    convertImage(file, type);
    return;
  }

  const data = ffmpeg.FS("readFile", outputName);

  const url = URL.createObjectURL(new Blob([data.buffer]));

  const link = document.getElementById("downloadLink");
  link.href = url;
  link.download = outputName;
  link.style.display = "block";
  link.innerText = "Download File";
}

function convertImage(file, type) {
  const img = new Image();
  const reader = new FileReader();

  reader.onload = function(e) {
    img.src = e.target.result;
  };

  img.onload = function() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    let format = "image/png";
    if (type === "image-jpg") format = "image/jpeg";

    const url = canvas.toDataURL(format);

    const link = document.getElementById("downloadLink");
    link.href = url;
    link.download = "converted";
    link.style.display = "block";
    link.innerText = "Download Image";
  };

  reader.readAsDataURL(file);
}
