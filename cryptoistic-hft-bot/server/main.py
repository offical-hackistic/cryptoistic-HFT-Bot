from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from bot.bot import trade_history, run_bot
import threading

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/trades")
def get_trades():
    return trade_history

threading.Thread(target=run_bot, daemon=True).start()