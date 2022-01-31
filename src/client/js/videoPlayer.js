const video = document.querySelector("video");
const playBtn = document.querySelector("#play");
const playBtnIcon = document.querySelector("#play i");
const muteBtn = document.querySelector("#mute");
const muteBtnIcon = document.querySelector("#mute i");
const volumeRange = document.querySelector("#volume");
const currentTime = document.querySelector("#currenTime")
const totalTime = document.querySelector("#totalTime")
const timeline = document.querySelector("#timeline");
const fullscreenBtn = document.querySelector("#fullScreen");
const fullscreenBtnIcon = document.querySelector("#fullScreen i");
const videoContainer = document.querySelector("#videoContainer")
const videoControllers = document.querySelector("#videoControls")

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const formatTime = (second) => {
  return new Date(second * 1000).toISOString().substring(14, 19);
};

const handlePlayClick = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMute = () => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const { target: { value } } = event;
  if (video.muted) {
    video.muted = false;
    muteBtnIcon.classList = "fas fa-volume-up";
  }

  if (value === String(0)) {
    video.muted = true;
    muteBtnIcon.classList = "fas fa-volume-mute";
  }

  volumeValue = value;
  video.volume = value;
};

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(video.duration);
  timeline.max = video.duration;
}

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(video.currentTime);
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = () => {
  video.currentTime = Math.floor(timeline.value);
};

const handleFullScreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
  } else {
    videoContainer.requestFullscreen();
  }

  fullscreenBtnIcon.classList = document.fullscreenElement ? "fas fa-expand" : "fas fa-compress";
};

const hideControls = () => videoControllers.classList.remove("showing");

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControllers.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 2000);
};

const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls , 2000);
};

const handleKeydown = (event) => {
  const { key } = event;
  if (key === " ") {
    handlePlayClick();
  } else if (key === "f" || key === "F") {
    handleFullScreen();
  } else if (key === "m" || key === "M") {
    handleMute();
  } else if (key === "ArrowRight") {
    video.currentTime += 5;
    handleTimeUpdate();
  } else if (key === "ArrowLeft") {
    video.currentTime -= 5;
    handleTimeUpdate();
  }
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("timeupdate", handleTimeUpdate);
timeline.addEventListener("input", handleTimelineChange);
fullscreenBtn.addEventListener("click", handleFullScreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
document.addEventListener("keydown", handleKeydown);
video.addEventListener("ended", handleEnded);

const setReadyState = setInterval(() => {
  if (video.readyState == 4) {
    handleLoadedMetadata();
    clearInterval(setReadyState);
  }
}, 100);
