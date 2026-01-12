document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid')
    let squares = Array.from(document.querySelectorAll('.grid div'))
    const scoreDisplay = document.querySelector('#score')
    const startBtn = document.querySelector('#start-button')
    const resetBtn = document.querySelector('#reset-button')
    const width = 10
    let timerId = null
    let isHardDropping = false

    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width + 1, width + 2, width * 2]
    ]
    const zTetromino = [
        [width * 2, width * 2 + 1, width + 1, width + 2],
        [0, width, width + 1, width * 2 + 1],
        [width, width + 1, width * 2 + 1, width * 2 + 2],
        [2, width + 1, width + 2, width * 2 + 1]
    ]
    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [width, 1, width + 1, width * 2 + 1]
    ]
    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ]
    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ]

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]

    let currentPosition = 4
    let currentRotation = 0
    let random = Math.floor(Math.random() * theTetrominoes.length)
    let nextRandom = Math.floor(Math.random() * theTetrominoes.length)
    let current = theTetrominoes[random][currentRotation]

    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino')
        })
    }

    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino')
        })
    }

    function control(e) {
        if (isHardDropping) return
        if (e.keyCode === 37) moveLeft()
        else if (e.keyCode === 38) rotate()
        else if (e.keyCode === 39) moveRight()
        else if (e.keyCode === 40) hardDropSmooth()
    }

    document.addEventListener('keydown', control)

    function moveDown() {
        if (canMoveDown()) {
            undraw()
            currentPosition += width
            draw()
        } else {
            freeze()
        }
    }

    function canMoveDown() {
        return !current.some(index => {
            const nextIndex = currentPosition + index + width
            return nextIndex >= squares.length || squares[nextIndex].classList.contains('taken')
        })
    }

    function freeze() {
        current.forEach(index => squares[currentPosition + index].classList.add('taken'))
        random = nextRandom
        nextRandom = Math.floor(Math.random() * theTetrominoes.length)
        currentRotation = 0
        current = theTetrominoes[random][currentRotation]
        currentPosition = 4
        
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            gameOver()
        } else {
            draw()
            displayShape()
            addScore()
        }
    }

    function moveLeft() {
        undraw()
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
        if (!isAtLeftEdge) currentPosition -= 1
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1
        }
        draw()
    }

    function moveRight() {
        undraw()
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)
        if (!isAtRightEdge) currentPosition += 1
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1
        }
        draw()
    }

    function rotate() {
        undraw()
        const oldRotation = currentRotation
        currentRotation++
        if (currentRotation === current.length) currentRotation = 0
        const newShape = theTetrominoes[random][currentRotation]
        const isAtLeft = newShape.some(index => (currentPosition + index) % width === 0)
        const isAtRight = newShape.some(index => (currentPosition + index) % width === width - 1)
        
        if (isAtLeft && isAtRight || newShape.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentRotation = oldRotation
        } else {
            current = newShape
        }
        draw()
    }

    const displaySquares = document.querySelectorAll('.showroom div')
    let displayIndex = 0
    const upNextTetrominoes = [
        [1, 5, 9, 10], [8, 9, 5, 6], [1, 4, 5, 6], [1, 2, 5, 6], [1, 5, 9, 13]
    ]

    function displayShape() {
        displaySquares.forEach(square => square.classList.remove('tetromino'))
        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino')
        })
    }

    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]
            if (row.every(index => squares[index].classList.contains('taken'))) {
                scoreDisplay.innerHTML = parseInt(scoreDisplay.innerHTML) + 100
                row.forEach(index => {
                    squares[index].classList.remove('taken', 'tetromino')
                })
                const squaresRemoved = squares.splice(i, width)
                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell))
            }
        }
    }

    function hardDropSmooth() {
        if (!timerId || isHardDropping) return
        isHardDropping = true
        clearInterval(timerId)
        timerId = null

        const dropInterval = setInterval(() => {
            if (canMoveDown()) {
                undraw()
                currentPosition += width
                draw()
            } else {
                clearInterval(dropInterval)
                freeze()
                isHardDropping = false
                if (scoreDisplay.textContent !== 'GAME OVER') {
                    timerId = setInterval(moveDown, 400)
                }
            }
        }, 20)
    }

    function gameOver() {
        scoreDisplay.textContent = 'GAME OVER'
        clearInterval(timerId)
        timerId = null
    }

    function resetGame() {
        if (timerId) clearInterval(timerId)
        isHardDropping = false
        squares.forEach(square => {
            if (!square.classList.contains('floor')) {
                square.classList.remove('taken', 'tetromino')
            }
        })
        currentPosition = 4
        currentRotation = 0
        random = Math.floor(Math.random() * theTetrominoes.length)
        nextRandom = Math.floor(Math.random() * theTetrominoes.length)
        current = theTetrominoes[random][currentRotation]
        scoreDisplay.textContent = 0
        draw()
        displayShape()
    }

    startBtn.addEventListener('click', () => {
        if (scoreDisplay.textContent === 'GAME OVER') resetGame()
        if (timerId) {
            clearInterval(timerId)
            timerId = null
        } else {
            draw()
            timerId = setInterval(moveDown, 400)
            displayShape()
        }
    })

    resetBtn.addEventListener('click', resetGame)
})