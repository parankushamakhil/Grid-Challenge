// Grid Challenge Game Logic - Enhanced Responsive Version with Progressive Symmetry Difficulty

class GridChallengeGame {
  constructor() {
    // Game configuration from provided data
    this.config = {
      gameDuration: 360, // 6 minutes in seconds
      dotHighlightDuration: 3, // 3 seconds per highlight
      levels: [
        {
          level: 1,
          name: "Level 1 - Beginner",
          dotsToMemorize: 2,
          phases: [
            { type: "highlight", duration: 3 },
            { type: "symmetry", duration: 6 },
            { type: "highlight", duration: 3 },
            { type: "symmetry", duration: 6 },
            { type: "identify", duration: 12 },
          ],
        },
        {
          level: 2,
          name: "Level 2 - Intermediate",
          dotsToMemorize: 3,
          phases: [
            { type: "highlight", duration: 3 },
            { type: "symmetry", duration: 6 },
            { type: "highlight", duration: 3 },
            { type: "symmetry", duration: 6 },
            { type: "highlight", duration: 3 },
            { type: "symmetry", duration: 6 },
            { type: "identify", duration: 12 },
          ],
        },
        {
          level: 3,
          name: "Level 3 - Advanced",
          dotsToMemorize: 4,
          phases: [
            { type: "highlight", duration: 3 },
            { type: "symmetry", duration: 6 },
            { type: "highlight", duration: 3 },
            { type: "symmetry", duration: 6 },
            { type: "highlight", duration: 3 },
            { type: "symmetry", duration: 6 },
            { type: "highlight", duration: 3 },
            { type: "symmetry", duration: 6 },
            { type: "identify", duration: 12 },
          ],
        },
        {
          level: 4,
          name: "Level 4 - Expert",
          dotsToMemorize: 5,
          phases: [
            { type: "highlight", duration: 3 },
            { type: "symmetry", duration: 6 },
            { type: "highlight", duration: 3 },
            { type: "symmetry", duration: 6 },
            { type: "highlight", duration: 3 },
            { type: "symmetry", duration: 6 },
            { type: "highlight", duration: 3 },
            { type: "symmetry", duration: 6 },
            { type: "highlight", duration: 3 },
            { type: "symmetry", duration: 6 },
            { type: "identify", duration: 12 },
          ],
        },
      ],
      gridConfig: {
        totalDots: 60,
        gridWidth: 752, // 800 - 48 padding
        gridHeight: 552, // 600 - 48 padding
      },
      // Enhanced symmetry configuration with progressive difficulty
      symmetryConfig: {
        gridSize: 8,
        levelSettings: {
          1: {
            filledSquareChance: 0.3, // 30% filled squares
            symmetryChance: 0.7, // 70% chance of symmetry
            patternComplexity: "simple",
          },
          2: {
            filledSquareChance: 0.4, // 40% filled squares
            symmetryChance: 0.6, // 60% chance of symmetry
            patternComplexity: "moderate",
          },
          3: {
            filledSquareChance: 0.5, // 50% filled squares
            symmetryChance: 0.5, // 50% chance of symmetry
            patternComplexity: "complex",
          },
          4: {
            filledSquareChance: 0.6, // 60% filled squares
            symmetryChance: 0.45, // 45% chance of symmetry
            patternComplexity: "expert",
          },
        },
      },
      visualFormat: {
        highlightedDotColor: "#000000", // Black
        nonHighlightedDotColor: "#CCCCCC", // Light grey
        backgroundColor: "#FEFEFE",
        borderColor: "#000000",
      },
    };

    // Game state initialization
    this.gameState = {
      isPlaying: false,
      timeRemaining: this.config.gameDuration,
      selectedLevel: 1,
      currentPhase: 0,
      currentRound: 1,
      score: 0,
      roundsCompleted: 0,
      roundsAttempted: 0,
      memorizedSequence: [],
      userSequence: [],
      currentSymmetryAnswer: false,
      roundPhaseResults: [],
      highlightPhaseCount: 0,
      currentDots: [],
    };

    // Timers
    this.gameTimer = null;
    this.phaseTimer = null;

    // DOM elements
    this.elements = {};

    // Initialize when DOM is ready
    this.init();
  }

  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.setup();
      });
    } else {
      this.setup();
    }

    // Handle window resize for responsive behavior
    window.addEventListener(
      "resize",
      this.debounce(() => {
        if (this.gameState.isPlaying) {
          this.updateGridConfig();
          // Re-render current phase if needed
          this.refreshCurrentPhase();
        }
      }, 250)
    );

    // Handle orientation change
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        if (this.gameState.isPlaying) {
          this.updateGridConfig();
          this.refreshCurrentPhase();
        }
      }, 100);
    });
  }

  // Utility function for debouncing resize events
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Update grid configuration based on screen size
  updateGridConfig() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const availableHeight = screenHeight - 200; // More conservative buffer
    const availableWidth = screenWidth - 40; // Account for padding

    if (screenWidth <= 480) {
      // Small phones - very conservative
      this.config.gridConfig = {
        totalDots: Math.max(15, Math.min(25, this.config.gridConfig.totalDots)),
        gridWidth: Math.min(250, availableWidth * 0.85),
        gridHeight: Math.min(180, availableHeight * 0.5),
      };
    } else if (screenWidth <= 768) {
      // Tablets
      this.config.gridConfig = {
        totalDots: Math.max(25, Math.min(40, this.config.gridConfig.totalDots)),
        gridWidth: Math.min(350, availableWidth * 0.8),
        gridHeight: Math.min(260, availableHeight * 0.6),
      };
    } else if (screenWidth <= 1024) {
      // Small desktops
      this.config.gridConfig = {
        totalDots: Math.max(35, Math.min(50, this.config.gridConfig.totalDots)),
        gridWidth: Math.min(450, availableWidth * 0.7),
        gridHeight: Math.min(340, availableHeight * 0.65),
      };
    } else {
      // Large desktops
      this.config.gridConfig = {
        totalDots: 60,
        gridWidth: 500, // Reduced from 600
        gridHeight: 375, // Reduced from 450
      };
    }
  }

  // Refresh current phase after resize
  refreshCurrentPhase() {
    if (!this.gameState.isPlaying) return;

    const activePhase = document.querySelector(".phase-container:not(.hidden)");
    if (!activePhase) return;

    // Regenerate dots if we're in a dot-based phase
    if (
      activePhase.id === "dotGridPhase" ||
      activePhase.id === "identificationPhase"
    ) {
      // Regenerate dots with new grid config
      this.gameState.currentDots = this.generateRandomDots();
      if (activePhase.id === "dotGridPhase") {
        this.renderDotGrid(this.elements.dotGrid, this.gameState.currentDots);
        // Re-highlight current dots if in highlight phase
        this.gameState.memorizedSequence.forEach((dot) => {
          this.highlightSingleDot(dot.id);
        });
      } else if (activePhase.id === "identificationPhase") {
        this.renderDotGrid(
          this.elements.identifyGrid,
          this.gameState.currentDots
        );
        this.setupIdentificationClickHandlers();
      }
    }
  }

  setup() {
    this.initializeElements();
    this.setupEventListeners();
    this.updateGridConfig(); // Set initial grid config
    console.log("Grid Challenge Game initialized successfully");
  }
  initializeElements() {
    this.elements = {
      startScreen: document.getElementById("startScreen"),
      levelScreen: document.getElementById("levelScreen"),
      gameScreen: document.getElementById("gameScreen"),
      endScreen: document.getElementById("endScreen"),
      startButton: document.getElementById("startButton"),
      backToStartButton: document.getElementById("backToStartButton"),
      playAgainButton: document.getElementById("playAgainButton"),
      levelSelectButtons: document.querySelectorAll(".level-select-btn"),
      timer: document.getElementById("timer"),
      currentLevel: document.getElementById("currentLevel"),
      currentPhase: document.getElementById("currentPhase"),
      currentRound: document.getElementById("currentRound"),
      dotGridPhase: document.getElementById("dotGridPhase"),
      symmetryPhase: document.getElementById("symmetryPhase"),
      identificationPhase: document.getElementById("identificationPhase"),
      dotGrid: document.getElementById("dotGrid"),
      leftGrid: document.getElementById("leftGrid"),
      rightGrid: document.getElementById("rightGrid"),
      identifyGrid: document.getElementById("identifyGrid"),
      yesButton: document.getElementById("yesButton"),
      noButton: document.getElementById("noButton"),
      dotPhaseTimer: document.getElementById("dotPhaseTimer"),
      symmetryPhaseTimer: document.getElementById("symmetryPhaseTimer"),
      identifyPhaseTimer: document.getElementById("identifyPhaseTimer"),
      dotPhaseTitle: document.getElementById("dotPhaseTitle"),
      sequenceDisplay: document.getElementById("sequenceDisplay"),
      finalScore: document.getElementById("finalScore"),
      roundsAttempted: document.getElementById("roundsAttempted"),
      roundsCompleted: document.getElementById("roundsCompleted"),
      accuracy: document.getElementById("accuracy"),
      levelCompleted: document.getElementById("levelCompleted"),
      timePlayed: document.getElementById("timePlayed"),
      performanceText: document.getElementById("performanceText"),
      highScoreValue: document.getElementById("highScoreValue"),
    };

    // Verify critical elements
    const criticalElements = [
      "startScreen",
      "levelScreen",
      "gameScreen",
      "endScreen",
      "startButton",
      "dotGrid",
      "leftGrid",
      "rightGrid",
      "identifyGrid",
      "timer",
      "currentLevel",
      "currentRound",
    ];

    const missingElements = criticalElements.filter((id) => !this.elements[id]);
    if (missingElements.length > 0) {
      console.error("Missing critical elements:", missingElements);
      throw new Error(
        `Game cannot start - missing elements: ${missingElements.join(", ")}`
      );
    }

    console.log("All elements initialized successfully");
  }

  setupEventListeners() {
    // Start button
    if (this.elements.startButton) {
      this.elements.startButton.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Start button clicked - going to level selection");
        this.showLevelSelection();
      });
    }

    // Back to start button
    if (this.elements.backToStartButton) {
      this.elements.backToStartButton.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Back to start clicked");
        this.showStartScreen();
      });
    }

    // Level selection buttons
    if (this.elements.levelSelectButtons) {
      this.elements.levelSelectButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const level = parseInt(
            e.currentTarget.getAttribute("data-level"),
            10
          );
          console.log(`Level ${level} selected`);
          this.selectLevel(level);
        });
      });
    }

    // Play again button
    if (this.elements.playAgainButton) {
      this.elements.playAgainButton.addEventListener("click", (e) => {
        e.preventDefault();
        this.resetGame();
      });
    }

    // Symmetry buttons
    if (this.elements.yesButton) {
      this.elements.yesButton.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleSymmetryAnswer(true);
      });
    }

    if (this.elements.noButton) {
      this.elements.noButton.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleSymmetryAnswer(false);
      });
    }

    console.log("Event listeners setup completed");
  }

  showStartScreen() {
    this.switchScreen("start");
  }

  showLevelSelection() {
    this.switchScreen("level");
  }

  selectLevel(level) {
    console.log(`Starting game at level ${level}`);
    this.gameState.selectedLevel = level;
    const hs = this.getHighScore(level);
    if (this.elements.highScoreValue) {
      this.elements.highScoreValue.textContent = `${hs}`;
    }

    this.startGame();
  }

  startGame() {
    console.log(`Starting game at level ${this.gameState.selectedLevel}...`);
    this.switchScreen("game");
    this.gameState.isPlaying = true;
    this.gameState.timeRemaining = this.config.gameDuration;
    this.gameState.currentRound = 1;
    this.gameState.score = 0;
    this.gameState.roundsCompleted = 0;
    this.gameState.roundsAttempted = 0;
    this.mainStartTime = Date.now();

    this.elements.currentLevel.textContent = this.gameState.selectedLevel;
    this.elements.currentRound.textContent = this.gameState.currentRound;

    if (this.gameTimer) clearInterval(this.gameTimer);
    this.gameTimer = setInterval(() => {
      this.gameState.timeRemaining--;
      this.updateTimer();
      if (this.gameState.timeRemaining <= 0) {
        this.endGame();
      }
    }, 1000);

    this.updateTimer();
    this.startRound();
  }

  startRound() {
    if (!this.gameState.isPlaying) return;

    console.log(
      `Starting round ${this.gameState.currentRound} - Level ${this.gameState.selectedLevel}`
    );

    // Reset round state
    this.gameState.memorizedSequence = [];
    this.gameState.userSequence = [];
    this.gameState.currentPhase = 0;
    this.gameState.roundPhaseResults = [];
    this.gameState.highlightPhaseCount = 0;
    this.gameState.roundsAttempted++;

    // Generate dots for the round with current screen size
    this.updateGridConfig();
    this.gameState.currentDots = this.generateRandomDots();

    // Update round display
    this.elements.currentRound.textContent = this.gameState.currentRound;

    this.runPhase();
  }

  runPhase() {
    if (!this.gameState.isPlaying) return;

    const currentLevelConfig =
      this.config.levels[this.gameState.selectedLevel - 1];
    const phase = currentLevelConfig.phases[this.gameState.currentPhase];

    if (!phase) {
      this.completeRound();
      return;
    }

    console.log(`Running phase: ${phase.type} for ${phase.duration}s`);
    this.updatePhaseDisplay(phase.type);

    switch (phase.type) {
      case "highlight":
        this.runHighlightPhase(
          phase.duration,
          currentLevelConfig.dotsToMemorize
        );
        break;
      case "symmetry":
        this.runSymmetryPhase(phase.duration);
        break;
      case "identify":
        this.runIdentifyPhase(phase.duration);
        break;
      default:
        console.warn(`Unknown phase type: ${phase.type}`);
        this.gameState.currentPhase++;
        this.runPhase();
        break;
    }
  }

  runHighlightPhase(duration, totalDots) {
    this.switchPhase("dot");
    this.elements.dotPhaseTitle.textContent = "Memorize the highlighted dot";

    // Render dots
    this.renderDotGrid(this.elements.dotGrid, this.gameState.currentDots);

    this.gameState.highlightPhaseCount++;
    if (
      this.gameState.memorizedSequence.length <
      Math.min(this.gameState.highlightPhaseCount, totalDots)
    ) {
      const usedIds = this.gameState.memorizedSequence.map((d) => d.id);
      const unusedDots = this.gameState.currentDots.filter(
        (d) => !usedIds.includes(d.id)
      );

      if (unusedDots.length > 0) {
        const newDot =
          unusedDots[Math.floor(Math.random() * unusedDots.length)];
        this.gameState.memorizedSequence.push(newDot);

        // Highlight the newest dot for exactly 3 seconds
        const latestDotIndex = this.gameState.memorizedSequence.length - 1;
        if (latestDotIndex >= 0) {
          this.highlightSingleDot(
            this.gameState.memorizedSequence[latestDotIndex].id
          );
        }
      }
    }

    this.startPhaseTimer(duration, () => {
      this.gameState.currentPhase++;
      this.runPhase();
    });
  }

  highlightSingleDot(dotId) {
    console.log(`Highlighting single dot ${dotId} for exactly 3 seconds`);
    const dot = this.elements.dotGrid.querySelector(`[data-id="${dotId}"]`);
    if (dot) {
      dot.classList.add("highlighted");
      setTimeout(() => {
        dot.classList.remove("highlighted");
      }, this.config.dotHighlightDuration * 1000);
    } else {
      console.error(`Dot ${dotId} not found for highlighting`);
    }
  }

  // Enhanced symmetry phase with progressive difficulty
  runSymmetryPhase(duration) {
    this.switchPhase("symmetry");

    // Get level-specific settings
    const levelSettings =
      this.config.symmetryConfig.levelSettings[this.gameState.selectedLevel];
    const isSymmetric = Math.random() < levelSettings.symmetryChance;

    this.gameState.currentSymmetryAnswer = isSymmetric;

    // Generate patterns based on level difficulty
    const leftPattern = this.generateSymmetryPattern();
    const rightPattern = isSymmetric
      ? this.mirrorPattern(leftPattern)
      : this.generateSymmetryPattern();

    this.renderSymmetryGrid(this.elements.leftGrid, leftPattern);
    this.renderSymmetryGrid(this.elements.rightGrid, rightPattern);

    this.elements.yesButton.disabled = false;
    this.elements.noButton.disabled = false;

    this.startPhaseTimer(duration, () => {
      this.elements.yesButton.disabled = true;
      this.elements.noButton.disabled = true;
      // Record as incorrect if timeout
      this.gameState.roundPhaseResults.push(false);
      this.gameState.currentPhase++;
      this.runPhase();
    });
  }

  runIdentifyPhase(duration) {
    this.switchPhase("identify");
    this.elements.sequenceDisplay.textContent = "-";

    this.renderDotGrid(this.elements.identifyGrid, this.gameState.currentDots);
    this.setupIdentificationClickHandlers();
    this.gameState.userSequence = [];

    this.startPhaseTimer(duration, () => {
      const memoryCorrect = this.checkMemorySequence();
      this.gameState.roundPhaseResults.push(memoryCorrect);
      this.completeRound();
    });
  }
  setupIdentificationClickHandlers() {
    // Clear existing click listeners safely
    const dotElements = this.elements.identifyGrid.querySelectorAll(".dot");
    dotElements.forEach((dot) => {
      const newDot = dot.cloneNode(true);
      dot.parentNode.replaceChild(newDot, dot);

      // Add both click and touch event listeners
      newDot.addEventListener("click", (e) => this.handleDotClick(e));
      newDot.addEventListener("touchend", (e) => {
        e.preventDefault(); // Prevent double-firing of click event
        this.handleDotClick(e);
      });
      newDot.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.handleDotClick(e);
        }
      });
    });
  }

  handleDotClick(event) {
    const target = event.currentTarget || event.target;
    const dotId = parseInt(target.dataset.id, 10);
    if (isNaN(dotId)) return;

    if (
      this.gameState.userSequence.length <
      this.gameState.memorizedSequence.length
    ) {
      this.gameState.userSequence.push({ id: dotId });
      target.classList.add("clicked");

      this.elements.sequenceDisplay.textContent = this.gameState.userSequence
        .map((_, i) => i + 1)
        .join(" → ");

      if (
        this.gameState.userSequence.length ===
        this.gameState.memorizedSequence.length
      ) {
        const memoryCorrect = this.checkMemorySequence();
        this.gameState.roundPhaseResults.push(memoryCorrect);
        setTimeout(() => this.completeRound(), 500);
      }
    }
  }

  handleSymmetryAnswer(answer) {
    this.elements.yesButton.disabled = true;
    this.elements.noButton.disabled = true;

    const correct = answer === this.gameState.currentSymmetryAnswer;
    this.gameState.roundPhaseResults.push(correct);

    setTimeout(() => {
      this.gameState.currentPhase++;
      this.runPhase();
    }, 500);
  }

  checkMemorySequence() {
    const correct =
      this.gameState.userSequence.length ===
        this.gameState.memorizedSequence.length &&
      this.gameState.userSequence.every(
        (dot, index) => dot.id === this.gameState.memorizedSequence[index].id
      );

    if (!correct) {
      const clicked =
        this.elements.identifyGrid.querySelectorAll(".dot.clicked");
      clicked.forEach((d) => d.classList.add("wrong"));
    }

    return correct;
  }

  completeRound() {
    console.log(`Round ${this.gameState.currentRound} completed.`);
    console.log("Phase results:", this.gameState.roundPhaseResults);

    // Award point only if all phases correct
    const allPhasesCorrect = this.gameState.roundPhaseResults.every(
      (result) => result === true
    );

    if (allPhasesCorrect) {
      this.gameState.score++;
      this.gameState.roundsCompleted++;
      console.log(`Point awarded! Total score now: ${this.gameState.score}`);
    } else {
      console.log("No point awarded - not all phases were correct");
    }

    // Advance to next round
    this.gameState.currentRound++;
    setTimeout(() => {
      if (this.gameState.isPlaying) {
        this.startRound();
      }
    }, 1000);
  }

  generateRandomDots() {
    const dots = [];
    const gridWidth = this.config.gridConfig.gridWidth;
    const gridHeight = this.config.gridConfig.gridHeight;
    const minDistance = Math.max(20, Math.min(30, gridWidth / 20)); // Responsive min distance
    const totalDots = this.config.gridConfig.totalDots;

    for (let i = 0; i < totalDots; i++) {
      let position;
      let attempts = 0;
      do {
        position = {
          id: i,
          x: Math.random() * (gridWidth - 20), // Account for dot size
          y: Math.random() * (gridHeight - 20),
        };
        attempts++;
      } while (
        attempts < 100 &&
        dots.some(
          (dot) =>
            Math.hypot(dot.x - position.x, dot.y - position.y) < minDistance
        )
      );

      dots.push(position);
    }

    return dots;
  }

  renderDotGrid(container, dots) {
    container.innerHTML = "";
    dots.forEach((dot, index) => {
      const dotElement = document.createElement("div");
      dotElement.className = "dot";
      dotElement.dataset.id = dot.id;
      dotElement.style.left = `${dot.x}px`;
      dotElement.style.top = `${dot.y}px`;
      dotElement.style.backgroundColor =
        this.config.visualFormat.nonHighlightedDotColor;
      dotElement.setAttribute("role", "button");
      dotElement.setAttribute("aria-label", `Dot ${index + 1}`);
      dotElement.setAttribute("tabindex", "0");
      container.appendChild(dotElement);
    });
  }

  // Enhanced symmetry pattern generation with progressive difficulty
  generateSymmetryPattern() {
    const pattern = [];
    const size = this.config.symmetryConfig.gridSize;
    const levelSettings =
      this.config.symmetryConfig.levelSettings[this.gameState.selectedLevel];
    const filledChance = levelSettings.filledSquareChance;
    const complexity = levelSettings.patternComplexity;

    // Generate base pattern based on complexity level
    switch (complexity) {
      case "simple":
        // Simple patterns with clear distinct areas
        return this.generateSimplePattern(size, filledChance);

      case "moderate":
        // More complex with some clustering
        return this.generateModeratePattern(size, filledChance);

      case "complex":
        // Complex patterns with clusters and varied distribution
        return this.generateComplexPattern(size, filledChance);

      case "expert":
        // Very complex patterns that are hard to distinguish
        return this.generateExpertPattern(size, filledChance);

      default:
        return this.generateSimplePattern(size, filledChance);
    }
  }

  // Simple pattern generation for Level 1
  generateSimplePattern(size, filledChance) {
    const pattern = [];
    const totalCells = size * size;

    // Create clear, well-spaced patterns
    for (let i = 0; i < totalCells; i++) {
      const row = Math.floor(i / size);
      const col = i % size;

      // Create some simple geometric patterns or random but clear distribution
      let shouldBeFilled = false;

      // Add some structure to make patterns more recognizable
      if (Math.random() < filledChance) {
        // Simple clustering logic
        if (i > 0 && pattern[i - 1] === "square" && Math.random() < 0.3) {
          shouldBeFilled = true;
        } else if (
          i >= size &&
          pattern[i - size] === "square" &&
          Math.random() < 0.3
        ) {
          shouldBeFilled = true;
        } else if (Math.random() < filledChance * 0.8) {
          shouldBeFilled = true;
        }
      }

      pattern.push(shouldBeFilled ? "square" : "dot");
    }

    return pattern;
  }

  // Moderate pattern generation for Level 2
  generateModeratePattern(size, filledChance) {
    const pattern = [];
    const totalCells = size * size;

    // Create more complex patterns with clusters
    for (let i = 0; i < totalCells; i++) {
      const row = Math.floor(i / size);
      const col = i % size;

      let shouldBeFilled = false;

      // More sophisticated clustering
      if (Math.random() < filledChance) {
        // Check for neighbors to create clusters
        const neighbors = this.getNeighborIndices(i, size);
        const filledNeighbors = neighbors.filter(
          (idx) => idx < pattern.length && pattern[idx] === "square"
        ).length;

        if (filledNeighbors > 0) {
          shouldBeFilled = Math.random() < 0.6; // Higher chance near filled squares
        } else {
          shouldBeFilled = Math.random() < filledChance * 0.9;
        }
      }

      pattern.push(shouldBeFilled ? "square" : "dot");
    }

    return pattern;
  }

  // Complex pattern generation for Level 3
  generateComplexPattern(size, filledChance) {
    const pattern = [];
    const totalCells = size * size;

    // Generate multiple cluster centers
    const clusterCenters = [];
    const numClusters = Math.floor(Math.random() * 3) + 2; // 2-4 clusters

    for (let c = 0; c < numClusters; c++) {
      clusterCenters.push({
        row: Math.floor(Math.random() * size),
        col: Math.floor(Math.random() * size),
        strength: Math.random() * 0.5 + 0.3, // 0.3-0.8 strength
      });
    }

    for (let i = 0; i < totalCells; i++) {
      const row = Math.floor(i / size);
      const col = i % size;

      let fillProbability = 0;

      // Calculate influence from each cluster center
      clusterCenters.forEach((center) => {
        const distance = Math.sqrt(
          Math.pow(row - center.row, 2) + Math.pow(col - center.col, 2)
        );
        const influence = center.strength * Math.exp(-distance / 2);
        fillProbability += influence;
      });

      // Add base probability
      fillProbability = Math.min(fillProbability + filledChance * 0.3, 0.9);

      pattern.push(Math.random() < fillProbability ? "square" : "dot");
    }

    return pattern;
  }

  // Expert pattern generation for Level 4
  generateExpertPattern(size, filledChance) {
    const pattern = [];
    const totalCells = size * size;

    // Very complex patterns with noise and subtle differences
    for (let i = 0; i < totalCells; i++) {
      const row = Math.floor(i / size);
      const col = i % size;

      let fillProbability = filledChance;

      // Add multiple overlapping pattern influences

      // Checkerboard influence (subtle)
      if ((row + col) % 2 === 0) {
        fillProbability *= 1.1;
      }

      // Diagonal patterns
      if (Math.abs(row - col) <= 1) {
        fillProbability *= 1.15;
      }

      // Edge effects
      const distFromEdge = Math.min(row, col, size - 1 - row, size - 1 - col);
      if (distFromEdge <= 1) {
        fillProbability *= 0.9;
      }

      // Add noise for complexity
      const noise = (Math.random() - 0.5) * 0.2;
      fillProbability += noise;

      // Local neighbor influence (high complexity)
      if (i > 0) {
        const neighbors = this.getNeighborIndices(i, size);
        const filledNeighbors = neighbors.filter(
          (idx) => idx < pattern.length && pattern[idx] === "square"
        ).length;

        if (filledNeighbors >= 2) {
          fillProbability *= 1.3;
        } else if (filledNeighbors === 1) {
          fillProbability *= 1.1;
        }
      }

      fillProbability = Math.max(0, Math.min(fillProbability, 0.95));
      pattern.push(Math.random() < fillProbability ? "square" : "dot");
    }

    return pattern;
  }

  // Helper function to get neighbor indices
  getNeighborIndices(index, gridSize) {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const neighbors = [];

    // Check all 8 directions
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;

        const newRow = row + dr;
        const newCol = col + dc;

        if (
          newRow >= 0 &&
          newRow < gridSize &&
          newCol >= 0 &&
          newCol < gridSize
        ) {
          neighbors.push(newRow * gridSize + newCol);
        }
      }
    }

    return neighbors;
  }

  mirrorPattern(pattern) {
    const size = this.config.symmetryConfig.gridSize;
    const mirrored = new Array(pattern.length);

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const originalIndex = row * size + col;
        const mirroredCol = size - 1 - col;
        const mirroredIndex = row * size + mirroredCol;
        mirrored[mirroredIndex] = pattern[originalIndex];
      }
    }

    return mirrored;
  }

  // Enhanced grid rendering to ensure all cells have dots when not filled
  renderSymmetryGrid(container, pattern) {
    container.innerHTML = "";
    pattern.forEach((cellType) => {
      const cell = document.createElement("div");
      cell.className = "grid-cell";

      if (cellType === "square") {
        cell.classList.add("filled");
      } else {
        // All non-filled cells get dots (no empty cells)
        const dot = document.createElement("div");
        dot.className = "cell-dot";
        cell.appendChild(dot);
      }

      container.appendChild(cell);
    });
  }
  startPhaseTimer(duration, callback) {
    if (this.phaseTimer) clearInterval(this.phaseTimer);
    const startTime = Date.now();
    const timerElement = this.getCurrentPhaseTimerElement();

    const update = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const timeLeft = duration - elapsed;
      if (timerElement) timerElement.textContent = Math.max(0, timeLeft);

      if (timeLeft <= 0) {
        clearInterval(this.phaseTimer);
        callback();
      }
    };

    update(); // initial update
    this.phaseTimer = setInterval(update, 100);
  }

  getCurrentPhaseTimerElement() {
    const activePhase = document.querySelector(".phase-container:not(.hidden)");
    return activePhase ? activePhase.querySelector(".phase-timer") : null;
  }

  switchPhase(phaseType) {
    // Hide all phases
    this.elements.dotGridPhase.classList.add("hidden");
    this.elements.symmetryPhase.classList.add("hidden");
    this.elements.identificationPhase.classList.add("hidden");

    // Show current
    switch (phaseType) {
      case "dot":
        this.elements.dotGridPhase.classList.remove("hidden");
        break;
      case "symmetry":
        this.elements.symmetryPhase.classList.remove("hidden");
        break;
      case "identify":
        this.elements.identificationPhase.classList.remove("hidden");
        break;
      default:
        break;
    }
  }

  updatePhaseDisplay(phaseType) {
    const phaseNames = {
      highlight: "Memory",
      symmetry: "Symmetry",
      identify: "Recall",
    };
    this.elements.currentPhase.textContent = phaseNames[phaseType] || phaseType;
  }

  updateTimer() {
    const minutes = Math.floor(this.gameState.timeRemaining / 60);
    const seconds = this.gameState.timeRemaining % 60;
    this.elements.timer.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  switchScreen(screenType) {
    // Hide all
    this.elements.startScreen.classList.remove("active");
    this.elements.levelScreen.classList.remove("active");
    this.elements.gameScreen.classList.remove("active");
    this.elements.endScreen.classList.remove("active");

    // Show selected
    switch (screenType) {
      case "start":
        this.elements.startScreen.classList.add("active");
        break;
      case "level":
        this.elements.levelScreen.classList.add("active");
        break;
      case "game":
        this.elements.gameScreen.classList.add("active");
        break;
      case "end":
        this.elements.endScreen.classList.add("active");
        break;
      default:
        break;
    }
  }

  endGame() {
    console.log("Game ended");
    this.gameState.isPlaying = false;
    if (this.gameTimer) clearInterval(this.gameTimer);
    if (this.phaseTimer) clearInterval(this.phaseTimer);

    this.displayResults();
    this.switchScreen("end");
  }

  displayResults() {
    const totalPointsEarned = this.gameState.score;
    const totalRoundsAttempted = Math.max(1, this.gameState.roundsAttempted);
    const roundsCompleted = this.gameState.roundsCompleted;
    const successRate = Math.round(
      (roundsCompleted / totalRoundsAttempted) * 100
    );
    const levelCompleted = this.gameState.selectedLevel;
    const elapsedSeconds = Math.max(
      0,
      Math.min(
        this.config.gameDuration,
        Math.floor((Date.now() - (this.mainStartTime || Date.now())) / 1000)
      )
    );

    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const timePlayed = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    this.elements.finalScore.textContent = totalPointsEarned;
    this.elements.roundsAttempted.textContent = totalRoundsAttempted;
    this.elements.roundsCompleted.textContent = roundsCompleted;
    this.elements.accuracy.textContent = `${successRate}%`;
    this.elements.levelCompleted.textContent = levelCompleted;
    this.elements.timePlayed.textContent = timePlayed;

    this.saveHighScore();

    let message = "Try again for better results!";
    if (successRate >= 90)
      message = "Outstanding performance! You're a memory master!";
    else if (successRate >= 75)
      message = "Excellent work! Your focus is impressive!";
    else if (successRate >= 60)
      message = "Good job! You're developing strong skills!";
    else if (successRate >= 40)
      message = "Keep practicing! You're making progress!";
    else if (successRate >= 20) message = "Not bad! Room for improvement!";

    this.elements.performanceText.textContent = message;

    console.log("Final Results:", {
      totalPointsEarned,
      totalRoundsAttempted,
      roundsCompleted,
      successRate: `${successRate}%`,
      levelCompleted,
      timePlayed,
    });
  }

  resetGame() {
    console.log("Resetting game");
    if (this.gameTimer) clearInterval(this.gameTimer);
    if (this.phaseTimer) clearInterval(this.phaseTimer);

    this.gameState = {
      isPlaying: false,
      timeRemaining: this.config.gameDuration,
      selectedLevel: 1,
      currentPhase: 0,
      currentRound: 1,
      score: 0,
      roundsCompleted: 0,
      roundsAttempted: 0,
      memorizedSequence: [],
      userSequence: [],
      currentSymmetryAnswer: false,
      roundPhaseResults: [],
      highlightPhaseCount: 0,
      currentDots: [],
    };

    this.switchScreen("start");
  }

  saveHighScore() {
    try {
      const data = {
        level: this.gameState.selectedLevel,
        score: this.gameState.score,
        accuracy: Math.round(
          (this.gameState.roundsCompleted /
            Math.max(1, this.gameState.roundsAttempted)) *
            100
        ),
        date: new Date().toISOString(),
      };

      const key = "gridChallengeHighScores";
      let all = JSON.parse(localStorage.getItem(key) || "[]");
      all.push(data);

      // Keep top 10 scores per level
      const filtered = all
        .filter((s) => s.level === this.gameState.selectedLevel)
        .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy)
        .slice(0, 10);

      const others = all.filter(
        (s) => s.level !== this.gameState.selectedLevel
      );
      const finalArr = others.concat(filtered);

      localStorage.setItem(key, JSON.stringify(finalArr));
    } catch (error) {
      console.warn("Could not save high score:", error);
    }
  }

  getHighScore(level) {
    try {
      const key = "gridChallengeHighScores";
      const all = JSON.parse(localStorage.getItem(key) || "[]");
      const levelScores = all.filter((s) => s.level === level);
      return levelScores.length > 0
        ? Math.max(...levelScores.map((s) => s.score))
        : 0;
    } catch (error) {
      console.warn("Could not load high score:", error);
      return 0;
    }
  }
}

// Initialize game on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing Grid Challenge Game");
  window.game = new GridChallengeGame();
});
