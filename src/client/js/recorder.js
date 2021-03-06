import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const actionBtn = document.querySelector("#actionBtn");
const preview = document.querySelector("#preview");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const download = (fileUrl, fileName) => {
  const a = document.createElement("a");

  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {

  actionBtn.removeEventListener("click", handleDownload);
  actionBtn.innerText = "Transcoding...";
  actionBtn.disabled = true;

  const ffmpeg = createFFmpeg({ log: true, corePath: "/static/ffmpeg-core.js" });
  await ffmpeg.load();

  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

  await ffmpeg.run("-i", files.input, "-r", "60", files.output);

  await ffmpeg.run("-i", files.input, "-ss", "00:00:01", "-frames:v", "1", files.thumb);

  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);

  const mp4Blob = new Blob([mp4File.buffer, { type: "video/mp4" }]);
  const thumbBlob = new Blob([thumbFile.buffer, { type: "image/jpg" }]);

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  download(mp4Url, "MyRecording.mp4");
  download(thumbUrl, files.thumb);

  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleStart)
};

const handleStart = () => {
  actionBtn.innerText = "Recording Now...";
  actionBtn.disabled = true;
  actionBtn.removeEventListener("click", handleStart);
  recorder = new MediaRecorder(stream, {
    mineType: "video/webm",
  });

  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    preview.srcObject = null;
    preview.src = videoFile;
    preview.loop = true;
    preview.play();
    actionBtn.innerText = "Download";
    actionBtn.disabled = false;
    actionBtn.addEventListener("click", handleDownload);
  };

  recorder.start();
  setTimeout(() => {
    recorder.stop();
  }, 5000);
};

const init = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: 288*3,
        height: 162*3,
      },
    });
    preview.srcObject = stream;
  } catch (error) {
    actionBtn.disabled = true;
    preview.remove();
    const sry = document.createElement("span");
    sry.innerText = "!Error!\nYou must allow video and audio access first!";
    sry.style.textAlign = "center";
    sry.style.color = "red";
    document.querySelector(".recorder").prepend(sry);
  }

  try {
    preview.play();
  } catch (error) {
    actionBtn.disabled = true;
    preview.remove();
    const sry = document.createElement("span");
    sry.innerText = "!Error!";
    sry.style.color = "red";
    document.querySelector(".recorder").prepend(sry);  
  }
};

init();

actionBtn.addEventListener("click", handleStart);
