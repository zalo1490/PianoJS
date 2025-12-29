const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

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

// --- MEJORA PARA MÓVILES: Desbloqueo forzado ---
function resumeAudio() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Escuchar toque en cualquier parte para activar el audio (estándar de móviles)
window.addEventListener('touchstart', resumeAudio, { once: true });
window.addEventListener('mousedown', resumeAudio, { once: true });

// --- ÚNICA FUNCIÓN playNote ---
function playNote(frequency, keyChar) {
    if (!frequency) return;

    resumeAudio();

    // Lógica de Sonido
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = oscSelect.value;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.5);

    // Lógica Visual
    const el = document.querySelector(`.key[data-key="${keyChar}"]`);
    if (el) {
        const colorValue = colors[keyChar] || "#f1c40f";
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

    // Lógica de Grabación
    if (isRecording) {
        recordedNotes.push({
            freq: frequency,
            key: keyChar,
            time: Date.now() - startTime
        });
    }
}

// --- EVENTOS DE INTERACCIÓN ---

keys.forEach(keyElement => {
    // Click en PC
    keyElement.addEventListener('mousedown', (e) => {
        const note = parseFloat(keyElement.dataset.note);
        const keyChar = keyElement.dataset.key;
        playNote(note, keyChar);
    });

    // Toque en Móvil
    keyElement.addEventListener('touchstart', (e) => {
        e.preventDefault(); 
        const note = parseFloat(keyElement.dataset.note);
        const keyChar = keyElement.dataset.key;
        playNote(note, keyChar);
    }, { passive: false });
});

// Teclado Físico
window.addEventListener('keydown', (e) => {
    const keyChar = e.key.toUpperCase();
    const el = document.querySelector(`.key[data-key="${keyChar}"]`);
    if (el && !e.repeat) {
        const note = parseFloat(el.dataset.note);
        playNote(note, keyChar);
    }
});

// --- LÓGICA DE GRABACIÓN Y REPRODUCCIÓN ---

recordBtn.addEventListener('click', () => {
    resumeAudio();
    isRecording = !isRecording;

    if (isRecording) {
        recordedNotes = [];
        startTime = Date.now();
        recordBtn.textContent = "⏹️ Detener";
        recordBtn.classList.add('recording');
        playBtn.disabled = true;
    } else {
        recordBtn.textContent = "🔴 Grabar";
        recordBtn.classList.remove('recording');
        playBtn.disabled = recordedNotes.length === 0;
    }
});

playBtn.addEventListener('click', () => {
    resumeAudio();
    if (recordedNotes.length === 0) return;

    recordedNotes.forEach(note => {
        setTimeout(() => {
            playNote(note.freq, note.key);
        }, note.time);
    });
});
