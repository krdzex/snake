import React from 'react';
import Board from './Board';
const Game = () => {
    const row = 10;
    const col = 10;
    return (
        <div>
            <Board row={row} col={col} />
        </div>
    );
};

export default Game;