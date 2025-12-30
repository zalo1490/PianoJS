// No creamos el contexto aquí arriba, solo declaramos la variable
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

// Esta función se asegura de que el audio nazca SÓLO tras un toque
function getAudioContext() {
    if (!audioCtx) {
        // Creamos el contexto por primera vez
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playNote(frequency, keyChar) {
    if (!frequency) return;

    // Llamamos a la función para obtener el contexto activo
    const ctx = getAudioContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = oscSelect.value;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Volumen y envolvente
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1);

    // Animación visual
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

// EVENTOS: Usamos 'pointerdown' que es el más compatible
keys.forEach(key => {
    key.addEventListener('pointerdown', (e) => {
        // IMPORTANTE para Chrome en iOS: evitar que el toque se pierda
        e.preventDefault();
        playNote(parseFloat(key.dataset.note), key.dataset.key);
    }, { passive: false });
});

// Teclado físico
window.addEventListener('keydown', (e) => {
    const keyChar = e.key.toUpperCase();
    const el = document.querySelector(`.key[data-key="${keyChar}"]`);
    if (el && !e.repeat) {
        playNote(parseFloat(el.dataset.note), keyChar);
    }
});

// Grabación y Reproducción (también llaman a getAudioContext)
recordBtn.addEventListener('click', () => {
    getAudioContext(); 
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
    getAudioContext();
    recordedNotes.forEach(note => {
        setTimeout(() => playNote(note.freq, note.key), note.time);
    });
});
