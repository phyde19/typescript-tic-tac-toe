import { useEffect, useState } from 'react';
import './App.css';
import clsx from 'clsx';

type Cell = 'x' | 'o' | '';
type Board = [
  [Cell, Cell, Cell],
  [Cell, Cell, Cell],
  [Cell, Cell, Cell],
]
type Player = 'x' | 'o';

type GameBoardProps = {
  board: Board;
  onSelectMove: (rowIndex: number, colIndex: number) => void;
}

function GameBoard({ board, onSelectMove }: GameBoardProps) {
  return (
    <div className="board">
      {board.map((row, rowIndex) => (
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
              onClick={() => onSelectMove(rowIndex, colIndex)}
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

function App() {
  const [board, setBoard] = useState<Board>([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
  ]);

  const [currPlayer, setCurrentPlayer] = useState<Player>("x");
  
  const [outcome, setOutcome] = useState<string | null>(null);

  useEffect(() => {
    const {
      isGameOver, 
      hasWinner,
      winner
    } = checkGameState(board);

    if (isGameOver && !hasWinner) {
      setOutcome('Cat\'s game!');
    } else if (isGameOver && hasWinner) {
      setOutcome(`${winner} wins!`);
    } 
  }, [board]);

  const handleSelectMove = (i: number, j: number) => {
    if (board[i][j] !== "") {
      return;
    }
    setBoard(prevBoard => {
      const newBoard: Board = [
        [...prevBoard[0]],
        [...prevBoard[1]],
        [...prevBoard[2]]
      ]
      newBoard[i][j] = currPlayer;
      return newBoard;
    });

    setCurrentPlayer(prev => prev === "x" ? "o" : "x");
  };

  const handleReset = () => {
    setBoard([
      ["", "", ""],
      ["", "", ""],
      ["", "", ""]
    ]);
    setOutcome(null);
    setCurrentPlayer('x');
  };

  return (
    <div className="app">
      {outcome && (
        <span className="gameover-message">{outcome}</span>
      )}

      <GameBoard 
        board={board} 
        onSelectMove={handleSelectMove}
      />

      <ResetBtn
        board={board}
        onReset={handleReset}
      />
    </div>
  );
}

type ResetBtnProps = {
  board: Board;
  onReset: () => void;
}

function ResetBtn({ board, onReset }: ResetBtnProps) {
  const isBoardEmpty = board.every(row => row.every(cell => cell === ''));

  return (
    <>
      {!isBoardEmpty && (
        <button
          className="reset-btn"
          onClick={onReset}
        >
          Reset
        </button>
      )}
    </>
  );
}

type GameState = {
  isGameOver: boolean;
  hasWinner: boolean;
  winner: Cell | null;
}

function checkGameState(board: Board): GameState {
  const paths = getAllPaths(board);
  const winningPath = paths.find(path => isWinningPath(path));
  if (winningPath) {
    return { isGameOver: true, hasWinner: true, winner: winningPath[0] };
  }
  const isCatzGame = paths.every(path => isMixedPath(path));
  if (isCatzGame) {
    return { isGameOver: true, hasWinner: false, winner: null };
  }
  return { isGameOver: false, hasWinner: false, winner: null };
}

function getAllPaths(board: Board): Cell[][] {
  const diag1 = [0,1,2].map(i => board[i][i]);
  const diag2 = [0,1,2].map(i => board[i][2-i]);
  const rows = [0,1,2].map(i => [0,1,2].map(j => board[i][j]));
  const cols = [0,1,2].map(i => [0,1,2].map(j => board[j][i]));
  return [diag1, diag2, ...rows, ...cols];
}

function isWinningPath(path: Cell[]): boolean {
  return path[0] === path[1] && path[1] === path[2] && path[0] !== "";
}

function isMixedPath(path: Cell[]): boolean {
  return path.some(symbol => symbol === "x") && path.some(symbol => symbol === "o");
}

export default App;