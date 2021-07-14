import React from 'react';
import coinGif from "../Gifs/coinSpining.gif"
import snake from "../Gifs/snake.gif"
const GameHeader = ({ score, gameOver, playAgain }) => {
    let getHighestScore = localStorage.getItem("highScore")
    let highestScore = getHighestScore === null ? 0 : getHighestScore;

    return (
        <div className="gameHeader">
            <div className="score">Score: {score}

                <img style={{ marginLeft: 20 }} src={coinGif} width="30" height="30px" alt="coin Spining" />
            </div>
            {gameOver ? <div className="button" onClick={playAgain}>
                Play Again
            </div> : <div className="snake"><img style={{ marginLeft: 20 }} src={snake} width="80px" height="50px" alt="snake" /></div>}
            <div>Highest: {highestScore}</div>
        </div>
    );
};

export default GameHeader;