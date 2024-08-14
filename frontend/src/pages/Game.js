import React, { useState, useRef, useEffect } from 'react';
import Chess from 'chess.js';

function App() {
  const [rating, setRating] = useState(1500); // 기본 레이팅
  const [gameStarted, setGameStarted] = useState(false);
  const [game, setGame] = useState(new Chess());
  const boardRef = useRef(null);

  const startGame = () => {
    setGameStarted(true);
  };

  useEffect(() => {
    if (gameStarted) {
      // DOM이 업데이트된 후 체스보드를 초기화
      boardRef.current = window.Chessboard('board', {
        draggable: true,
        position: 'start',
        pieceTheme: 'chesspieces/wikipedia/{piece}.png',
        onDrop: handleMove
      });
    }
  }, [gameStarted]); // gameStarted 상태가 변경될 때마다 이 useEffect가 실행됨

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
          depth: 10,  // 깊이는 고정
          rating: rating  // 사용자 설정 레이팅 전달
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
