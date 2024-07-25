import './App.css';
import clsx from 'clsx';
import { GameProvider, useGame } from './Context';

// GameBoard component
function GameBoard() {
  const { state, dispatch } = useGame();

  const handleSelectMove = (rowIndex: number, colIndex: number) => {
    dispatch({ type: 'MAKE_MOVE', payload: { rowIndex, colIndex } });
  };

  return (
    <div className="board">
      {state.board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((symbol, colIndex) => (
            <div 
              className={clsx(
                "board-cell",
                rowIndex > 0 && "border-top",
                rowIndex < 2 && "border-bottom",
                colIndex > 0 && "border-left",
                colIndex < 2 && "border-right"
              )}
              onClick={() => handleSelectMove(rowIndex, colIndex)}
              key={`${rowIndex}${colIndex}`}
            >
              {symbol}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ResetBtn component
function ResetBtn() {
  const { state, dispatch } = useGame();

  const isBoardEmpty = state.board.every(row => row.every(cell => cell === ''));

  const handleReset = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  return (
    <>
      {!isBoardEmpty && (
        <button
          className="reset-btn"
          onClick={handleReset}
        >
          Reset
        </button>
      )}
    </>
  );
}

// App component
function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

// GameContent component
function GameContent() {
  const { state } = useGame();

  return (
    <div className="app">
      {state.outcome && (
        <span className="gameover-message">{state.outcome}</span>
      )}
      <GameBoard />
      <ResetBtn />
    </div>
  );
}

export default App;