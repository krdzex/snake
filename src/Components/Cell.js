import React from 'react';

const Cell = (props) => {
    return (
        <div className={props.snakeCells.has(props.info) ? "snakeCell" : props.foodCell === props.info ? "foodCell" : "cell"}>
        </div>
    );
};

export default Cell;