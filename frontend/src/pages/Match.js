import React, { useState, useEffect, useRef } from 'react';
import Chess from 'chess.js';
import './css/Match.css';
import { useParams } from 'react-router-dom';

function Match() {
  const { matchId } = useParams();
  const [game, setGame] = useState(new Chess());
  const [webSocket, setWebSocket] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [isMatched, setIsMatched] = useState(false);
  const boardRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/chess/${matchId}`);
    setWebSocket(ws);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const message = event.data;
      if (message.startsWith('color:')) {
        const color = message.split(':')[1];
        setPlayerColor(color);
        setIsMatched(true);
      } else {
        const move = JSON.parse(message);
        game.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion || 'q'
        });
        if (boardRef.current) {
          boardRef.current.position(game.fen());
        }
      }
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, [game, matchId]);

  useEffect(() => {
    if (isMatched && playerColor) {
      boardRef.current = window.Chessboard('board', {
        draggable: true,
        position: 'start',
        pieceTheme: 'chesspieces/wikipedia/{piece}.png',
        onDrop: handleMove
      });

      if (playerColor === 'black') {
        boardRef.current.flip();
      }
    }
  }, [isMatched, playerColor]);

  const handleMove = (source, target) => {
    const piece = game.get(source);

    if (piece && piece.color !== playerColor[0]) {
      return 'snapback';
    }

    const move = game.move({
      from: source,
      to: target,
      promotion: 'q'
    });

    if (move === null) return 'snapback';

    if (webSocket) {
      webSocket.send(JSON.stringify({
        from: source,
        to: target,
        promotion: 'q'
      }));
    }

    setTimeout(() => {
      if (boardRef.current) {
        boardRef.current.position(game.fen());
      }
    }, 250);
  };

  return (
    <div className="container">
      <h1>1v1 Match</h1>
      {!isMatched ? (
        <div className="loading">Waiting for another player to join...</div>
      ) : (
        <div id="board" ref={boardRef} style={{ width: '400px' }}></div>
      )}
    </div>
  );
}

export default Match;
