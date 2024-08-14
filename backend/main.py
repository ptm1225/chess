from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import chess
import chess.engine
from pydantic import BaseModel

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

class MoveRequest(BaseModel):
    fen: str  # 현재 체스 보드 상태를 FEN(Forsyth-Edwards Notation)으로 전달
    depth: int = 20  # 엔진이 분석할 깊이
    rating: int = 1500  # 사용자 설정 레이팅

def calculate_skill_level(rating: int) -> int:
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

@app.on_event("shutdown")
def shutdown_event():
    engine.quit()

@app.get("/")
def read_root():
    return {"status": "Server is running"}