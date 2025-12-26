const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

// --- ÚNICA FUNCIÓN playNote (Sonido + Color + Grabación) ---
function playNote(frequency, keyChar) {
    if (!frequency) return;

    // Lógica de Sonido
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = oscSelect.value;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    // Efecto Sustain: el sonido desaparece suavemente
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.5);

   // Lógica de Color Visual (Teclas)
    const el = document.querySelector(`.key[data-key="${keyChar}"]`);
    if (el) {
        const colorValue = colors[keyChar] || "#f1c40f";
        el.style.setProperty('--key-color', colorValue);
        
        // --- NUEVA LÍNEA: Cambia el color del fondo ---
        document.body.style.setProperty('--bg-color', colorValue + '33'); // '33' añade transparencia
        
        el.classList.add('playing');
        setTimeout(() => {
            el.classList.remove('playing');
            // Opcional: vuelve al color original después de un tiempo
            setTimeout(() => {
                if (!document.querySelector('.key.playing')) {
                    document.body.style.setProperty('--bg-color', '#1e293b');
                }
            }, 1000);
        }, 250);
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

// --- EVENTOS ---

// Activar audio al primer clic (Solución al silencio)
window.addEventListener('mousedown', () => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
});

// Eventos de Mouse
keys.forEach(keyElement => {
    keyElement.addEventListener('mousedown', () => {
        const note = parseFloat(keyElement.dataset.note);
        const keyChar = keyElement.dataset.key;
        playNote(note, keyChar);
    });
});

// Eventos de Teclado Físico
window.addEventListener('keydown', (e) => {
    const keyChar = e.key.toUpperCase();
    const el = document.querySelector(`.key[data-key="${keyChar}"]`);
    if (el && !e.repeat) {
        const note = parseFloat(el.dataset.note);
        playNote(note, keyChar);
    }
});

// Lógica de Botones Grabar/Reproducir
recordBtn.addEventListener('click', () => {
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
    // Dentro del recordBtn.addEventListener('click', ...)
if (isRecording) {
    recordBtn.classList.add('recording'); // Activa la pulsación roja
} else {
    recordBtn.classList.remove('recording');
}
});

playBtn.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    recordedNotes.forEach(note => {
        setTimeout(() => {
            playNote(note.freq, note.key);
        }, note.time);
    });
});
