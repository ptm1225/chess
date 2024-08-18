import React, { useState, useRef, useEffect } from 'react';
import Chess from 'chess.js';
import './css/Game.css';

function App() {
  const [rating, setRating] = useState(1500);
  const [gameStarted, setGameStarted] = useState(false);
  const [game, setGame] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState('white');
  const boardRef = useRef(null);

  const startGame = () => {
    setGameStarted(true);
  };

  useEffect(() => {
    if (gameStarted) {
      
      boardRef.current = window.Chessboard('board', {
        draggable: true,
        position: playerColor === 'white' ? 'start' : 'flip',
        pieceTheme: 'chesspieces/wikipedia/{piece}.png',
        onDrop: handleMove
      });

      if (playerColor === 'black') {
        boardRef.current.flip();
        makeAIMove();
      }
    }
  }, [gameStarted]);

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
    try {
      const fen = game.fen();

      const response = await fetch('http://localhost:8000/next_move/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fen: fen,
          depth: 10,
          rating: rating
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
      {!gameStarted ? (
        <div>
          <h1>Set Your Opponent's Strength</h1>
          <label>
            Choose AI Rating:
            <input
              type="range"
              min="800"
              max="2600"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
            />
            {rating}
          </label>
          <div>
            <label>
              <input
                type="radio"
                value="white"
                checked={playerColor === 'white'}
                onChange={() => setPlayerColor('white')}
              />
              White
            </label>
            <label>
              <input
                type="radio"
                value="black"
                checked={playerColor === 'black'}
                onChange={() => setPlayerColor('black')}
              />
              Black
            </label>
          </div>
          <button onClick={startGame}>Start Game</button>
        </div>
      ) : (
        <div>
          <h1>AI Chess Game</h1>
          <div id="board" style={{ width: '400px' }}></div>
        </div>
      )}
    </div>
  );
}

export default App;
