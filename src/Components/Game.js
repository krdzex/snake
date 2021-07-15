import React from 'react';
import Board from './Board';
const Game = () => {
    const row = 18;
    const col = 18;
    return (
        <div>
            <Board row={row} col={col} />
        </div>
    );
};

export default Game;