import time
from .config import COINS, PROFIT_TARGET, EXCHANGE_FEES, LONG_ENABLED, SHORT_ENABLED
from .strategies import calculate_volatility, decide_trade

trade_history = []
price_history = {coin: [] for coin in COINS}

def fetch_price(coin):
    import random
    price = 100 + random.random()*10
    price_history[coin].append(price)
    if len(price_history[coin])>50:
        price_history[coin].pop(0)
    return price

def check_trades():
    for trade in trade_history[:]:
        current_price = fetch_price(trade['coin'])
        pnl = (current_price - trade['entry'])/trade['entry']
        if trade['type']=='SHORT': pnl = -pnl
        pnl -= EXCHANGE_FEES*2
        if pnl >= PROFIT_TARGET:
            trade['exit'] = current_price
            trade['profit'] = round(pnl*100,2)
            trade_history.remove(trade)

def run_bot():
    while True:
        for coin in COINS:
            price = fetch_price(coin)
            vol = calculate_volatility(price_history[coin])
            decision = decide_trade(vol, price)
            if decision=='LONG' and LONG_ENABLED:
                trade_history.append({'coin':coin,'type':'LONG','entry':price,'exit':None,'profit':None})
            elif decision=='SHORT' and SHORT_ENABLED:
                trade_history.append({'coin':coin,'type':'SHORT','entry':price,'exit':None,'profit':None})
        check_trades()
        time.sleep(1)