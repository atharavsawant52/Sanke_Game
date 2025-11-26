let board = document.querySelector("#board");

let modal = document.querySelector(".modal");
let startBox = document.querySelector(".start-screen");
let overBox = document.querySelector(".game-over-screen");
let startBtn = document.querySelector("#startBtn");
let restartBtn = document.querySelector("#closeBtn");

let blockSize = 30;

overBox.style.display = "none";
function getGridSize() {
  let cols = Math.floor(board.clientWidth / blockSize);
  let rows = Math.floor(board.clientHeight / blockSize);

  board.style.gridTemplateColumns = `repeat(${cols}, ${blockSize}px)`;
  board.style.gridTemplateRows = `repeat(${rows}, ${blockSize}px)`;

  return { cols, rows };
}

let { cols, rows } = getGridSize();

let blocks = [];
board.innerHTML = "";

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    let block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);
    blocks[`${r}-${c}`] = block;
  }
}

let snake = [{ x: 5, y: 5 }];
let direction = "right";
let intervalID = null;

let score = 0;
let highScore = localStorage.getItem("hs") || 0;
document.querySelector("#high-score").innerText = highScore;

let timer = 0;
let timerID = null;

function updateTimer() {
  let m = String(Math.floor(timer / 60)).padStart(2, "0");
  let s = String(timer % 60).padStart(2, "0");
  document.querySelector("#time").innerText = `${m}:${s}`;
}

function placeFood() {
  let x, y;
  do {
    x = Math.floor(Math.random() * rows);
    y = Math.floor(Math.random() * cols);
  } while (snake.some(seg => seg.x === x && seg.y === y));
  return { x, y };
}

let food = placeFood();

function render() {
  snake.forEach(seg => {
    blocks[`${seg.x}-${seg.y}`]?.classList.remove("fill");
  });

  let head;
  if (direction === "right") head = { x: snake[0].x, y: snake[0].y + 1 };
  if (direction === "left") head = { x: snake[0].x, y: snake[0].y - 1 };
  if (direction === "up") head = { x: snake[0].x - 1, y: snake[0].y };
  if (direction === "down") head = { x: snake[0].x + 1, y: snake[0].y };

  // WALL HIT
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) return gameOver();

  // SELF HIT
  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) return gameOver();

  // FOOD HIT
  if (head.x === food.x && head.y === food.y) {
    snake.unshift(head);
    score += 10;
    document.querySelector("#score").innerText = score;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("hs", highScore);
      document.querySelector("#high-score").innerText = highScore;
    }

    food = placeFood();
  } else {
    snake.unshift(head);
    snake.pop();
  }

  // RENDER FOOD
  Object.values(blocks).forEach(b => b.classList.remove("food"));
  blocks[`${food.x}-${food.y}`]?.classList.add("food");

  snake.forEach(seg => {
    blocks[`${seg.x}-${seg.y}`]?.classList.add("fill");
  });
}


function gameOver() {
  clearInterval(intervalID);
  clearInterval(timerID);

  modal.style.display = "flex";
  startBox.style.display = "none";
  overBox.style.display = "block";
}

startBtn.addEventListener("click", () => {
  modal.style.display = "none";
  startBox.style.display = "none";

  intervalID = setInterval(render, 120);

  timer = 0;
  updateTimer();
  timerID = setInterval(() => {
    timer++;
    updateTimer();
  }, 1000);
});

restartBtn.addEventListener("click", () => {
  overBox.style.display = "none";
  modal.style.display = "none";

  snake = [{ x: 5, y: 5 }];
  direction = "right";
  score = 0;
  document.querySelector("#score").innerText = 0;

  food = placeFood();
  timer = 0;
  updateTimer();

  intervalID = setInterval(render, 120);
  timerID = setInterval(() => {
    timer++;
    updateTimer();
  }, 1000);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" && direction !== "left") direction = "right";
  if (e.key === "ArrowLeft" && direction !== "right") direction = "left";
  if (e.key === "ArrowUp" && direction !== "down") direction = "up";
  if (e.key === "ArrowDown" && direction !== "up") direction = "down";
});
