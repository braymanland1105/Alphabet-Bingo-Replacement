// --- DOM Elements ---
const screens = document.querySelectorAll('.screen');
const playButton = document.getElementById('play-button');
const modeLetterNamesButton = document.getElementById('mode-letter-names');
const modeLetterSoundsButton = document.getElementById('mode-letter-sounds');
const caseUppercaseButton = document.getElementById('case-uppercase');
const caseLowercaseButton = document.getElementById('case-lowercase');
const gridSizeButtons = document.querySelectorAll('.grid-size-button');
const backButtons = document.querySelectorAll('.back-button');
const bingoGrid = document.getElementById('bingo-grid');
const currentLetterDisplay = document.getElementById('current-letter');
const repeatLetterButton = document.getElementById('repeat-letter-button');
const endScreen = document.getElementById('end-screen');
const scoreDisplayCorrect = document.getElementById('correct-count');
const scoreDisplayIncorrect = document.getElementById('incorrect-count');
const playAgainButton = document.getElementById('play-again-button');

// --- Game State Variables ---
let gameState = {
  mode: 'LETTER_NAMES',
  letterCase: 'UPPERCASE',
  gridSize: 3,
  alphabet: [],
  boardLetters: [],
  calledLetter: null,
  correctSelections: new Set(),
  incorrectAttempts: 0,
  correctAttempts: 0,
  isGameOver: false,
  availableLetters: []
};

// --- Constants ---
const UPPERCASE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LOWERCASE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

// --- Audio ---
// Using RELATIVE PATHS based on user-provided file structure.
// Assumes index.html is in the root, and these paths are relative to it.
const SOUND_URLS = {
    // --- UI & SFX ---
    MENU_MUSIC: 'audio/Music/Menu Music.mp3',
    CLICK: 'audio/Sound Effects/Click Sound.mp3',
    CORRECT: 'audio/Sound Effects/Correct Sound.mp3',
    INCORRECT: 'audio/Sound Effects/Incorrect Sound.mp3',
    BINGO: 'audio/Sound Effects/Bingo Sound.mp3',

    // --- Letter Names (NAME) ---
    // NOTE: You didn't provide paths for Letter Names, only Letter Sounds.
    // Add paths here if you have separate recordings for letter names (e.g., saying "Ay", "Bee").
    // If you only have the letter sounds (phonetics), you might only use the _SOUND section below.
    // Example placeholder if you had name files:
    // A_NAME: 'audio/Alphabet Names/A_Name.mp3', // Replace with your actual path/filename
    // B_NAME: 'audio/Alphabet Names/B_Name.mp3',
    // ... etc ...
    // If you don't have separate NAME sounds, you can leave these commented out or remove them,
    // but make sure the game logic doesn't try to play them (e.g., maybe only enable Letter Sounds mode).
    A_NAME: '', // Add path or leave empty/comment out
    B_NAME: '', // Add path or leave empty/comment out
    C_NAME: '', // Add path or leave empty/comment out
    D_NAME: '', // Add path or leave empty/comment out
    E_NAME: '', // Add path or leave empty/comment out
    F_NAME: '', // Add path or leave empty/comment out
    G_NAME: '', // Add path or leave empty/comment out
    H_NAME: '', // Add path or leave empty/comment out
    I_NAME: '', // Add path or leave empty/comment out
    J_NAME: '', // Add path or leave empty/comment out
    K_NAME: '', // Add path or leave empty/comment out
    L_NAME: '', // Add path or leave empty/comment out
    M_NAME: '', // Add path or leave empty/comment out
    N_NAME: '', // Add path or leave empty/comment out
    O_NAME: '', // Add path or leave empty/comment out
    P_NAME: '', // Add path or leave empty/comment out
    Q_NAME: '', // Add path or leave empty/comment out
    R_NAME: '', // Add path or leave empty/comment out
    S_NAME: '', // Add path or leave empty/comment out
    T_NAME: '', // Add path or leave empty/comment out
    U_NAME: '', // Add path or leave empty/comment out
    V_NAME: '', // Add path or leave empty/comment out
    W_NAME: '', // Add path or leave empty/comment out
    X_NAME: '', // Add path or leave empty/comment out
    Y_NAME: '', // Add path or leave empty/comment out
    Z_NAME: '', // Add path or leave empty/comment out


    // --- Letter Sounds (PHONETIC) --- Using your .wav files ---
    A_SOUND: 'audio/Alphabet Sounds/A.wav',
    B_SOUND: 'audio/Alphabet Sounds/B.wav',
    C_SOUND: 'audio/Alphabet Sounds/C.wav',
    D_SOUND: 'audio/Alphabet Sounds/D.wav',
    E_SOUND: 'audio/Alphabet Sounds/E.wav',
    F_SOUND: 'audio/Alphabet Sounds/F.wav',
    G_SOUND: 'audio/Alphabet Sounds/G.wav',
    H_SOUND: 'audio/Alphabet Sounds/H.wav',
    I_SOUND: 'audio/Alphabet Sounds/I.wav',
    J_SOUND: 'audio/Alphabet Sounds/J.wav',
    K_SOUND: 'audio/Alphabet Sounds/K.wav',
    L_SOUND: 'audio/Alphabet Sounds/L.wav',
    M_SOUND: 'audio/Alphabet Sounds/M.wav',
    N_SOUND: 'audio/Alphabet Sounds/N.wav',
    O_SOUND: 'audio/Alphabet Sounds/O.wav',
    P_SOUND: 'audio/Alphabet Sounds/P.wav',
    Q_SOUND: 'audio/Alphabet Sounds/Q.wav',
    R_SOUND: 'audio/Alphabet Sounds/R.wav',
    S_SOUND: 'audio/Alphabet Sounds/S.wav',
    T_SOUND: 'audio/Alphabet Sounds/T.wav',
    U_SOUND: 'audio/Alphabet Sounds/U.wav',
    V_SOUND: 'audio/Alphabet Sounds/V.wav',
    W_SOUND: 'audio/Alphabet Sounds/W.wav',
    X_SOUND: 'audio/Alphabet Sounds/X.wav',
    Y_SOUND: 'audio/Alphabet Sounds/Y.wav',
    Z_SOUND: 'audio/Alphabet Sounds/Z.wav',
};


let menuMusicAudio = null;
let interactionOccurred = false;

// --- Audio Functions with Logging (Keep logging for now) ---

// Helper function to play a sound effect
function playSound(soundUrl) {
    console.log("Attempting to play sound. URL:", soundUrl);
    if (!soundUrl) {
         console.warn("Skipping playback for missing sound URL:", soundUrl);
         return;
    }
    try {
        // Use the relative path directly
        const audio = new Audio(soundUrl);
        console.log("Audio object created for SFX:", audio);

        audio.addEventListener('canplaythrough', () => console.log("SFX Can play through:", soundUrl));
        audio.addEventListener('error', (e) => console.error("SFX Error event:", e, "URL:", soundUrl, "Error Object:", audio.error));

        audio.play().then(() => {
            console.log("SFX playback started successfully for:", soundUrl);
        }).catch(error => {
            // Don't log NotAllowedError every time for SFX, only other errors
            if (error.name !== 'NotAllowedError') {
               console.error("SFX .play() Promise Error:", error, "URL:", soundUrl);
            } else {
               console.warn("SFX .play() blocked by autoplay rules. URL:", soundUrl)
            }
        });
    } catch (error) {
        console.error("Failed to create or play sound:", soundUrl, error);
    }
}

// Function to start/resume menu music
function startMenuMusic() {
    const menuUrl = SOUND_URLS.MENU_MUSIC;
    console.log("Attempting to start menu music. URL:", menuUrl);

    if (!menuUrl) {
         console.warn("Cannot start menu music - URL is missing.");
         return;
    }

    if (!menuMusicAudio) {
        try {
            // Use the relative path directly
            menuMusicAudio = new Audio(menuUrl);
            menuMusicAudio.loop = true;
            menuMusicAudio.volume = 0.3;
            console.log("Menu Music Audio object created:", menuMusicAudio);

            menuMusicAudio.addEventListener('canplaythrough', () => console.log("Menu Music: Can play through. URL:", menuUrl));
            menuMusicAudio.addEventListener('error', (e) => console.error("Menu Music: Error event:", e, "URL:", menuUrl, "Error Object:", menuMusicAudio.error));
            menuMusicAudio.addEventListener('stalled', () => console.warn("Menu Music: Stalled event. URL:", menuUrl));
            menuMusicAudio.addEventListener('suspend', () => console.warn("Menu Music: Suspend event. URL:", menuUrl));

        } catch (error) {
             console.error("Failed to create menu music audio object:", error);
             menuMusicAudio = null;
             return;
        }
    }

    console.log("Calling menuMusicAudio.play() for URL:", menuUrl);
    menuMusicAudio.play().then(() => {
         console.log("Menu music .play() resolved for URL:", menuUrl);
     }).catch(error => {
         console.warn("Menu music .play() Promise Error:", error, "URL:", menuUrl);
     });
}

// Function to stop menu music
function stopMenuMusic() {
    if (menuMusicAudio && !menuMusicAudio.paused) {
        console.log("Attempting to pause menu music.");
        menuMusicAudio.pause();
        menuMusicAudio.currentTime = 0;
        console.log("Menu music stopped (paused and reset time).");
    }
}

// --- Navigation ---
function showScreen(screenId) {
    screens.forEach(screen => {
      screen.classList.remove('active');
      if (screen.id === screenId) {
        screen.classList.add('active');
      }
    });
    if (screenId === 'start-screen') {
        startMenuMusic();
    } else {
        stopMenuMusic();
    }
}

 // General handler for first interaction
 function handleFirstInteraction() {
      if (!interactionOccurred) {
           interactionOccurred = true;
           console.log("First user interaction detected. Attempting to start potentially blocked audio.");
           const startScreenActive = document.getElementById('start-screen').classList.contains('active');
           // If menu music exists and is paused, try playing now
           if (startScreenActive && menuMusicAudio && menuMusicAudio.paused) {
                startMenuMusic();
           }
           document.body.removeEventListener('click', handleFirstInteraction, true);
           document.body.removeEventListener('touchend', handleFirstInteraction, true);
      }
 }
 document.body.addEventListener('click', handleFirstInteraction, true);
 document.body.addEventListener('touchend', handleFirstInteraction, true);


// --- Event Listeners (Unchanged from previous version) ---
playButton.addEventListener('click', () => {
    playSound(SOUND_URLS.CLICK);
    showScreen('settings-mode-screen');
});
modeLetterNamesButton.addEventListener('click', () => {
    playSound(SOUND_URLS.CLICK);
    gameState.mode = 'LETTER_NAMES';
    showScreen('settings-case-screen');
});
modeLetterSoundsButton.addEventListener('click', () => {
    playSound(SOUND_URLS.CLICK);
    gameState.mode = 'LETTER_SOUNDS';
    showScreen('settings-case-screen');
});
caseUppercaseButton.addEventListener('click', () => {
    playSound(SOUND_URLS.CLICK);
    gameState.letterCase = 'UPPERCASE';
    gameState.alphabet = [...UPPERCASE_ALPHABET];
    showScreen('settings-grid-screen');
});
caseLowercaseButton.addEventListener('click', () => {
    playSound(SOUND_URLS.CLICK);
    gameState.letterCase = 'LOWERCASE';
    gameState.alphabet = [...LOWERCASE_ALPHABET];
    showScreen('settings-grid-screen');
});
gridSizeButtons.forEach(button => {
    button.addEventListener('click', () => {
        playSound(SOUND_URLS.CLICK);
        gameState.gridSize = parseInt(button.dataset.size, 10);
        startGame();
    });
});
backButtons.forEach(button => {
    button.addEventListener('click', () => {
        playSound(SOUND_URLS.CLICK);
        const targetScreenId = button.dataset.target;
        showScreen(targetScreenId);
    });
});
repeatLetterButton.addEventListener('click', () => {
    playSound(SOUND_URLS.CLICK);
    if (gameState.calledLetter) {
        const letterKey = gameState.calledLetter.toUpperCase();
        const soundKey = (gameState.mode === 'LETTER_SOUNDS') ? `${letterKey}_SOUND` : `${letterKey}_NAME`;
        const soundUrlToPlay = SOUND_URLS[soundKey];
        setTimeout(() => {
           playSound(soundUrlToPlay);
        }, 150);
    }
});
playAgainButton.addEventListener('click', () => {
    playSound(SOUND_URLS.CLICK);
    resetGame();
    showScreen('start-screen');
});

// --- Game Logic (Unchanged from previous version) ---
function resetGame() {
    gameState = {
        ...gameState,
        letterCase: 'UPPERCASE',
        alphabet: [],
        boardLetters: [],
        calledLetter: null,
        correctSelections: new Set(),
        incorrectAttempts: 0,
        correctAttempts: 0,
        isGameOver: false,
        availableLetters: []
    };
    bingoGrid.innerHTML = '';
    scoreDisplayCorrect.textContent = '0';
    scoreDisplayIncorrect.textContent = '0';
    document.getElementById('new-top-score-msg').style.visibility = 'hidden';
}
function startGame() {
    console.log("Starting game with settings:", gameState);
    generateBoard();
    setupGridEventListeners();
    showScreen('game-screen');
    setTimeout(callNextLetter, 500);
}
function generateBoard() {
    const size = gameState.gridSize;
    const numCells = size * size;
    bingoGrid.innerHTML = '';
    bingoGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gameState.alphabet = (gameState.letterCase === 'UPPERCASE') ? [...UPPERCASE_ALPHABET] : [...LOWERCASE_ALPHABET];
    const shuffledAlphabet = [...gameState.alphabet].sort(() => 0.5 - Math.random());
    gameState.boardLetters = shuffledAlphabet.slice(0, numCells);
    gameState.availableLetters = [...gameState.boardLetters];
    for (let i = 0; i < numCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.innerHTML = '<span>' + gameState.boardLetters[i] + '</span>';
        cell.dataset.index = i;
        cell.dataset.letter = gameState.boardLetters[i];
        bingoGrid.appendChild(cell);
    }
    console.log("Board generated:", gameState.boardLetters);
}
function setupGridEventListeners() {
    bingoGrid.removeEventListener('click', handleTileClick);
    bingoGrid.addEventListener('click', handleTileClick);
}
function handleTileClick(event) {
    if (gameState.isGameOver) return;
    const clickedCell = event.target.closest('.grid-cell');
    if (!clickedCell || clickedCell.classList.contains('correct')) { return; }
    const clickedLetter = clickedCell.dataset.letter;
    const cellIndex = parseInt(clickedCell.dataset.index, 10);
    if (clickedLetter === gameState.calledLetter) {
        playSound(SOUND_URLS.CORRECT);
        clickedCell.classList.add('correct');
        gameState.correctSelections.add(cellIndex);
        gameState.correctAttempts++;
        const letterIndex = gameState.availableLetters.indexOf(gameState.calledLetter);
        if (letterIndex > -1) { gameState.availableLetters.splice(letterIndex, 1); }
        console.log("Correct selection:", clickedLetter, "Index:", cellIndex);
        if (checkForBingo()) { endGame(true); }
        else if (gameState.availableLetters.length === 0) { endGame(false); }
        else { setTimeout(callNextLetter, 400); }
    } else {
        playSound(SOUND_URLS.INCORRECT);
        gameState.incorrectAttempts++;
        console.log("Incorrect selection:", clickedLetter);
        clickedCell.classList.add('incorrect');
        setTimeout(() => { if (clickedCell) { clickedCell.classList.remove('incorrect'); } }, 500);
    }
    scoreDisplayIncorrect.textContent = gameState.incorrectAttempts;
}
function callNextLetter() {
    if (gameState.availableLetters.length === 0 || gameState.isGameOver) {
        console.log("No more letters to call or game over.");
        if (!gameState.isGameOver && gameState.availableLetters.length === 0) { endGame(false); }
        return;
    }
    const randomIndex = Math.floor(Math.random() * gameState.availableLetters.length);
    gameState.calledLetter = gameState.availableLetters[randomIndex];
    currentLetterDisplay.textContent = gameState.calledLetter;
    console.log("Calling letter:", gameState.calledLetter, "in mode:", gameState.mode);
    const letterKey = gameState.calledLetter.toUpperCase();
    const soundKey = (gameState.mode === 'LETTER_SOUNDS') ? `${letterKey}_SOUND` : `${letterKey}_NAME`;
    const soundUrlToPlay = SOUND_URLS[soundKey];
    console.log("Playing sound key:", soundKey, "URL:", soundUrlToPlay);
    setTimeout(() => { playSound(soundUrlToPlay); }, 150);
}
function checkForBingo() {
  const size = gameState.gridSize;
  const selections = gameState.correctSelections;
  if (selections.size < size) return false;
  for (let r = 0; r < size; r++) {
    let rowWin = true;
    for (let c = 0; c < size; c++) { if (!selections.has(r * size + c)) { rowWin = false; break; } }
    if (rowWin) return true;
  }
  for (let c = 0; c < size; c++) {
    let colWin = true;
    for (let r = 0; r < size; r++) { if (!selections.has(r * size + c)) { colWin = false; break; } }
    if (colWin) return true;
  }
  if (size >= 1) {
    let diag1Win = true; let diag2Win = true;
    for (let i = 0; i < size; i++) {
      if (!selections.has(i * size + i)) { diag1Win = false; }
      if (!selections.has(i * size + (size - 1 - i))) { diag2Win = false; }
    }
    if (diag1Win || diag2Win) return true;
  }
  return false;
}
function endGame(isBingo) {
    if (gameState.isGameOver) return;
    gameState.isGameOver = true;
    console.log("Game ended. Bingo:", isBingo);
    if (isBingo) {
        playSound(SOUND_URLS.BINGO);
        endScreen.querySelector('#end-subtitle').textContent = "BINGO!";
        endScreen.querySelector('#end-title').textContent = "GREAT JOB!";
    } else {
        endScreen.querySelector('#end-subtitle').textContent = "";
        endScreen.querySelector('#end-title').textContent = "GOOD TRY!";
    }
    scoreDisplayCorrect.textContent = gameState.correctSelections.size;
    scoreDisplayIncorrect.textContent = gameState.incorrectAttempts;
    // Update Top Score (Using localStorage for persistence on GitHub Pages)
    try {
        const currentTopScore = parseInt(localStorage.getItem('alphabetBingoTopScore') || '0');
        const finalScore = gameState.correctSelections.size;
        if (finalScore > currentTopScore) {
           document.getElementById('top-score').textContent = finalScore;
           document.getElementById('new-top-score-msg').style.visibility = 'visible';
           localStorage.setItem('alphabetBingoTopScore', finalScore); // Save new top score
        } else {
             document.getElementById('top-score').textContent = currentTopScore; // Show existing top score
             document.getElementById('new-top-score-msg').style.visibility = 'hidden';
        }
    } catch (e) {
        console.error("Could not access localStorage for top score:", e);
        // Fallback: just display current score as top score if storage fails
        document.getElementById('top-score').textContent = gameState.correctSelections.size;
    }

    showScreen('end-screen');
}
// --- Initial Setup ---
// Load top score on initial load
try {
   document.getElementById('top-score').textContent = localStorage.getItem('alphabetBingoTopScore') || '0';
} catch(e) {
   console.error("Could not access localStorage on initial load:", e);
}
showScreen('start-screen'); // Show the start screen
