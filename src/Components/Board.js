import React, { useCallback, useEffect, useRef, useState } from 'react';
import Cell from './Cell';
import GameHeader from './GameHeader';

const Board = (props) => {

    //I coppied this useInterval function because it is working great with react hooks
    //If we used normal set interval it would be messy when our state change and rerender component
    function useInterval(callback, delay) {
        const savedCallback = useRef();

        useEffect(() => {
            savedCallback.current = callback;
        }, [callback]);

        useEffect(() => {
            function tick() {
                savedCallback.current();
            }
            if (delay !== null) {
                let id = setInterval(tick, delay);
                return () => clearInterval(id);
            }
        }, [delay]);
    }


    const row = props.row;
    const col = props.col;
    const [grid, setGrid] = useState([])

    //Because i wanted to do this project with linked list i created class for single node
    class LinkedListNode {
        constructor(value) {
            this.value = value;
            this.next = null;
        }
    }

    //Class for our LinkedList
    class LinkedList {
        constructor(value) {
            const tail = new LinkedListNode(value);
            this.head = tail;
            this.tail = tail;
        }
    }

    const [score, setScore] = useState(0);
    const [food, setFood] = useState(190)
    const [snake, setSnake] = useState(new LinkedList({ row: 8, col: 5, value: 150 }))
    const [snakeCells, setSnakeCells] = useState(new Set([150]))
    const [direction, setDirection] = useState("ArrowRight")
    const [speed, setSpeed] = useState(800);
    const [gameOver, setGameOver] = useState(false)
    //Creating board with unique value for each cell
    const createBoard = useCallback(() => {
        let board = []
        let integer = 1;
        for (let x = 0; x < row; x++) {
            let rowArray = [];
            for (let y = 0; y < col; y++) {
                rowArray.push(integer++)
            }
            board.push(rowArray)
        }
        return board;
    }, [col, row])
    //Create board on first load
    useEffect(() => {
        const newBoard = createBoard();
        setGrid(newBoard);
    }, [createBoard]);

    //Function for moving snake;
    const movingSnake = () => {
        //First we need current coordinates of head
        const currentHeadCoordinates = {
            row: snake.head.value.row,
            col: snake.head.value.col
        }
        //Now we create nextHeadValue with function.We pass our currentHead coordinates and direction to see where is current head moving
        //This function will give us new Coordinates where our head should be depends from direction
        const nextHeadValue = getNextHeadValue(currentHeadCoordinates, direction)

        //If our head hit wall we want to return function and do nothing
        if (nextHeadValue.col > col - 1 || nextHeadValue.col < 0 || nextHeadValue.row > row - 1 || nextHeadValue.row < 0) {
            if (localStorage.getItem("highScore") < score) {
                localStorage.setItem("highScore", JSON.stringify(score));
            }

            return setGameOver(true);
        }

        //Now when we have coordinates where our head should be next, we take value from grid on that position and after we will add it on our snakeCells
        const newHeadValue = grid[nextHeadValue.row][nextHeadValue.col];
        //If our snake cell have that value that means it hitted some part of body and game is over
        if (snakeCells.has(newHeadValue)) {
            if (localStorage.getItem("highScore") < score) {
                localStorage.setItem("highScore", JSON.stringify(score));
            }
            return setGameOver(true);
        }
        //So now when we have coodinates and value we create new tail with that parameters
        const newHead = new LinkedListNode({ row: nextHeadValue.row, col: nextHeadValue.col, value: newHeadValue });

        //So now we need to save value of our current head and that will be snake.head
        //After we saved that value, we change our snake.head to newHead because that will be our new head tail
        //And after we do that we set currentHead.next pointing at newHead tail so basicly our old head tail pointing at new head tail
        const currentHead = snake.head;
        snake.head = newHead;
        currentHead.next = newHead;

        // Now we are updating snakeCells coz when snake is moving everytime we will have different snakeCellValues so we delete tail value ,and add new head value
        const newSnakeCells = new Set(snakeCells);
        newSnakeCells.delete(snake.tail.value.value);
        newSnakeCells.add(newHeadValue);

        //Now coz we deleted our tail value we give our new snake.tail value and that is snake.tail.next
        snake.tail = snake.tail.next
        //If our tail is null, that means we only have head that happens when we init game and our snake is only one squere and we sett that our snake tail is snake head coz its just one squere
        if (snake.tail === null) {
            snake.tail = snake.head;
        }
        //If our new head value equels to food squere value that means we ate food, i will explain this functions later
        if (newHeadValue === food) {
            setScore(score + 1)
            eatFood();
            addingOnSnake(direction, newSnakeCells)
            setSpeed(speed - 20)
        }
        setSnakeCells(newSnakeCells)

    }

    //This function is realy simple, we take our current head coordinates and from our direction we set new coodinates
    const getNextHeadValue = (currentHead, direction) => {
        switch (direction) {
            case "ArrowRight":
                return {
                    row: currentHead.row,
                    col: currentHead.col + 1
                }
            case "ArrowLeft":
                return {
                    row: currentHead.row,
                    col: currentHead.col - 1
                }
            case "ArrowUp":
                return {
                    row: currentHead.row - 1,
                    col: currentHead.col
                }
            case "ArrowDown":
                return {
                    row: currentHead.row + 1,
                    col: currentHead.col
                }
            default: { }
        }

    }
    //If our snake ate food we need new food squere and we do it with random
    // If our new food cell is on snake cell or we have new food cell same as previouse food cell we just call function again to get new new random
    const eatFood = () => {
        let nextFood = Math.floor(Math.random() * (324 - 1 + 1) + 1);
        if (snakeCells.has(nextFood) || nextFood === food) {
            eatFood();
        } else {
            setFood(nextFood)
        }
    }
    //This function is little bit complex. In this function we add new cell on our snake body
    //First we made function to decide where to put our new piece and we pass snake.tail and direction because snake.tail is our last cell on snake body
    //We will explain that function completly later
    //After we get our coodinates we do almost same thing just like for new head
    const addingOnSnake = (direction, snakeCells) => {
        const positionOfnewPiece = getNewPiecePosition(snake.tail, direction)
        if (positionOfnewPiece.col > 19 || positionOfnewPiece.col < 0 || positionOfnewPiece.row > 19 || positionOfnewPiece.row < 0) {
            return
        }
        //We get our new cell value from our coordinates
        const newTailCellValue = grid[positionOfnewPiece.row][positionOfnewPiece.col]
        //New we make new tail from coordinates we got and new tail cell value
        const newTail = new LinkedListNode({ row: positionOfnewPiece.row, col: positionOfnewPiece.col, value: newTailCellValue });

        // So now we save our current snake.tail
        const currentTail = snake.tail;
        //We set snake.tail onn our new tail coz that will now be our last tail on snake
        snake.tail = newTail;
        //And now that last element need to point at current tail
        snake.tail.next = currentTail;
        //And we add that cell value on snakeCells
        snakeCells.add(newTailCellValue);
    }

    //This function is about giving coordinates to our new tail position
    //We made new function getNexttailDirection and that is function to determine direction of tail next to tail
    //And now you will see that our coordinates are opposite then coordinates for newHead because if tail next to tail is going right our new tail need to go tail.value.col - 1 so it will appear behind that tail
    //And its same for other cases
    const getNewPiecePosition = (tail, direction) => {
        const tailNexttailDirection = getNextTailDirection(
            tail,
            direction,
        );
        switch (tailNexttailDirection) {
            case "ArrowRight":
                return {
                    row: tail.value.row,
                    col: tail.value.col - 1
                }
            case "ArrowLeft":
                return {
                    row: tail.value.row,
                    col: tail.value.col + 1
                }
            case "ArrowUp":
                return {
                    row: tail.value.row + 1,
                    col: tail.value.col
                }
            case "ArrowDown":
                return {
                    row: tail.value.row - 1,
                    col: tail.value.col
                }
            default: { }
        }
    }

    //This function is to see direction of our node next to tail
    const getNextTailDirection = (tail, currentDirection) => {
        //If we dont have node next to tail that means its only one snake cell and we simple return current direction
        if (tail.next === null) {
            return currentDirection;
        }
        //Values for row and col for currentTail and nextRow,next Col for our node next to tail
        const currentRow = tail.value.row;
        const currentCol = tail.value.col;
        const nextRow = tail.next.value.row;
        const nextCol = tail.next.value.col;

        //So now we watch if they are on same row that means that our tail.next node can be either left or right
        //If our tail.next col is + 1 that mean our tail.next is on right direction and we return Arrow right and remamber on function above our ArrowRight will do Opposite and it will put our tail to ArrowLeft
        //Same goes to other casses
        if (currentRow === nextRow && currentCol + 1 === nextCol) {
            return "ArrowRight";
        }
        if (currentRow === nextRow && currentCol - 1 === nextCol) {
            return "ArrowLeft";
        }
        if (currentRow + 1 === nextRow && currentCol === nextCol) {
            return "ArrowDown";
        }
        if (currentRow - 1 === nextRow && currentCol === nextCol) {
            return "ArrowUp";
        }
    }
    //Function that change direction on key down
    const onKeyDownHandle = (e) => {
        if (/ArrowLeft|ArrowRight|ArrowUp|ArrowDown/.test(e.key)) {
            if (snakeCells.size === 1) {
                return setDirection(e.key)
            }
            if (direction === "ArrowRight" && snakeCells.size > 1 && e.key !== "ArrowLeft") {
                return setDirection(e.key)
            } else if (direction === "ArrowLeft" && snakeCells.size > 1 && e.key !== "ArrowRight") {
                return setDirection(e.key)
            } else if (direction === "ArrowUp" && snakeCells.size > 1 && e.key !== "ArrowDown") {
                return setDirection(e.key)
            } else if (direction === "ArrowDown" && snakeCells.size > 1 && e.key !== "ArrowUp") {
                return setDirection(e.key)
            }
        }
    }
    //We set interval
    useInterval(() => {
        if (!gameOver) {
            movingSnake();
        } else {
            return
        }

    }, speed);


    const playAgain = () => {
        setGameOver(false);
        setScore(0);
        setSnake(new LinkedList({ row: 8, col: 5, value: 150 }))
        setSnakeCells(new Set([150]))
        setDirection("ArrowRight");
        setFood(48)
    }

    window.onbeforeunload = function () {
        localStorage.removeItem("highScore");
    }
    return (
        <div onKeyDown={onKeyDownHandle} tabIndex="0" className="wholeBoard">
            <GameHeader score={score} gameOver={gameOver} playAgain={playAgain} />
            <div className={gameOver ? "gameOverBoard" : "board"}>
                {grid.map((oneRow) => (
                    oneRow.map((singleCell, id) => (
                        <Cell info={singleCell} key={id} snakeCells={snakeCells} foodCell={food} />
                    ))
                ))}
            </div>
        </div>
    );
};

export default Board;