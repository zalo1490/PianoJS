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

// Función unificada para manejar la interacción (PC y Móvil)
function handleInteraction(e) {
    if (e.type === 'touchstart') {
        e.preventDefault(); // Detiene el scroll y el zoom
    }

    // Desbloqueo de audio obligatorio para móviles
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const keyElement = e.currentTarget;
    const note = parseFloat(keyElement.dataset.note);
    const keyChar = keyElement.dataset.key;
    
    playNote(note, keyChar);
}

function playNote(frequency, keyChar) {
    if (!frequency) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = oscSelect.value;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    // Envolvente de sonido
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);

    // Efecto Visual
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

    if (isRecording) {
        recordedNotes.push({
            freq: frequency,
            key: keyChar,
            time: Date.now() - startTime
        });
    }
}

// Asignar eventos a las teclas
keys.forEach(key => {
    key.addEventListener('mousedown', handleInteraction);
    key.addEventListener('touchstart', handleInteraction, { passive: false });
});

// Teclado físico
window.addEventListener('keydown', (e) => {
    const keyChar = e.key.toUpperCase();
    const el = document.querySelector(`.key[data-key="${keyChar}"]`);
    if (el && !e.repeat) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        playNote(parseFloat(el.dataset.note), keyChar);
    }
});

// Grabación
recordBtn.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
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
    if (audioCtx.state === 'suspended') audioCtx.resume();
    recordedNotes.forEach(note => {
        setTimeout(() => playNote(note.freq, note.key), note.time);
    });
});    osc.stop(audioCtx.currentTime + 1.5);

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

