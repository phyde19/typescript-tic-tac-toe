import React, { createContext, useContext, useReducer, useEffect } from 'react';
import './App.css';
import clsx from 'clsx';

type Cell = 'x' | 'o' | '';
type Board = [
  [Cell, Cell, Cell],
  [Cell, Cell, Cell],
  [Cell, Cell, Cell],
]
type Player = 'x' | 'o';

// Define the state shape
interface GameState {
  board: Board;
  currPlayer: Player;
  outcome: string | null;
}

// Define action types
type Action = 
  | { type: 'MAKE_MOVE', payload: { rowIndex: number, colIndex: number } }
  | { type: 'RESET_GAME' };

// Create the context
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// Initial state
const initialState: GameState = {
  board: [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
  ],
  currPlayer: 'x',
  outcome: null,
};

// Reducer function
function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'MAKE_MOVE':
      const { rowIndex, colIndex } = action.payload;
      if (state.board[rowIndex][colIndex] !== "" || state.outcome) {
        return state;
      }
      const newBoard = state.board.map(row => [...row]) as Board;
      newBoard[rowIndex][colIndex] = state.currPlayer;
      return {
        ...state,
        board: newBoard,
        currPlayer: state.currPlayer === 'x' ? 'o' : 'x',
      };
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
}

// Game provider component
function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    const { isGameOver, hasWinner, winner } = checkGameState(state.board);
    if (isGameOver && !hasWinner) {
      state.outcome = 'Cat\'s game!';
    } else if (isGameOver && hasWinner) {
      state.outcome = `${winner} wins!`;
    }
  }, [state.board]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook to use the game context
function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

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

// Utility functions (unchanged)
type CheckGameState = {
  isGameOver: boolean;
  hasWinner: boolean;
  winner: Cell | null;
}

function checkGameState(board: Board): CheckGameState {
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