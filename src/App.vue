<template>
  <!-- A container to house the puzzle board -->
  <div class="container">
  <div class="col justify-content-center">
    <h1 class="text-center mb-2 text-primary">Weihnachtsglücksrad</h1>

    <!-- Display the category (if any) -->
    <h3 class="text-center mb-2 text-warning">Runde {{ currentPuzzle }}: {{ category }}</h3>

  <!-- Bootstrap alert (conditionally shown) -->
  <div class="row justify-content-center">
    <div class="col-6">
      <!-- TODO: Make this a toast -->
      <div class="alert alert-danger text-center" v-if="message">{{ message }}</div>
      <div class="alert alert-info text-center" v-if="guessedAllConsonants">Alle Konsonanten erraten!</div>
      <div class="alert alert-success text-center" v-if="isSolved">Erfolgreich gelöst!</div>
    </div>
  </div>
  <div class="container col justify-content-center pt-2 pb-1">
    <div 
      v-for="(lineArray, lineIndex) in puzzleLines" 
      :key="lineIndex" 
      class="row justify-content-center mb-2"
    >
      <!-- We use "col-auto" so it sizes to fit content and is centered via "justify-content-center" -->
      <div class="col-auto">
        <!-- d-flex to lay out each character horizontally -->
        <div class="d-flex">
            <span 
            v-for="(char, charIndex) in lineArray" 
            :key="charIndex" 
            class="puzzle-char mx-1 text-center"
            :class="char === ' ' ? 'bg-secondary' : 'bg-primary'"
          >
            {{ isRevealed(lineIndex, charIndex) ? char : ' ' }}
          </span>
        </div>
      </div>
    </div>
  </div>

    <div class="row justify-content-center">
      <div class="col-auto">
        <!-- Bootstrap button -->
        <button @click="handleKeyUp({key: 'Ü'})" class="btn btn-outline-primary btn-sm m-1">
          Ü
        </button>
        <button @click="handleKeyUp({key: 'Ä'})" class="btn btn-outline-primary btn-sm m-1">
          Ä
        </button>
        <button @click="handleKeyUp({key: 'Ö'})" class="btn btn-outline-primary btn-sm m-1">
          Ö
        </button>
      <button @click="initialize" class="btn btn-outline-primary btn-sm m-1">
        Zurücksetzen
      </button>
      <span class="mx-1"></span>
      <button @click="revealAll" class="btn btn-outline-danger btn-sm m-1">
        Rätsel Lösen
      </button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
// TODO: Add count for correct guesses
import correctSound from '@/assets/correct.mp3';
import wrongSound from '@/assets/wrong2.mp3';
import puzzlesText from '@/assets/puzzles.txt?raw'; // Import the raw text file
export default {
  name: 'App',
  data() {
    const puzzles = {}
    const puzzlesArray = puzzlesText.split('\n');
    puzzlesArray.forEach((line, index) => {
      let [cat, lines] = line.split('|');
      cat = cat.trim();
      lines = lines.trim().split('&');
      puzzles[index + 1] = {
        category: cat,
        line1: lines[0],
        line2: lines[1],
        line3: lines[2],
        line4: lines[3],
      };
    });

    return {
      // Desired line widths in characters
      lineWidths: [12, 14, 14, 12],

      // Array of puzzle objects
      puzzles: puzzles,

      // Which puzzle is currently in play
      currentPuzzle: 1,

      // Stores boolean arrays marking whether each character is revealed
      revealed: [],

      guessed: [],

      // For showing a quick alert message (e.g., WRONG GUESS)
      message: '',

    };
  },
  computed: {
    /** 
     * Returns an array of 4 arrays: each array is the characters
     * from line1, line2, line3, line4 AFTER being centered and padded 
     * to the specified width.
     */
    puzzleLines() {
      const puzzle = this.puzzles[this.currentPuzzle];
      const lines = [
        puzzle.line1,
        puzzle.line2,
        puzzle.line3,
        puzzle.line4
      ];

      return lines.map((line, index) => {
        const width = this.lineWidths[index];
        const centered = this.centerText(line, width);
        return centered.split('');
      });
    },
    category() {
      return this.puzzles[this.currentPuzzle].category;
    },
    guessedAllConsonants() {
      // Count the number of consonants that have not been revealed
      let count = 0;
      const vowels = ['A', 'E', 'I', 'O', 'U', 'Ä', 'Ö', 'Ü'];
      this.revealed.forEach((line, lineIndex) => {
        line.forEach((char, charIndex) => {
          const upperChar = this.puzzleLines[lineIndex][charIndex].toUpperCase();
          if (upperChar !== ' ' && !vowels.includes(upperChar) && !char) {
              count++;
          }
        });
      })
      return count === 0 && !this.isSolved;
    },

    isSolved() {
      return this.puzzleLines.every((line, lineIndex) =>
        line.every((char, charIndex) => {
          // If it's a space, no need to reveal it.
          if (char === ' ') return true;

          // Otherwise, check if it's revealed.
          return this.revealed[lineIndex][charIndex];
        })
      );
    },
    showPlaceholder() {
      return !this.isSolved && !this.guessedAllConsonants && !this.message;
    }
  },
  beforeMount() {
    // Initialize "revealed" array before component is mounted
    this.initialize();
  },
  mounted() {
    // Listen for user key presses anywhere in the window
    window.addEventListener('keyup', this.handleKeyUp);
  },
  beforeUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp);
  },
  methods: {
    /**
     * Center-align a string within a given width, padded by spaces.
     * If the string is longer than the width, slice it to fit.
     * E.g. centerText("HELLO", 12) => '   HELLO    ' (12 characters total)
     */
    centerText(str, width) {
      if (str.length > width) {
        // If the puzzle text is longer than the width, we slice it.
        this.message = 'Puzzle text is too long!';
        return str.slice(0, width);
      }
      // Calculate padding
      const totalSpaces = width - str.length;
      const leftSpaces = Math.floor(totalSpaces / 2);
      const rightSpaces = totalSpaces - leftSpaces;
      return ' '.repeat(leftSpaces) + str + ' '.repeat(rightSpaces);
    },

    initialize() {
      // Create an array of the same shape as puzzleLines, filled with false
      this.revealed = this.puzzleLines.map(lineArray =>
        lineArray.map(() => false)
      );
      this.guessed = [];

    },

    handleKeyUp(e) {
      // If the user pressed Enter, reveal everything
      if (e.key === 'Enter') {
        this.revealAll();
        return;
      }

      // If the user pressed the right arrow key, go to the next puzzle
      if (e.key === 'ArrowRight') {
        this.movePuzzle('up');
        return;
      }

      if (e.key === 'ArrowLeft') {
        this.movePuzzle('down');
        return;
      }

      // Convert guess to uppercase (assuming puzzle letters are uppercase)
      const guess = e.key.toUpperCase();

      // Only consider A-Z letters
      if (!/^[A-ZÖÄÜ]$/.test(guess)) return;

      if (this.guessed.includes(guess)) {
        this.message = `"${guess}" wurde bereits geraten!`;
        // Reset message after 2 seconds
        setTimeout(() => {
          this.message = '';
        }, 2000);
        return;
      }

      this.guessed.push(guess);

      let found = false;

      // Loop over each line and each character; if it matches, reveal it
      this.puzzleLines.forEach((lineArray, lineIndex) => {
        lineArray.forEach((char, charIndex) => {
          if (char.toUpperCase() === guess) {
            this.revealed[lineIndex][charIndex] = true;
            found = true;
          }
        });
      });

      if (!found) {
        this.playSound('wrong');
        // this.message = 'Leider Falsch!';
        // // Reset message after 2 seconds
        // setTimeout(() => {
        //   this.message = '';
        // }, 2000);
      } else {
        this.playSound('correct');
        const letterCount = this.countLetters(guess);
        this.message = 'Richtig! ' + letterCount + 'x ' + guess;
        // Reset message after 2 seconds
        setTimeout(() => {
          this.message = '';
        }, 2000);

        if (this.isSolved) {
          console.log('Solved!');
          // Play sound
        }
      }
    },

    isRevealed(lineIndex, charIndex) {
      // Automatically reveal spaces or any character that has been set to true
      const char = this.puzzleLines[lineIndex][charIndex];
      return char === ' ' || this.revealed[lineIndex][charIndex];
    },

    countLetters(letter) {
      let count = 0;
      this.puzzleLines.forEach((lineArray) => {
        lineArray.forEach((char) => {
          if (char === letter) {
            count++;
          }
        });
      });
      return count;
    },

    revealAll() {
      // Set all positions in "revealed" to true
      this.puzzleLines.forEach((lineArray, lineIndex) => {
        lineArray.forEach((_, charIndex) => {
          this.revealed[lineIndex][charIndex] = true;
        });
      });
    },

    movePuzzle(direction) {
      if (direction === 'up') {
        this.currentPuzzle = this.currentPuzzle % Object.keys(this.puzzles).length + 1;
      } else {
        this.currentPuzzle = this.currentPuzzle === 1 ? Object.keys(this.puzzles).length : this.currentPuzzle - 1;
      }
      // Increment currentPuzzle, or reset to 1 if it exceeds the number of puzzles
      this.initialize();
    },

    playSound(name) {
      let sound = wrongSound
      if (name === 'correct') {
        sound = correctSound;
      }
      const audio = new Audio(sound);
      audio.play();
    }

  },
};
</script>

<style scoped>
/* Override #app's text alignment to let Bootstrap handle layout */

body {
    /* If using Vue/Vite and your image is inside "src/assets/" 
     you can reference it like this (SCSS/CSS): */
    background-image: url('@/assets/background-starts.png');

    /* Tiling the image across the page */
    background-repeat: repeat;

    /* Optional: If you want the image to move with scrolling */
    background-attachment: scroll;

    /* If you don't want any scaling, omit background-size, 
      or use "auto" to keep original tile size */
    background-size: auto;
}

/* We’ll still use puzzle-char for custom background or styling */
.puzzle-char {
  border-radius: 2px;
  color: black;
  min-width: 1.1em;
  min-height: 1.8em;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2em;
  font-weight: bold;
}
</style>
