document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid')
    let squares = Array.from(document.querySelectorAll('.grid div'))
    const scoreDisplay = document.querySelector('#score')
    const startBtn = document.querySelector('#start-button')
    const resetBtn = document.querySelector('#reset-button')
    const width = 10
    let timerId = null

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
        if (e.keyCode === 37) moveLeft()
        else if (e.keyCode === 38) rotate()
        else if (e.keyCode === 39) moveRight()
        else if (e.keyCode === 40) hardDropSmooth()
    }

    document.addEventListener('keyup', control)

    function moveDown() {
        if (canMoveDown()) {
            undraw()
            currentPosition += width
            draw()
        } else {
            freeze()
        }
    }

    function freeze() {
        if (current.some(index => (currentPosition + index + width) >= squares.length || squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'))
            random = nextRandom
            nextRandom = Math.floor(Math.random() * theTetrominoes.length)
            currentRotation = 0
            current = theTetrominoes[random][currentRotation]
            currentPosition = 4
            draw()
            displayShape()
            addScore()
            gameOver()
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
        const touchesLeft = isAtLeftEdge(currentPosition, newShape)
        const touchesRight = isAtRightEdge(currentPosition, newShape)
        if (
            (touchesLeft && newShape.some(i => (currentPosition + i) % width === width - 1)) ||
            (touchesRight && newShape.some(i => (currentPosition + i) % width === 0)) ||
            newShape.some(i => squares[currentPosition + i].classList.contains('taken'))
        ) {
            currentRotation = oldRotation
        } else {
            current = newShape
        }
        draw()
    }

    const displaySquares = document.querySelectorAll('.showroom div')
    let displayIndex = 0
    const upNextTetrominoes = [
        [5, 9, 13, 14],
        [5, 9, 10, 14],
        [5, 9, 10, 13],
        [5, 6, 9, 10],
        [8, 9, 10, 11]
    ]

    function displayShape() {
        displaySquares.forEach(square => square.classList.remove('tetromino'))
        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino')
        })
    }

    function isAtRightEdge(position, shape) {
        return shape.some(index => (position + index) % width === width - 1)
    }

    function isAtLeftEdge(position, shape) {
        return shape.some(index => (position + index) % width === 0)
    }

    function canMoveDown() {
        return !current.some(index => {
            const nextIndex = currentPosition + index + width
            return nextIndex >= squares.length || squares[nextIndex].classList.contains('taken')
        })
    }

    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9]
            if (row.every(index => squares[index].classList.contains('taken'))) {
                scoreDisplay.innerHTML = parseInt(scoreDisplay.innerHTML) + 100
                row.forEach(index => {
                    squares[index].classList.remove('taken')
                    squares[index].classList.remove('tetromino')
                    squares[index].style.backgroundColor = ''
                })
                const squaresRemoved = squares.splice(i, width)
                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell))
            }
        }
    }

    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.textContent = 'GAME OVER'
            clearInterval(timerId)
            timerId = null
            document.removeEventListener('keyup', control)
        }
    }

    function hardDropSmooth() {
        if (!timerId) return
        clearInterval(timerId)
        timerId = null
        const dropSpeed = 50
        function dropStep() {
            if (canMoveDown()) {
                undraw()
                currentPosition += width
                draw()
                setTimeout(dropStep, dropSpeed)
            } else {
                freeze()
                if (scoreDisplay.textContent !== 'GAME OVER') {
                    timerId = setInterval(moveDown, 400)
                }
            }
        }
        dropStep()
    }

    function resetGame() {
        if (timerId) {
            clearInterval(timerId)
            timerId = null
        }
        squares.forEach(square => {
            if (!square.classList.contains('floor')) {
                square.classList.remove('taken')
                square.classList.remove('tetromino')
                square.style.backgroundColor = ''
            }
        })
        currentPosition = 4
        currentRotation = 0
        random = Math.floor(Math.random() * theTetrominoes.length)
        nextRandom = Math.floor(Math.random() * theTetrominoes.length)
        current = theTetrominoes[random][currentRotation]
        scoreDisplay.textContent = 0
        document.removeEventListener('keyup', control)
        document.addEventListener('keyup', control)
        draw()
        displayShape()
    }

    startBtn.addEventListener('click', () => {
        if (scoreDisplay.textContent === 'GAME OVER') {
            resetGame()
        }
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