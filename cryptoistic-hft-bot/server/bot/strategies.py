def calculate_volatility(price_history):
    if len(price_history) < 2: return 0
    return (max(price_history) - min(price_history)) / min(price_history)

def decide_trade(volatility, last_price):
    import random
    if volatility > 0.005:
        return 'LONG' if random.random() > 0.5 else 'SHORT'
    return None