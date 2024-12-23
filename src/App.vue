<template>
  <div id="app">
    <h1>Simple "Wheel of Fortune" Board</h1>
    
    <!-- Display the four lines of the current puzzle -->
    <div 
      v-for="(lineArray, lineIndex) in puzzleLines" 
      :key="lineIndex" 
      class="puzzle-line"
    >
      <span 
        v-for="(char, charIndex) in lineArray" 
        :key="charIndex" 
        class="puzzle-char"
      >
        {{ isRevealed(lineIndex, charIndex) ? char : '_' }}
      </span>
    </div>

    <div class="alert" v-if="message">{{ message }}</div>

    <!-- Reveal the entire puzzle -->
    <button @click="revealAll">Reveal All</button>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      // Hardcoded puzzles, each line as a string
      puzzles: {
        1: {
          line1: '',
          line2: 'WHEEL OF',
          line3: 'FORTUNE',
          line4: '',
        },
      },
      // Which puzzle is currently in play
      currentPuzzle: 1,

      // Stores boolean arrays marking whether each character is revealed
      revealed: [],

      // For showing a quick alert message (e.g., WRONG GUESS)
      message: '',
    };
  },
  computed: {
    /** 
     * Returns an array of 4 arrays: each array is the characters
     * from line1, line2, line3, line4. 
     */
    puzzleLines() {
      const puzzle = this.puzzles[this.currentPuzzle];
      return [
        puzzle.line1.split(''),
        puzzle.line2.split(''),
        puzzle.line3.split(''),
        puzzle.line4.split('')
      ];
    }
  },
  beforeMount() {
    // Initialize "revealed" array before the component is mounted
    this.initializeRevealed();
  },
  mounted() {
    // Listen for user key presses anywhere in the window
    window.addEventListener('keyup', this.handleKeyUp);
  },
  beforeUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp);
  },
  methods: {
    initializeRevealed() {
      // Create an array of the same shape as puzzleLines, filled with false
      // e.g., if line2 is "WHEEL OF" -> ["W", "H", "E", "E", "L", " ", "O", "F"]
      // then we do a boolean array: [false, false, false, false, false, false, false, false]
      this.revealed = this.puzzleLines.map(lineArray =>
        lineArray.map(() => false)
      );
    },

    handleKeyUp(e) {
      // If the user pressed Enter, reveal everything:
      if (e.key === 'Enter') {
        this.revealAll();
        return;
      }

      // Convert guess to uppercase (assuming puzzle letters are uppercase)
      const guess = e.key.toUpperCase();

      // Only consider A-Z letters
      if (!/^[A-Z]$/.test(guess)) return;

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

      // If we did not find any matches, show WRONG GUESS
      if (!found) {
        this.message = 'WRONG GUESS';
        // Reset message after 2 seconds
        setTimeout(() => {
          this.message = '';
        }, 2000);
      }
    },

    isRevealed(lineIndex, charIndex) {
      // Automatically reveal spaces or any character that has been set to true
      const char = this.puzzleLines[lineIndex][charIndex];
      return char === ' ' || this.revealed[lineIndex][charIndex];
    },

    revealAll() {
      // Set all positions in "revealed" to true
      this.puzzleLines.forEach((lineArray, lineIndex) => {
        lineArray.forEach((_, charIndex) => {
          this.revealed[lineIndex][charIndex] = true;
        });
      });
    },
  },
};
</script>

<style scoped>
#app {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.puzzle-line {
  margin: 8px 0;
}

.puzzle-char {
  display: inline-block;
  width: 20px;
  text-align: center;
  font-size: 1.5em;
  margin-right: 5px;
}

.alert {
  color: red;
  margin: 10px 0;
  font-weight: bold;
}
</style>
