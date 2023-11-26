

// toggles
let toggler = false;
let pausePlay = false;
let timer;
let timer1;
let isRecording = false;

let isPaused = false;
/////////////////


let isRunning = false;
let seconds = 0;
let minutes = 0;
let hours = 0;

let updated_hours = hours;
let updated_minuts = minutes;
let updated_seconds = seconds;



let mediaRecorder;
let audioStream;
let chunks = [];

/////Elements//////

let start_recording = "Start Recording";

const start_stop_text = document.getElementById('text-start-rec');
const cross_icon = document.getElementById('cross_icon');
const recording_div = document.getElementById('show-record-animation');
const red_circle = document.getElementById('red-circ')
let pause = document.getElementById('pause');
const play = document.getElementById('play');
const uplaod_btn = document.getElementById('upload-btn');
const upload_input = document.createElement('input');
const audio = document.getElementById('audio');
upload_input.type = "file";
upload_input.accept = "audio/*";

//////////////////////////////////////////////////
function UpdateTime() {

    timer = setInterval(() => {
        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }
        if (minutes === 60) {
            minutes = 0;
            hours++;
        }
        seconds++
        document.getElementById('show-time').textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);





}

function resetTimer() {
    clearInterval(timer)
    hours = 0;
    minutes = 0;
    seconds = 0;
    document.getElementById('show-time').textContent = `${hours}:${minutes}:${seconds}`;
}

function show_paused_timer(passed_timer) {
    clearInterval(passed_timer);
    updated_hours = hours;
    updated_minuts = minutes;
    updated_seconds = seconds;
    document.getElementById('show-time').textContent = `${updated_hours}:${updated_minuts}:${updated_seconds}`;
}

function start_after_pause() {

    timer = setInterval(() => {
        if (updated_seconds === 60) {
            updated_seconds = 0;
            updated_minuts++;
            minutes++
        }
        if (updated_minuts === 60) {
            updated_minuts = 0;
            updated_hours++;
            hours++;
        }
        updated_seconds++
        seconds++;

        document.getElementById('show-time').textContent = `${updated_hours}:${updated_minuts}:${updated_seconds}`;
    }, 1000);


}



function PauseTimer() {
    pausePlay = !pausePlay;

    if (pausePlay) {
        console.log(pause)
        pause.style.display = 'none';
        play.style.display = 'inline';
        StopAnimation();
        pauseRecording();
        show_paused_timer(timer);
    }
    else {
        pause.style.display = 'inline';
        play.style.display = 'none';
        Start_animation();
        start_after_pause();
        resumeRecording();
    }



}



function StopAnimation() {
    let box = document.querySelectorAll('.box')
    box.forEach(element => {
        element.style.animationPlayState = "paused";

    });
}
function Start_animation() {
    let box = document.querySelectorAll('.box')
    box.forEach(element => {
        element.style.animationPlayState = "running";

    });
}

let stop_mic = () => {
    let anoter_media = mediaRecorder;
    let second_stream = audioStream;

    start_stop_text.textContent = 'Start Recording'
    red_circle.style.display = 'flex'
    recording_div.style.display = 'none';
    cross_icon.style.display = 'none';
    resetTimer();
    anoter_media.onstop = () => {

        console.log("stopped");
        anoter_media.stop();
        second_stream.getTracks().forEach(track => track.stop());
    };
    mediaRecorder.stop();
    // mediaRecorder.stop();
    toggler = false;
    isRecording = false;


}
let handleMic = () => {

    toggler = !toggler

    console.log(toggler)
    if (toggler) {
        start_stop_text.textContent = 'Stop Recording';
        red_circle.style.display = 'none'
        recording_div.style.display = 'flex';
        cross_icon.style.display = 'inline';
        console.log(cross_icon);
        startRecording();
        UpdateTime();
    }
    else {
        start_stop_text.textContent = start_recording;

        console.log('hi')
        recording_div.style.display = 'none';
        red_circle.style.display = 'flex'
        cross_icon.style.display = 'none';
        resetTimer();
        Start_animation()
        stopRecording();

    }

}



async function startRecording() {
    try {
        if (!isRecording) {
            if (isPaused) {
                mediaRecorder = new MediaRecorder(audioStream);
                isPaused = false;
            } else {
                chunks = [];
                audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(audioStream);
                mediaRecorder.ondataavailable = (event) => {
                    chunks.push(event.data);
                };
            }

            mediaRecorder.onstop = () => {

                console.log("stopped");
                stopRecording();
                audioStream.getTracks().forEach(track => track.stop());
            };



            if (!isPaused) {
                mediaRecorder.start();

            }

            isRecording = true;
        }
    } catch (error) {
        console.error("Error accessing the microphone:", error);
    }
}


function checkMicrophoneState() {
    if (!audioStream) {
        console.log("Microphone is off");
    } else {
        console.log("Microphone is on");
    }
}


function saveRecording() {
    mediaRecorder.stop()
    console.log(chunks);
    if (chunks.length > 0) {
        const blob = new Blob(chunks, { type: "audio/wav" });
        saveAs(blob, "recording.wav");
    }
}

function pauseRecording() {
    if (isRecording) {
        mediaRecorder.pause();
        isPaused = true;

    }
}

function resumeRecording() {
    if (isPaused) {
        mediaRecorder.resume();
        isPaused = false;

    }
}

function stopRecording() {
    if (isRecording) {

        mediaRecorder.stop();
        saveRecording();
        isRecording = false;
    }
    saveRecording();
}

uplaod_btn.addEventListener("click", () => {
    upload_input.click();
})

function send_dat(blob) {
    const key = 'OPENAI-API-KEY-HERE'; // Replace with your actual OpenAI API key
    const url = `'https://api.openai.com/v1/audio/transcriptions/'${key}`
    const formData = new FormData();
    formData.append('file', blob); // Assuming 'blob' represents your .wav file

    fetch(url, {
        method: 'POST',

        body: formData,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log(data); // Handle the transcription data here
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
upload_input.addEventListener("change", () => {
    let file = upload_input.files[0];
    console.log(file);
    let url;
    try {
        if (file) {
            console.log(file);
            url = URL.createObjectURL(file);
            console.log(url);
            audio.src = url;
            // send_dat(file);
            handle_audio_file(file);

        }

    } catch (error) {
        console.log("uncalble to get the file")
    }



})


function handle_audio_file(file) {
    if (file.type === 'audio/mp3' || file.type === 'audio/wav' || file.name.endsWith('.mp3') || file.name.endsWith('.wav')) {
        // File is an audio file
        console.log('File is an audio file:', file.name);

        // Now, you can use the Fetch API to send the file to a URL
        const formData = new FormData();
        formData.append('audioFile', file);

        // Replace 'YOUR_SERVER_URL' with the actual URL where you want to send the file
        const serverUrl = '/handle_audio_file';

        fetch(serverUrl, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                console.log('File uploaded successfully:', data);
            })
            .catch(error => {
                console.error('Error uploading file:', error);
            });

    } else {
        // File is not an audio file
        console.error('Selected file is not an audio file or has an unsupported format:', file.name);
    }
}