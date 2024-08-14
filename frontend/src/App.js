import React, { useState, useEffect, useRef } from 'react';
import Chess from 'chess.js';
import './App.css';

function App() {
  const [game, setGame] = useState(new Chess());
  const boardRef = useRef(null);

  useEffect(() => {
    if (window.Chessboard) {
      const config = {
        draggable: true,
        position: 'start',
        pieceTheme: 'chesspieces/wikipedia/{piece}.png',
        onDrop: handleMove
      };
      boardRef.current = window.Chessboard('board', config);
      console.log("Chessboard initialized:", boardRef.current);
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

    if (boardRef.current) {
      console.log("Board exists, making AI move...");
      setTimeout(makeAIMove, 250);
    } else {
      console.error("Board is null, cannot make AI move.");
    }
  };

  const makeAIMove = async () => {
    try {
      const fen = game.fen();
  
      const response = await fetch('http://localhost:8000/next_move/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fen: fen,
          depth: 20
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      const from = data.best_move.substring(0, 2);
      const to = data.best_move.substring(2, 4);
      const promotion = data.best_move.length === 5 ? data.best_move[4] : null;
      
      const move = game.move({
        from: from,
        to: to,
        promotion: promotion
      });
      
      if (move === null) {
        console.error('Invalid AI move:', data.best_move);
        return;
      }

      boardRef.current.position(game.fen());
    } catch (error) {
      console.error('Error making AI move:', error);
    }
  };  

  return (
    <div className="App">
      <h1>AI Chess Game</h1>
      <div id="board" style={{ width: '400px' }}></div>
    </div>
  );
}

export default App;
