import React, { useState, useEffect } from 'react';
import Chess from 'chess.js';
import './App.css';

function App() {
  const [game, setGame] = useState(new Chess());
  const [board, setBoard] = useState(null);

  useEffect(() => {
    if (window.Chessboard) {
      const config = {
        draggable: true,
        position: 'start',
        pieceTheme: 'chesspieces/wikipedia/{piece}.png',
        onDrop: handleMove
      };
      const chessBoard = window.Chessboard('board', config);
      setBoard(chessBoard);
    } else {
      console.error("Chessboard.js가 로드되지 않았습니다.");
    }
  }, []);

  const handleMove = (source, target) => {
    const move = game.move({
      from: source,
      to: target,
      promotion: 'q'
    });

    if (move === null) return 'snapback';

    setTimeout(makeAIMove, 250);
  };

  const makeAIMove = async () => {
    const response = await fetch('/next_move/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fen: game.fen(),
        depth: 20
      })
    });

    const data = await response.json();
    game.move(data.best_move);
    board.position(game.fen());
  };

  return (
    <div className="App">
      <h1>AI Chess Game</h1>
      <div id="board" style={{ width: '400px' }}></div>
    </div>
  );
}

export default App;
