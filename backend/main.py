from fastapi import FastAPI
import chess
import chess.engine
from pydantic import BaseModel

app = FastAPI()

STOCKFISH_PATH = "/usr/games/stockfish"
engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)

class MoveRequest(BaseModel):
    fen: str  # 현재 체스 보드 상태를 FEN(Forsyth-Edwards Notation)으로 전달
    depth: int = 20  # 엔진이 분석할 깊이

@app.post("/next_move/")
async def get_next_move(request: MoveRequest):
    board = chess.Board(request.fen)
    result = engine.play(board, chess.engine.Limit(depth=request.depth))
    return {"best_move": result.move.uci()}

@app.on_event("shutdown")
def shutdown_event():
    engine.quit()

@app.get("/")
def read_root():
    return {"status": "Server is running"}