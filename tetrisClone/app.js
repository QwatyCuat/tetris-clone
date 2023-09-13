/* Notes to self:
  Create menu button that will have freeplay, levels, and maybe settings
  Create CSS animations
  Add timer for levels OR have different difficulty?
*/

document.addEventListener('DOMContentLoaded', () =>{
  // Start up menu variables
  const startButton = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');
  const gameElements = document.getElementById('game-elements');
  const pauseButton = document.getElementById('pause-button');

  startButton.addEventListener('click', () => {
    // Hides the start menu
    startMenu.classList.add('fade-out');
    // Show the game elements
    setTimeout(()=>{
      startMenu.style.display = 'none';
      gameElements.style.display = 'block';
    }, 1000);
    //start here
  });
  pauseButton.addEventListener('click', ()=> {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    } else {
      draw()
      timerId = setInterval(moveDown, 1000)
    }
  })
  const grid = document.querySelector('.grid')
  const gridDivs = 210; // Total numbers of divs (to make up the tetris grid)
  for(let i = 0; i < gridDivs; i++) {
    const divElement = document.createElement('div')
    // Add the bottom part of the grid that gets stacked ("taken" div)
    if (i >= 200) {
      divElement.classList.add('taken');
    }
    grid.appendChild(divElement);
  }

  const miniGrid = document.querySelector('.mini-grid');
  const miniDivs = 16; // Total number of divs for the mini grid
  for(let i = 0; i < miniDivs; i++) {
    const divElement = document.createElement('div');
    miniGrid.appendChild(divElement);
  }

  let squares = Array.from(document.querySelectorAll('.grid div'))
  const scoreDisplay = document.querySelector('#score')

  const startBtn = document.querySelector('#start-button')
  const width = 10;
  let timerId = 0;
  let score = 0;
  // Set colors for the tetrominoes
  const colors = [
    'orange',
    'red',
    'purple',
    'green',
    'blue'
  ]

  // Tetrominoes configuration
  // The arrays in the tetromino array show their placement on the grid and the placements when you rotate the shape.
  const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
  ]
  const zTetromino = [
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1],
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1]
  ]
  const tTetromino = [
    [1, width, width+1, width+2],
    [1, width+1, width+2, width*2+1],
    [width, width+1, width+2, width*2+1],
    [1, width, width+1, width*2+1]
  ] 
  const oTetromino = [
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1]
  ]
  const iTetromino = [
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3],
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3]
  ]
  const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]

  // Rotations for tetrominoes
  let currentPosition = 4
  let currentRotation = 0

  // Randomly select a tetromino and its first rotation
  let random = Math.floor(Math.random()*theTetrominoes.length)
  let current = theTetrominoes[random] [currentRotation]

  // Draw the Tetromino
  function draw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.add('tetromino')
      squares[currentPosition + index].style.backgroundColor = colors[random]
    })
  }

  // Undraw the Tetromino (you want to undraw the tetromino every time it moves down so it looks like it's falling down)
  function undraw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.remove('tetromino')
      squares[currentPosition + index].style.backgroundColor = ''
    })
  }

  // Assign function to keyCodes
  function control(e) {
    if(e.keyCode === 37 && (timerId)) { // Move left using left arrow key and "&& (timerId)" is there so you can't move the shape while it's paused.
      moveLeft()
    } else if(e.keyCode === 38 && (timerId)) { // Rotate using the up arrow key
      rotate()
    } else if(e.keyCode === 39 && (timerId)) { // Move right using right arrow key
      moveRight()
    } else if(e.keyCode === 40 && (timerId)) { // Move down using the down arrow key
      moveDown()
    }
  }
  document.addEventListener('keyup', control)

  // Move down the tetromino
  function moveDown() {
    if(!current.some(index => squares[currentPosition + index + width].classList.contains('taken'))){
      undraw()
      currentPosition += width
      draw()
    } else {
      freeze();
    }
  }

  // Freeze function (stops tetrominoes from going past the grid)
  function freeze() {
    current.forEach(index => squares[currentPosition + index].classList.add('taken'))
    // Start a new tetromino falling
    random = nextRandom
    nextRandom = Math.floor(Math.random()*theTetrominoes.length)
    current = theTetrominoes[random][currentRotation]
    currentPosition = 4;
    checkCompletedRows()
    draw()
    displayShape()
    gameOver()
  }

  // Move the tetromino to the left (except for when it is on the edge or there is another tetromino in the way)
  function moveLeft() {
    undraw()
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
    if(!isAtLeftEdge) currentPosition -=1
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      currentPosition +=1
    }
    draw()
  }

  // Move the tetromino to the right (except for when it is on the edge or there is another tetromino in the way)
  function moveRight() {
    undraw()
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1)
    if(!isAtRightEdge) currentPosition +=1
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      currentPosition -=1
    }
    draw()
  }

  // Fixes a bug where the tetromino would rotate into the edge and lose its shape
  function isAtRight() {
    return current.some(index => (currentPosition + index + 1) % width === 0)
  }

  function isAtLeft() {
    return current.some(index => (currentPosition + index) % width === 0)
  }

  function checkRotatedPosition(P){
    P = P || currentPosition    // Gets current position, then checks if the piece is near the left side
    if ((P + 1) % width < 4) {  // Add 1 because the position index can be 1 less where the piece is
      if (isAtRight()) {        // Use the actual position to check if it's flipped over to the right
        currentPosition += 1
        checkRotatedPosition(P)
      }
    }
    else if (P % width > 5) {
      if (isAtLeft()) {
        currentPosition -= 1
        checkRotatedPosition(P)
      }
    }
  }

  // Rotate the tetromino
  function rotate() {
    undraw()
    currentRotation++
    if(currentRotation === current.length) { // If the current rotation gets to 4, make it go back to 0
      currentRotation = 0
    }
    current = theTetrominoes[random] [currentRotation]
    checkRotatedPosition()
    draw()
  }

  // Show the next tetromino in the mini-grid display
  const displaySquares = document.querySelectorAll('.mini-grid div')
  const displayWidth = 4
  const displayIndex = 0

  //the Tetrominoes without rotations
  const upNextTetrominoes = [
    [1, displayWidth+1, displayWidth*2+1, 2], //lTetromino
    [0, displayWidth, displayWidth+1, displayWidth*2+1], //zTetromino
    [1, displayWidth, displayWidth+1, displayWidth+2], //tTetromino
    [0, 1, displayWidth, displayWidth+1], //oTetromino
    [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1] //iTetromino
  ]

  // Displays the shape in the mini-grid display
  function displayShape() {
    //remove any trace of a tetromino from the entire grid
    displaySquares.forEach(square => {
      square.classList.remove('tetromino')
      square.style.backgroundColor = ''
    })
    upNextTetrominoes[nextRandom].forEach( index => {
      displaySquares[displayIndex + index].classList.add('tetromino')
      displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
    })
  }

  //Initialized this function instead of putting it in the startBtn because a bug would happen where the tetrominoes would change after you paused and resumed.
  let nextRandom = Math.floor(Math.random() * theTetrominoes.length);
  displayShape();

  // Add functionally to start/pause buttons
  startBtn.addEventListener('click', () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    } else {
      draw()
      timerId = setInterval(moveDown, 1000)
    }
  })
  
  //Add score (using the Tetris DS scoring system)
  function addScore(linesCleared) {
    if (linesCleared ===1) {
      score += 100;
    } else if (linesCleared ===2) {
      score += 300;
    } else if (linesCleared ===3) {
      score += 500;
    } else if (linesCleared ===4) {
      score += 800;
    }
    scoreDisplay.innerHTML = score;
  }

  // Check if a row is completed and remove it
  function checkCompletedRows() {
    let linesCleared = 0; //Initialize the variable to keep track of cleared lines
    for (let i=0; i < 199; i+= width) {
      const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]
      if(row.every(index => squares[index].classList.contains('taken'))) {
        linesCleared++
        row.forEach(index => {
          squares[index].classList.remove('taken')
          squares[index].classList.remove('tetromino')
          squares[index].style.backgroundColor = ''
        })
        const squaresRemoved = squares.splice(i, width) //This will remove the row, by splicing the shapes put together that created the row.
        squares = squaresRemoved.concat(squares)
        squares.forEach(cell => grid.appendChild(cell))
      }
    }
    // Call addScore with number of lines cleared
    if (linesCleared > 0) {
      addScore(linesCleared);
    }
  }

  // Game over
  function gameOver() {
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      scoreDisplay.innerHTML = 'Game over!'
      clearInterval(timerId)
    }
  }
})

