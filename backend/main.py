from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chess
import chess.engine
from manager import ConnectionManager

app = FastAPI()

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STOCKFISH_PATH = "/usr/games/stockfish"
engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)
manager = ConnectionManager()

class MoveRequest(BaseModel):
    fen: str
    depth: int = 20
    rating: int = 1500

def calculate_skill_level(rating) -> int:
    if rating < 800:
        return 0
    elif rating > 2600:
        return 20
    else:
        return (rating - 800) // 100

@app.post("/next_move/")
async def get_next_move(request: MoveRequest):
    board = chess.Board(request.fen)

    skill_level = calculate_skill_level(request.rating)
    engine.configure({"Skill Level": skill_level})
    
    result = engine.play(board, chess.engine.Limit(depth=request.depth))
    return {"best_move": result.move.uci()}

@app.websocket("/ws/chess/{match_id}")
async def websocket_endpoint(websocket: WebSocket, match_id: str):
    await manager.connect(websocket, match_id)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data, match_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, match_id)

@app.on_event("shutdown")
def shutdown_event():
    engine.quit()

@app.get("/")
def read_root():
    return {"status": "Server is running"}