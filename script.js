const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

const keys = document.querySelectorAll('.key');
const oscSelect = document.getElementById('oscillator-type');
const recordBtn = document.getElementById('record-btn');
const playBtn = document.getElementById('play-recorded-btn');

let isRecording = false;
let startTime = 0;
let recordedNotes = [];

const colors = {
    "A": "#FF5733", "W": "#FFBD33", "S": "#DBFF33", "E": "#75FF33",
    "D": "#33FF57", "F": "#33FFBD", "T": "#33DBFF", "G": "#3375FF",
    "Y": "#5733FF", "H": "#BD33FF", "U": "#FF33DB", "J": "#FF3375"
};

function initAudio() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playNote(frequency, keyChar) {
    if (!frequency || !audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = oscSelect.value;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1);

    const el = document.querySelector(`.key[data-key="${keyChar}"]`);
    if (el) {
        const colorValue = colors[keyChar] || "#3b82f6";
        el.style.setProperty('--key-color', colorValue);
        document.body.style.setProperty('--bg-color', colorValue + '33'); 
        el.classList.add('playing');
        setTimeout(() => {
            el.classList.remove('playing');
            if (!document.querySelector('.key.playing')) {
                document.body.style.setProperty('--bg-color', '#1e293b');
            }
        }, 300);
    }

    if (isRecording) {
        recordedNotes.push({ freq: frequency, key: keyChar, time: Date.now() - startTime });
    }
}

// ASIGNACIÓN DE EVENTOS
keys.forEach(key => {
    // Escuchamos pointerdown para cubrir ratón y dedo a la vez
    key.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        initAudio();
        playNote(parseFloat(key.dataset.note), key.dataset.key);
    }, { passive: false });
});

window.addEventListener('keydown', (e) => {
    const keyChar = e.key.toUpperCase();
    const el = document.querySelector(`.key[data-key="${keyChar}"]`);
    if (el && !e.repeat) {
        initAudio();
        playNote(parseFloat(el.dataset.note), keyChar);
    }
});

recordBtn.addEventListener('click', () => {
    initAudio();
    isRecording = !isRecording;
    recordBtn.textContent = isRecording ? "⏹️ Detener" : "🔴 Grabar";
    if (isRecording) {
        recordedNotes = [];
        startTime = Date.now();
        playBtn.disabled = true;
    } else {
        playBtn.disabled = recordedNotes.length === 0;
    }
});

playBtn.addEventListener('click', () => {
    initAudio();
    recordedNotes.forEach(note => {
        setTimeout(() => playNote(note.freq, note.key), note.time);
    });
});
