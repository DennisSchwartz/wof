<template>
  <div id="app">
    <h1>Simple "Wheel of Fortune" Board</h1>
    
    <!-- Display the four lines of the current puzzle -->
    <div 
      v-for="(line, lineIndex) in puzzleLines" 
      :key="lineIndex" 
      class="puzzle-line"
    >
      <span 
        v-for="(char, charIndex) in line" 
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
      // Hardcoded puzzles, each with 4 lines
      puzzles: {
        1: {
          line1: [],
          line2: ['W', 'H', 'E', 'E', 'L', ' ', 'O', 'F'],
          line3: ['F', 'O', 'R', 'T', 'U', 'N', 'E'],
          line4: []
        },
      },

      // Which puzzle is currently in play
      currentPuzzle: 1,

      // Will store boolean arrays marking whether each character is revealed
      revealed: [],

      // For showing a quick alert message (e.g., WRONG GUESS)
      message: ''
    };
  },
  computed: {
    // A quick way to grab the lines for the current puzzle
    puzzleLines() {
      const puzzle = this.puzzles[this.currentPuzzle];
      return [puzzle.line1, puzzle.line2, puzzle.line3, puzzle.line4];
    }
  },
  beforeMount() {
    // Initialize "revealed" array before component is mounted
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
      this.revealed = this.puzzleLines.map(line => line.map(() => false));
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

      // Loop over each line and character; if it matches, reveal it
      this.puzzleLines.forEach((line, lineIndex) => {
        line.forEach((char, charIndex) => {
          if (char.toUpperCase() === guess) {
            // Direct assignment (no $set needed in Vue 3 for reactivity)
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
      // Simply set all positions to revealed = true
      this.puzzleLines.forEach((line, lineIndex) => {
        line.forEach((_, charIndex) => {
          this.revealed[lineIndex][charIndex] = true;
        });
      });
    }
  }
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
