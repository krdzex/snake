import React from 'react';

const GameHeader = ({ score, gameOver, playAgain }) => {
    let getHighestScore = localStorage.getItem("highScore")
    let highestScore = getHighestScore === null ? 0 : getHighestScore;

    return (
        <div className="gameHeader">
            <div className="score">Score: {score}
            </div>
            {gameOver && <div className="button" onClick={playAgain}>
                Play Again
            </div>}
            <div>Highest: {highestScore}</div>
        </div>
    );
};

export default GameHeader;