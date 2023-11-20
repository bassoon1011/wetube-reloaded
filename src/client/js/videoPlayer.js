const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volume = document.getElementById("volume");

const handlePlay = (e) => {
    // if the video is playing,pause it
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
    // else play the video
};

const handleMute = (e) => {
    a
}

playBtn.addEventListener("click", handlePlay);
muteBtn.addEventListener("click", handleMute);