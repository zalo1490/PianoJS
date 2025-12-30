const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx; // Lo inicializaremos tras el primer toque

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

// Inicialización segura del audio
function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playNote(frequency, keyChar) {
    if (!frequency || !audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = oscSelect.value;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1);

    // Animación visual
    const el = document.querySelector(`.key[data-key="${keyChar}"]`);
    if (el) {
        const colorValue = colors[keyChar] || "#3b82f6";
        el.style.setProperty('--key-color', colorValue);
        document.body.style.setProperty('--bg-color', colorValue + '33'); 
        el.classList.add('playing');
        setTimeout(() => el.classList.remove('playing'), 200);
    }

    if (isRecording) {
        recordedNotes.push({ freq: frequency, key: keyChar, time: Date.now() - startTime });
    }
}

// EVENTOS DE TECLAS (Móvil y PC unidos)
keys.forEach(keyElement => {
    // Usamos pointerdown porque detecta touch y mouse por igual
    keyElement.addEventListener('pointerdown', (e) => {
        e.preventDefault(); // Evita scroll/zoom
        initAudio(); // Activa audio en cada toque por si acaso
        
        const note = parseFloat(keyElement.dataset.note);
        const keyChar = keyElement.dataset.key;
        playNote(note, keyChar);
    }, { passive: false });
});

// Teclado físico para PC
window.addEventListener('keydown', (e) => {
    const keyChar = e.key.toUpperCase();
    const el = document.querySelector(`.key[data-key="${keyChar}"]`);
    if (el && !e.repeat) {
        initAudio();
        playNote(parseFloat(el.dataset.note), keyChar);
    }
});

// Grabación
recordBtn.addEventListener('click', (e) => {
    initAudio();
    isRecording = !isRecording;
    if (isRecording) {
        recordedNotes = [];
        startTime = Date.now();
        recordBtn.textContent = "⏹️ Detener";
        playBtn.disabled = true;
    } else {
        recordBtn.textContent = "🔴 Grabar";
        playBtn.disabled = recordedNotes.length === 0;
    }
});

// Reproducción
playBtn.addEventListener('click', () => {
    initAudio();
    recordedNotes.forEach(note => {
        setTimeout(() => playNote(note.freq, note.key), note.time);
    });
});
