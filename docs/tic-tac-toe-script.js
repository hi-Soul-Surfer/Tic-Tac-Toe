const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const difficultySelect = document.getElementById("difficulty");

const playerInput = document.getElementById("playerName");
const startBtn = document.getElementById("startBtn");
const gameUI = document.getElementById("gameUI");

const playerLabel = document.getElementById("playerLabel");
const playerWinsElement = document.getElementById("playerWins");
const aiWinsElement = document.getElementById("aiWins");
const drawsElement = document.getElementById("draws");

let playerName = "Player";
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let scores = {
  player: 0,
  ai: 0,
  draw: 0
};

const winningCombos = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

startBtn.addEventListener("click", () => {
  playerName = playerInput.value.trim() || "Player";
  playerLabel.textContent = playerName;
  document.querySelector(".player-input").style.display = "none";
  gameUI.style.display = "block";
  resetGame();
});

playerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    startBtn.click();
  }
});


function renderBoard() {
  boardElement.innerHTML = "";
  board.forEach((cell, index) => {
    const div = document.createElement("div");
    div.classList.add("cell");
    div.dataset.index = index;
    div.textContent = cell;
    if (!cell && gameActive) {
      div.addEventListener("click", handleClick);
    }
    boardElement.appendChild(div);
  });
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (board[index] !== "" || !gameActive) return;

  board[index] = currentPlayer;
  renderBoard();

  if (checkWin(currentPlayer)) {
    statusElement.textContent = `${playerName} wins!`;
    gameActive = false;
    scores.player++;
    updateScore();
    return;
  } else if (board.every(cell => cell !== "")) {
    statusElement.textContent = "It's a draw!";
    gameActive = false;
    scores.draw++;
    updateScore();
    return;
  }

  currentPlayer = "O";
  setTimeout(() => {
    const bestMove = getBestMove();
    board[bestMove] = currentPlayer;
    currentPlayer = "X";
    renderBoard();

    if (checkWin("O")) {
      statusElement.textContent = `AI wins!`;
      gameActive = false;
      scores.ai++;
      updateScore();
    } else if (board.every(cell => cell !== "")) {
      statusElement.textContent = "It's a draw!";
      gameActive = false;
      scores.draw++;
      updateScore();
    }
  }, 300);
}

function checkWin(player) {
  return winningCombos.some(combo =>
    combo.every(index => board[index] === player)
  );
}

function getBestMove() {
  const difficulty = difficultySelect.value;

  if (difficulty === "easy" && Math.random() < 0.5) {
    const empty = board
      .map((val, idx) => val === "" ? idx : null)
      .filter(v => v !== null);
    return empty[Math.floor(Math.random() * empty.length)];
  }

  // Hard mode: unbeatable
  let bestScore = -Infinity;
  let move;
  board.forEach((cell, index) => {
    if (cell === "") {
      board[index] = "O";
      let score = minimax(board, 0, false);
      board[index] = "";
      if (score > bestScore) {
        bestScore = score;
        move = index;
      }
    }
  });
  return move;
}

function minimax(board, depth, isMaximizing) {
  if (checkWin("O")) return 10 - depth;
  if (checkWin("X")) return depth - 10;
  if (board.every(cell => cell !== "")) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    board.forEach((cell, index) => {
      if (cell === "") {
        board[index] = "O";
        bestScore = Math.max(bestScore, minimax(board, depth + 1, false));
        board[index] = "";
      }
    });
    return bestScore;
  } else {
    let bestScore = Infinity;
    board.forEach((cell, index) => {
      if (cell === "") {
        board[index] = "X";
        bestScore = Math.min(bestScore, minimax(board, depth + 1, true));
        board[index] = "";
      }
    });
    return bestScore;
  }
}

function updateScore() {
  playerWinsElement.textContent = scores.player;
  aiWinsElement.textContent = scores.ai;
  drawsElement.textContent = scores.draw;
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  statusElement.textContent = "";
  renderBoard();
}

restartBtn.addEventListener("click", resetGame);
