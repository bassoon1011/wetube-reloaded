import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const files = {
    input: "recording.webm",
    output: "output.mp4",
    thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
}

const handleDownload = async () => {

    actionBtn.removeEventListener("click", handleDownload);

    actionBtn.innerText = "Transcoding...";

    actionBtn.disabled = true;

    const ffmpeg = createFFmpeg({ log: true });
    // ffmpeg.load를 await하는 이뉴는 사용자가 스프트웨어를 사용할 것이기 때문
    await ffmpeg.load();
    // writeFile이 ffmpeg의 가상의 세계에 파일을 생성해줌
    ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile))

    await ffmpeg.run("-i", files.input, "-r", "60", files.output);

    await ffmpeg.run("-i", files.input, "-ss", "00:00:01", "-frames:v", "1", "thumbnail.jpg");

    const mp4File = ffmpeg.FS("readFile", files.output)
    const thumbFile = ffmpeg.FS("readFile", files.thumb);
 
    const mp4Blob = new Blob([mp4File.buffer], { type:"video/mp4" });
    const thumbBlob = new Blob([thumbFile.bufferl], { type: " image/jpg" });

    const mp4Url = URL.createObjectURL(mp4Blob)
    const thumbUrl = URL.createObjectURL(thumbBlob);

    downloadFile(mp4Url, "MyRecording.mp4");
    downloadFile(thumbUrl, "MyThumbnail.jpg");

    ffmpeg.FS("unlink", files.input);
    ffmpeg.FS("unlink", files.output);
    ffmpeg.FS("unlink", files.thumb);
    
    URL.revokeObjectURL(mp4Url);
    URL.revokeObjectURL(thumbUrl);
    URL.revokeObjectURL(videoFile);

    actionBtn.disabled = true;
    actionBtn.innerText = "Record Again";
    actionBtn.addEventListener("click", handleStart);
};

const handleStop = () => {
    actionBtn.innerText = "Download Recording";
    actionBtn.removeEventListener("click", handleStop);
    actionBtn.addEventListener("click", handleDownload);
    
    recorder.stop();
};

const handleStart = () => {
    actionBtn.innerText = "Stop Recording";
    actionBtn.removeEventListener("click", handleStart);
    actionBtn.addEventListener("click", handleStop);
    recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    recorder.ondataavailable = (event) => {
        //createObjectURL은 브라우저 메모리에서만 가능한 URL을 만들어준다
        videoFile = URL.createObjectURL(event.data);
        video.srcObject = null;
        video.src = videoFile;
        video.loop = true;
        video.play();
    };
    recorder.start();
    setTimeout(() => {
        recorder.stop();
    }, 5000);
};

const init = async() => {
    stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
    });
    video.srcObject = stream;
    video.play();
};

init();

actionBtn.addEventListener("click", handleStart);