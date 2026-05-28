const board = document.querySelector('.board');
const startButton = document.querySelector('.btn-start');
const modal = document.querySelector('.modal');
const startGame = document.querySelector('.start-game');
const highScoreElem = document.querySelector('#high-score');
const scoreElem = document.querySelector('#score');
const timeElem = document.querySelector('#time');
const gameOver = document.querySelector('.game-over');
const restartButton = document.querySelector('.btn-restart');
const pauseButton = document.querySelector('.btn-pause');
const themeToggle = document.querySelector('#theme-toggle');

// Theme toggle functionality
let currentTheme = localStorage.getItem('theme') || 'dark';

// Apply saved theme on load
if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    themeToggle.textContent = 'Dark';
}

themeToggle.addEventListener('click', () => {
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.textContent = 'Dark';
        currentTheme = 'light';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.textContent = 'Light';
        currentTheme = 'dark';
    }
    localStorage.setItem('theme', currentTheme);
});

const blockHeight = 40;
const blockWidth = 40;

let highScore = localStorage.getItem('highScore') || 0;
highScoreElem.innerHTML = highScore;
let score = 0;
let time = `00:00`;
let timerId = null;
let isPaused = false;

//how many columns and rows are needed
const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

const blocks = [];//block and blocks are different as block is each box created in the grid and blocks is array to store all the boxes to add snake later
let snake = [{ // x=row ,, y=column
    x: 4, y: 7 //snake head
}]
let food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) };
let direction = 'left';
let intervalId = null;


//create boxes
for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const block = document.createElement('div');
        block.classList.add('block');
        board.appendChild(block);
        blocks[`${row}-${col}`] = block; //here we are storing each block in blocks array with key as row-col because we will access it later using row-col in render function
    }
}
function render() {
    let head = null;
    //adding the block of food to the board
    blocks[`${food.x}-${food.y}`].classList.add("food");

    if (direction === 'left') { // set positions for moving the snake including adding snake to the board
        head = { x: snake[0].x, y: snake[0].y - 1 }
    } else if (direction === 'right') {
        head = { x: snake[0].x, y: snake[0].y + 1 }
    } else if (direction === 'up') {
        head = { x: snake[0].x - 1, y: snake[0].y }
    } else if (direction === 'down') {
        head = { x: snake[0].x + 1, y: snake[0].y }
    }

    if (snake[0].x < 0 || snake[0].y < 0 || snake[0].x > rows - 1 || snake[0].y > cols - 1) {//outside of board makes it game over
        clearInterval(intervalId);
        clearInterval(timerId);
        modal.style.display = 'flex';
        startGame.style.display = 'none';
        gameOver.style.display = 'flex';
        return;
    }

    // Self-collision detection - check if head hits any part of the body
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            clearInterval(intervalId);
            clearInterval(timerId);
            modal.style.display = 'flex';
            startGame.style.display = 'none';
            gameOver.style.display = 'flex';
            return;
        }
    }


    //food will be eaten by snake
    if (head.x == food.x && head.y == food.y) {
        blocks[`${food.x}-${food.y}`].classList.remove("food");
        //respawn of food
        food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) };
        blocks[`${food.x}-${food.y}`].classList.add("food");
        //length of the snake will grow
        snake.unshift(head);
        score += 10;
        scoreElem.innerHTML = score;
        document.querySelector('#final-score').innerHTML = score;
        if(score > highScore){
            highScore = score;
            localStorage.setItem('highScore', highScore.toString());
        }

    }

    //remove snake part of snake tail after moving
    snake.forEach(
        segment => {
            blocks[`${segment.x}-${segment.y}`].classList.remove('fill')
        }
    )
    snake.unshift(head)//adds extra head before
    snake.pop()
    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.add('fill');
    })


}
//starting the game on clicking start button
startButton.addEventListener('click', () => {
    modal.style.display = 'none';
    pauseButton.style.display = 'block';
    intervalId = setInterval(() => {
        render();
    }, 200);
    timerId = setInterval(() => {
        let [min,sec] = time.split(':').map(Number);
        if(sec == (60-1)){
            min += 1;
            sec = 0;
        }else{
            sec++;
        }
        time = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        timeElem.innerText = time;

    },1000)
})

restartButton.addEventListener('click', () => {
    location.reload();
});

pauseButton.addEventListener('click', () => {
    if (isPaused) {
        // resume game
        intervalId = setInterval(() => {
            render();
        }, 200);
        timerId = setInterval(() => {
            let [min, sec] = time.split(':').map(Number);
            if (sec == (60 - 1)) {
                min += 1;
                sec = 0;
            } else {
                sec++;
            }
            time = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
            timeElem.innerText = time;
        }, 1000);
        pauseButton.innerText = 'Stop Game'; 
        isPaused = false;
    } else {
        // pause game
        clearInterval(intervalId);
        clearInterval(timerId);
        pauseButton.innerText = 'Resume';
        isPaused = true;
    }
});

addEventListener("keydown", (event) => {//snake moves according to key
    if (event.key == 'ArrowUp' && direction !== 'down') {
        direction = 'up';
    } else if (event.key == 'ArrowDown' && direction !== 'up') {
        direction = 'down';
    } else if (event.key == 'ArrowLeft' && direction !== 'right') {
        direction = 'left';
    } else if (event.key == 'ArrowRight' && direction !== 'left') {
        direction = 'right';
    }

})