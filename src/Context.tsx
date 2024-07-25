import { createContext, useContext, useEffect, useReducer } from "react";

export type Cell = 'x' | 'o' | '';
export type Board = [
  [Cell, Cell, Cell],
  [Cell, Cell, Cell],
  [Cell, Cell, Cell],
]
export type Player = 'x' | 'o';

// Define the state shape
export interface GameState {
  board: Board;
  currPlayer: Player;
  outcome: string | null;
}

// Create the context
export const GameContext = createContext<{
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

// Define action types
type Action = 
  | { type: 'MAKE_MOVE', payload: { rowIndex: number, colIndex: number } }
  | { type: 'RESET_GAME' }
  | { type: 'END_GAME', payload: string };

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
    case 'END_GAME':
      return {
        ...state,
        outcome: action.payload,
      };
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
}

// Game provider component
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    const { isGameOver, hasWinner, winner } = checkGameState(state.board);
    if (isGameOver && !hasWinner) {
      dispatch({ type: 'END_GAME', payload: 'Cat\'s game!' });
    } else if (isGameOver && hasWinner) {
      dispatch({ type: 'END_GAME', payload: `${winner} wins!` });
    }
  }, [state.board]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook to use the game context
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}


export type CheckGameState = {
  isGameOver: boolean;
  hasWinner: boolean;
  winner: Cell | null;
}

export function checkGameState(board: Board): CheckGameState {
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