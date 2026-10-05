const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const modeEl = document.getElementById("mode");
const playerMarkEl = document.getElementById("playerMark");
const resetBtn = document.getElementById("resetBtn");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDrawEl = document.getElementById("scoreDraw");

const wins = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

let board = Array(9).fill("");
let current = "X";
let gameOver = false;
let scores = { X: 0, O: 0, draw: 0 };

function render() {
  boardEl.innerHTML = "";
  board.forEach((value, index) => {
    const cell = document.createElement("button");
    cell.className = "cell";
    cell.dataset.index = index;
    cell.textContent = value;
    cell.setAttribute("aria-label", value ? `Cell ${index + 1}: ${value}` : `Cell ${index + 1}`);
    cell.disabled = Boolean(value) || gameOver || (modeEl.value === "ai" && current !== playerMarkEl.value);
    if (value) cell.classList.add(value.toLowerCase());
    cell.addEventListener("click", () => makeMove(index));
    boardEl.appendChild(cell);
  });

  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDrawEl.textContent = scores.draw;

  if (!gameOver) {
    if (modeEl.value === "ai" && current !== playerMarkEl.value) {
      statusEl.textContent = "AI is thinking…";
    } else {
      statusEl.textContent = `Player ${current}'s turn`;
    }
  }
}

function checkWinner(state) {
  for (const combo of wins) {
    const [a,b,c] = combo;
    if (state[a] && state[a] === state[b] && state[a] === state[c]) {
      return { winner: state[a], combo };
    }
  }
  if (state.every(Boolean)) return { winner: "draw", combo: [] };
  return null;
}

function makeMove(index) {
  if (gameOver || board[index]) return;
  if (modeEl.value === "ai" && current !== playerMarkEl.value) return;

  board[index] = current;
  const result = checkWinner(board);

  if (result) {
    finish(result);
    return;
  }

  current = current === "X" ? "O" : "X";
  render();

  if (modeEl.value === "ai" && current !== playerMarkEl.value) {
    setTimeout(aiMove, 420);
  }
}

function finish(result) {
  gameOver = true;

  if (result.winner === "draw") {
    scores.draw++;
    statusEl.textContent = "It's a draw! 🤝";
  } else {
    scores[result.winner]++;
    statusEl.textContent = `Player ${result.winner} wins! 🎉`;
    result.combo.forEach(i => boardEl.children[i].classList.add("win"));
  }

  render();
  // render() rebuilds cells, so re-apply winning state after rendering.
  if (result.winner !== "draw") {
    result.combo.forEach(i => boardEl.children[i].classList.add("win"));
  }
}

function aiMove() {
  if (gameOver) return;

  const ai = playerMarkEl.value === "X" ? "O" : "X";
  const human = playerMarkEl.value;

  const move = findBestMove(board, ai, human);
  board[move] = ai;

  const result = checkWinner(board);
  if (result) {
    finish(result);
    return;
  }

  current = human;
  render();
}

function findBestMove(state, ai, human) {
  // Minimax gives the AI optimal play.
  let bestScore = -Infinity;
  let bestMove = null;

  for (let i = 0; i < 9; i++) {
    if (!state[i]) {
      state[i] = ai;
      const score = minimax(state, 0, false, ai, human);
      state[i] = "";
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function minimax(state, depth, maximizing, ai, human) {
  const result = checkWinner(state);
  if (result) {
    if (result.winner === ai) return 10 - depth;
    if (result.winner === human) return depth - 10;
    return 0;
  }

  if (maximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!state[i]) {
        state[i] = ai;
        best = Math.max(best, minimax(state, depth + 1, false, ai, human));
        state[i] = "";
      }
    }
    return best;
  }

  let best = Infinity;
  for (let i = 0; i < 9; i++) {
    if (!state[i]) {
      state[i] = human;
      best = Math.min(best, minimax(state, depth + 1, true, ai, human));
      state[i] = "";
    }
  }
  return best;
}

function resetGame() {
  board = Array(9).fill("");
  current = "X";
  gameOver = false;
  render();

  if (modeEl.value === "ai" && current !== playerMarkEl.value) {
    setTimeout(aiMove, 350);
  }
}

modeEl.addEventListener("change", resetGame);
playerMarkEl.addEventListener("change", resetGame);
resetBtn.addEventListener("click", resetGame);

render();
