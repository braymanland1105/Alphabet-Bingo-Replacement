// --- DOM Elements ---
const screens = document.querySelectorAll('.screen');
const playButton = document.getElementById('play-button');
const modeLetterNamesButton = document.getElementById('mode-letter-names');
const modeLetterSoundsButton = document.getElementById('mode-letter-sounds');
const caseUppercaseButton = document.getElementById('case-uppercase');
const caseLowercaseButton = document.getElementById('case-lowercase');
const gridSizeButtons = document.querySelectorAll('.grid-size-button');
const backButtons = document.querySelectorAll('.back-button'); // Selector for back buttons
const bingoGrid = document.getElementById('bingo-grid');
const currentLetterDisplay = document.getElementById('current-letter');
const repeatLetterButton = document.getElementById('repeat-letter-button');
const endScreen = document.getElementById('end-screen');
const scoreDisplayCorrect = document.getElementById('correct-count');
const scoreDisplayIncorrect = document.getElementById('incorrect-count');
const playAgainButton = document.getElementById('play-again-button');

console.log("Script loaded. Found back buttons:", backButtons.length); // Check if buttons are found

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
// Using RELATIVE PATHS - Update these to match your exact file structure/names on GitHub
const SOUND_URLS = {
    // --- UI & SFX ---
    MENU_MUSIC: 'audio/Music/Menu Music.mp3',
    CLICK: 'audio/Sound Effects/Click Sound.mp3',
    CORRECT: 'audio/Sound Effects/Correct Sound.mp3',
    INCORRECT: 'audio/Sound Effects/Incorrect Sound.mp3',
    BINGO: 'audio/Sound Effects/Bingo Sound.mp3',

    // --- Letter Names (NAME) --- Add paths if you have them ---
    A_NAME: '', B_NAME: '', C_NAME: '', D_NAME: '', E_NAME: '', F_NAME: '',
    G_NAME: '', H_NAME: '', I_NAME: '', J_NAME: '', K_NAME: '', L_NAME: '',
    M_NAME: '', N_NAME: '', O_NAME: '', P_NAME: '', Q_NAME: '', R_NAME: '',
    S_NAME: '', T_NAME: '', U_NAME: '', V_NAME: '', W_NAME: '', X_NAME: '',
    Y_NAME: '', Z_NAME: '',

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

// --- Audio Functions (with logging) ---
function playSound(soundUrl) {
    // console.log("Attempting to play sound. URL:", soundUrl); // Reduce noise
    if (!soundUrl) {
         // console.warn("Skipping playback for missing sound URL:", soundUrl); // Reduce noise
         return;
    }
    try {
        const audio = new Audio(soundUrl);
        // console.log("Audio object created for SFX:", audio); // Reduce noise
        // audio.addEventListener('canplaythrough', () => console.log("SFX Can play through:", soundUrl)); // Reduce noise
        audio.addEventListener('error', (e) => console.error("SFX Error event:", e, "URL:", soundUrl, "Error Object:", audio.error));
        audio.play().then(() => {
            // console.log("SFX playback started successfully for:", soundUrl); // Reduce noise
        }).catch(error => {
            if (error.name !== 'NotAllowedError') {
               console.error("SFX .play() Promise Error:", error, "URL:", soundUrl);
            } else {
               // console.warn("SFX .play() blocked by autoplay rules. URL:", soundUrl); // Reduce noise
            }
        });
    } catch (error) {
        console.error("Failed to create or play sound:", soundUrl, error);
    }
}

function startMenuMusic() {
    const menuUrl = SOUND_URLS.MENU_MUSIC;
    // console.log("Attempting to start menu music. URL:", menuUrl); // Reduce noise
    if (!menuUrl) {
         console.warn("Cannot start menu music - URL is missing.");
         return;
    }
    if (!menuMusicAudio) {
        try {
            menuMusicAudio = new Audio(menuUrl);
            menuMusicAudio.loop = true;
            menuMusicAudio.volume = 0.3;
            // console.log("Menu Music Audio object created:", menuMusicAudio); // Reduce noise
            menuMusicAudio.addEventListener('canplaythrough', () => console.log("Menu Music: Can play through. URL:", menuUrl));
            menuMusicAudio.addEventListener('error', (e) => console.error("Menu Music: Error event:", e, "URL:", menuUrl, "Error Object:", menuMusicAudio.error));
            menuMusicAudio.addEventListener('stalled', () => console.warn("Menu Music: Stalled event. URL:", menuUrl));
            menuMusicAudio.addEventListener('suspend', () => console.warn("Menu Music: Suspend event. URL:", menuUrl));
        } catch (error) {
             console.error("Failed to create menu music audio object:", error);
             menuMusicAudio = null; return;
        }
    }
    if (menuMusicAudio.paused) {
        // console.log("Calling menuMusicAudio.play() for URL:", menuUrl); // Reduce noise
        menuMusicAudio.play().then(() => {
             // console.log("Menu music .play() resolved for URL:", menuUrl); // Reduce noise
         }).catch(error => {
             if (!interactionOccurred) console.warn("Menu music .play() Promise Error:", error, "URL:", menuUrl);
         });
    }
}

function stopMenuMusic() {
    if (menuMusicAudio && !menuMusicAudio.paused) {
        // console.log("Attempting to pause menu music."); // Reduce noise
        menuMusicAudio.pause();
        menuMusicAudio.currentTime = 0;
        // console.log("Menu music stopped (paused and reset time)."); // Reduce noise
    }
}

// --- Navigation (with refined music logic) ---
function showScreen(screenId) {
    console.log(`>>> showScreen called with screenId: ${screenId}`);
    screens.forEach(screen => {
      screen.classList.remove('active');
      if (screen.id === screenId) { screen.classList.add('active'); }
    });
    // Music Control Logic
    if (screenId === 'start-screen') {
        console.log(">>> Music condition: Starting/Restarting music for start-screen.");
        startMenuMusic();
    } else if (screenId === 'game-screen' || screenId === 'end-screen') {
        console.log(`>>> Music condition: Stopping music for ${screenId}.`);
        stopMenuMusic();
    } else {
        console.log(`>>> Music condition: Letting music continue for settings screen ${screenId}.`);
        if (menuMusicAudio && menuMusicAudio.paused && interactionOccurred) {
             console.log(">>> Music condition: Settings screen, but music was paused, attempting restart.");
             startMenuMusic();
        }
    }
}

 // --- Interaction Handler ---
 function handleFirstInteraction() {
      if (!interactionOccurred) {
           interactionOccurred = true;
           console.log("First user interaction detected. Attempting to start potentially blocked audio.");
           const startScreenActive = document.getElementById('start-screen')?.classList.contains('active');
           if (startScreenActive && menuMusicAudio && menuMusicAudio.paused) {
                startMenuMusic();
           }
           document.body.removeEventListener('click', handleFirstInteraction, true);
           document.body.removeEventListener('touchend', handleFirstInteraction, true);
      }
 }
 document.body.addEventListener('click', handleFirstInteraction, true);
 document.body.addEventListener('touchend', handleFirstInteraction, true);


// --- Event Listeners ---
if (playButton) {
  playButton.addEventListener('click', () => {
    playSound(SOUND_URLS.CLICK);
    showScreen('settings-mode-screen');
  });
} else { console.error("Play button not found!"); }

if (modeLetterNamesButton) {
  modeLetterNamesButton.addEventListener('click', () => {
    playSound(SOUND_URLS.CLICK);
    gameState.mode = 'LETTER_NAMES';
    showScreen('settings-case-screen');
  });
} else { console.error("Mode Letter Names button not found!"); }

if (modeLetterSoundsButton) {
  modeLetterSoundsButton.addEventListener('click', () => {
    playSound(SOUND_URLS.CLICK);
    gameState.mode = 'LETTER_SOUNDS';
    showScreen('settings-case-screen');
  });
} else { console.error("Mode Letter Sounds button not found!"); }

if (caseUppercaseButton) {
  caseUppercaseButton.addEventListener('click', () => {
    playSound(SOUND_URLS.CLICK);
    gameState.letterCase = 'UPPERCASE';
    gameState.alphabet = [...UPPERCASE_ALPHABET];
    showScreen('settings-grid-screen');
  });
} else { console.error("Case Uppercase button not found!"); }

if (caseLowercaseButton) {
  caseLowercaseButton.addEventListener('click', () => {
    playSound(SOUND_URLS.CLICK);
    gameState.letterCase = 'LOWERCASE';
    gameState.alphabet = [...LOWERCASE_ALPHABET];
    showScreen('settings-grid-screen');
  });
} else { console.error("Case Lowercase button not found!"); }

if (gridSizeButtons && gridSizeButtons.length > 0) {
  gridSizeButtons.forEach(button => {
    button.addEventListener('click', () => {
      playSound(SOUND_URLS.CLICK);
      gameState.gridSize = parseInt(button.dataset.size, 10);
      startGame();
    });
  });
} else { console.warn("Grid size buttons not found!"); }


// *** BACK BUTTON LISTENER WITH LOGGING ***
if (backButtons && backButtons.length > 0) {
  console.log("Setting up back button listeners...");
  backButtons.forEach((button, index) => {
      console.log(`Attaching listener to back button ${index}`, button);
      button.addEventListener('click', () => {
          console.log(`>>> Back button ${index} clicked!`, button); // Log click
          playSound(SOUND_URLS.CLICK);
          const targetScreenId = button.dataset.target;
          console.log(`>>> Target screen ID from data-target: ${targetScreenId}`); // Log target ID
          if (targetScreenId) {
              showScreen(targetScreenId); // Call showScreen
          } else {
              console.error("Back button clicked, but data-target attribute is missing or empty!", button);
          }
      });
  });
} else {
    console.error("!!! Back buttons not found by querySelectorAll('.back-button') !!!"); // Log if no buttons found
}
// *** END OF BACK BUTTON LOGGING ***


if (repeatLetterButton) {
  repeatLetterButton.addEventListener('click', () => {
    playSound(SOUND_URLS.CLICK);
    if (gameState.calledLetter) {
      const letterKey = gameState.calledLetter.toUpperCase();
      const soundKey = (gameState.mode === 'LETTER_SOUNDS') ? `${letterKey}_SOUND` : `${letterKey}_NAME`;
      // Add check if sound key exists and has a value
      if (SOUND_URLS[soundKey]) {
          const soundUrlToPlay = SOUND_URLS[soundKey];
          console.log("Playing sound key:", soundKey, "URL:", soundUrlToPlay);
          setTimeout(() => { playSound(soundUrlToPlay); }, 150);
      } else {
          console.warn(`Sound URL not found for key: ${soundKey}`);
      }
    }
  });
} else { console.error("Repeat Letter button not found!"); }

if (playAgainButton) {
  playAgainButton.addEventListener('click', () => {
    playSound(SOUND_URLS.CLICK);
    resetGame();
    showScreen('start-screen');
  });
} else { console.error("Play Again button not found!"); }


// --- Game Logic ---
function resetGame() {
    gameState = {
        ...gameState, letterCase: 'UPPERCASE', alphabet: [], boardLetters: [],
        calledLetter: null, correctSelections: new Set(), incorrectAttempts: 0,
        correctAttempts: 0, isGameOver: false, availableLetters: []
    };
    if(bingoGrid) bingoGrid.innerHTML = ''; // Add safety check
    if(scoreDisplayCorrect) scoreDisplayCorrect.textContent = '0';
    if(scoreDisplayIncorrect) scoreDisplayIncorrect.textContent = '0';
    const msgElement = document.getElementById('new-top-score-msg');
    if(msgElement) msgElement.style.visibility = 'hidden';
}

function startGame() {
    console.log("Starting game with settings:", gameState);
    generateBoard();
    setupGridEventListeners();
    showScreen('game-screen');
    setTimeout(callNextLetter, 500);
}

function generateBoard() {
    const size = gameState.gridSize; const numCells = size * size;
    if(!bingoGrid) { console.error("Bingo grid element not found in generateBoard"); return; } // Safety check
    bingoGrid.innerHTML = ''; bingoGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gameState.alphabet = (gameState.letterCase === 'UPPERCASE') ? [...UPPERCASE_ALPHABET] : [...LOWERCASE_ALPHABET];
    const shuffledAlphabet = [...gameState.alphabet].sort(() => 0.5 - Math.random());
    gameState.boardLetters = shuffledAlphabet.slice(0, numCells); gameState.availableLetters = [...gameState.boardLetters];
    for (let i = 0; i < numCells; i++) {
        const cell = document.createElement('div'); cell.classList.add('grid-cell');
        cell.innerHTML = '<span>' + gameState.boardLetters[i] + '</span>';
        cell.dataset.index = i; cell.dataset.letter = gameState.boardLetters[i];
        bingoGrid.appendChild(cell);
    }
    console.log("Board generated:", gameState.boardLetters);
}

function setupGridEventListeners() {
    if(!bingoGrid) { console.error("Bingo grid element not found in setupGridEventListeners"); return; } // Safety check
    bingoGrid.removeEventListener('click', handleTileClick);
    bingoGrid.addEventListener('click', handleTileClick);
}

function handleTileClick(event) {
    if (gameState.isGameOver) return;
    const clickedCell = event.target.closest('.grid-cell');
    if (!clickedCell || clickedCell.classList.contains('correct')) { return; }
    const clickedLetter = clickedCell.dataset.letter; const cellIndex = parseInt(clickedCell.dataset.index, 10);
    if (clickedLetter === gameState.calledLetter) {
        playSound(SOUND_URLS.CORRECT); clickedCell.classList.add('correct');
        gameState.correctSelections.add(cellIndex); gameState.correctAttempts++;
        const letterIndex = gameState.availableLetters.indexOf(gameState.calledLetter);
        if (letterIndex > -1) { gameState.availableLetters.splice(letterIndex, 1); }
        console.log("Correct selection:", clickedLetter, "Index:", cellIndex);
        if (checkForBingo()) { endGame(true); }
        else if (gameState.availableLetters.length === 0) { endGame(false); }
        else { setTimeout(callNextLetter, 400); }
    } else {
        playSound(SOUND_URLS.INCORRECT); gameState.incorrectAttempts++;
        console.log("Incorrect selection:", clickedLetter);
        clickedCell.classList.add('incorrect');
        setTimeout(() => { if (clickedCell) { clickedCell.classList.remove('incorrect'); } }, 500);
    }
    if(scoreDisplayIncorrect) scoreDisplayIncorrect.textContent = gameState.incorrectAttempts; // Safety check
}

function callNextLetter() {
    if (gameState.availableLetters.length === 0 || gameState.isGameOver) {
        console.log("No more letters to call or game over.");
        if (!gameState.isGameOver && gameState.availableLetters.length === 0) { endGame(false); } return;
    }
    const randomIndex = Math.floor(Math.random() * gameState.availableLetters.length);
    gameState.calledLetter = gameState.availableLetters[randomIndex];
    if(currentLetterDisplay) currentLetterDisplay.textContent = gameState.calledLetter; // Safety check
    console.log("Calling letter:", gameState.calledLetter, "in mode:", gameState.mode);
    const letterKey = gameState.calledLetter.toUpperCase();
    const soundKey = (gameState.mode === 'LETTER_SOUNDS') ? `${letterKey}_SOUND` : `${letterKey}_NAME`;
    // Add check if sound key exists and has a value
    if (SOUND_URLS[soundKey]) {
        const soundUrlToPlay = SOUND_URLS[soundKey];
        console.log("Playing sound key:", soundKey, "URL:", soundUrlToPlay);
        setTimeout(() => { playSound(soundUrlToPlay); }, 150);
    } else {
        console.warn(`Sound URL not found for key: ${soundKey}`);
        // Decide if you want to play a default sound or nothing if the specific sound is missing
    }
}

function checkForBingo() {
  const size = gameState.gridSize; const selections = gameState.correctSelections;
  if (selections.size < size) return false;
  // Row check
  for (let r = 0; r < size; r++) { let rowWin = true; for (let c = 0; c < size; c++) { if (!selections.has(r * size + c)) { rowWin = false; break; } } if (rowWin) return true; }
  // Column check
  for (let c = 0; c < size; c++) { let colWin = true; for (let r = 0; r < size; r++) { if (!selections.has(r * size + c)) { colWin = false; break; } } if (colWin) return true; }
  // Diagonal checks
  if (size >= 1) { let diag1Win = true; let diag2Win = true; for (let i = 0; i < size; i++) { if (!selections.has(i * size + i)) { diag1Win = false; } if (!selections.has(i * size + (size - 1 - i))) { diag2Win = false; } } if (diag1Win || diag2Win) return true; }
  return false;
}

function endGame(isBingo) {
    if (gameState.isGameOver) return; gameState.isGameOver = true; console.log("Game ended. Bingo:", isBingo);
    const subtitleEl = endScreen?.querySelector('#end-subtitle'); // Optional chaining
    const titleEl = endScreen?.querySelector('#end-title');

    if (isBingo) {
        playSound(SOUND_URLS.BINGO);
        if(subtitleEl) subtitleEl.textContent = "BINGO!";
        if(titleEl) titleEl.textContent = "GREAT JOB!";
    } else {
        if(subtitleEl) subtitleEl.textContent = "";
        if(titleEl) titleEl.textContent = "GOOD TRY!";
    }
    if(scoreDisplayCorrect) scoreDisplayCorrect.textContent = gameState.correctSelections.size;
    if(scoreDisplayIncorrect) scoreDisplayIncorrect.textContent = gameState.incorrectAttempts;
    // Update Top Score (Using localStorage for persistence on GitHub Pages)
    try {
        const topScoreEl = document.getElementById('top-score');
        const newTopScoreMsgEl = document.getElementById('new-top-score-msg');
        const currentTopScore = parseInt(localStorage.getItem('alphabetBingoTopScore') || '0');
        const finalScore = gameState.correctSelections.size;
        if (finalScore > currentTopScore) {
           if(topScoreEl) topScoreEl.textContent = finalScore;
           if(newTopScoreMsgEl) newTopScoreMsgEl.style.visibility = 'visible';
           localStorage.setItem('alphabetBingoTopScore', finalScore); // Save new top score
        } else {
             if(topScoreEl) topScoreEl.textContent = currentTopScore; // Show existing top score
             if(newTopScoreMsgEl) newTopScoreMsgEl.style.visibility = 'hidden';
        }
    } catch (e) {
        console.error("Could not access localStorage for top score:", e);
        const topScoreEl = document.getElementById('top-score');
        if(topScoreEl) topScoreEl.textContent = gameState.correctSelections.size; // Fallback display
    }
    showScreen('end-screen'); // Stops music
}

// --- Initial Setup ---
try {
   // Load top score or default to 0
   const topScoreEl = document.getElementById('top-score');
   if (topScoreEl) {
      topScoreEl.textContent = localStorage.getItem('alphabetBingoTopScore') || '0';
   } else {
       console.error("Top score element not found on initial load.");
   }
} catch(e) {
   console.error("Could not access localStorage on initial load:", e);
}
showScreen('start-screen'); // Show the start screen and trigger initial music attempt

</script>
