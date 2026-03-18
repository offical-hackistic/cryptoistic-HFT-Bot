# FILE: package.json
{
  "name": "crypto-trade-demo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "install-all": "npm install --prefix client && npm install --prefix server",
    "test": "node tests/server.test.js"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "ws": "^8.18.0"
  }
}

# FILE: .devcontainer/devcontainer.json
{
  "name": "Crypto Trade Demo",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:1-20",
  "postCreateCommand": "npm run install-all",
  "forwardPorts": [5173, 4000],
  "customizations": {
    "vscode": {
      "extensions": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode"]
    }
  }
}

# FILE: .devcontainer/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Demo App",
      "type": "shell",
      "command": "npm run dev",
      "problemMatcher": [],
      "runOptions": { "runOn": "folderOpen" }
    }
  ]
}

# FILE: server/package.json
{
  "name": "crypto-trade-demo-server",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "index.js",
  "scripts": {
    "dev": "node index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "ws": "^8.18.0"
  }
}

# FILE: server/index.js
import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

function now() { return Date.now(); }
function rnd(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function makeTick(p) { return { type: "tick", symbol: "BTCUSD", time: now(), price: p }; }

wss.on("connection", ws => {
  let price = 30000;
  let open = null;
  let trades = [];
  ws.send(JSON.stringify({ type: "hello", time: now() }));
  const iv = setInterval(() => {
    price = Math.max(50, price + rnd(-200, 200));
    const msg = makeTick(price);
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
  }, 1000);
  ws.on("message", data => {
    let payload;
    try { payload = JSON.parse(String(data)); } catch { return; }
    if (payload.type === "placeOrder") {
      const id = String(now());
      const side = payload.side === "long" ? "long" : "short";
      const size = Number(payload.size) > 0 ? Number(payload.size) : 1;
      if (!open) {
        open = { id, side, size, entry: price, time: now(), status: "open" };
        trades.unshift(open);
        ws.send(JSON.stringify({ type: "orderOpen", order: open }));
      }
    }
    if (payload.type === "closeOrder") {
      if (open) {
        const exit = price;
        const pnl = open.side === "long" ? (exit - open.entry) * open.size : (open.entry - exit) * open.size;
        const closed = { ...open, exit, pnl, closeTime: now(), status: "closed" };
        trades = [closed, ...trades.filter(t => t.id !== open.id)].slice(0, 50);
        open = null;
        ws.send(JSON.stringify({ type: "orderClosed", order: closed }));
      }
    }
    if (payload.type === "getState") {
      ws.send(JSON.stringify({ type: "state", price, open, trades }));
    }
  });
  ws.on("close", () => { clearInterval(iv); });
});

app.get("/health", (_, res) => res.json({ ok: true }));
server.listen(4000, () => {});

# FILE: client/package.json
{
  "name": "crypto-trade-demo-client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.10.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.3.4"
  }
}

# FILE: client/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({ plugins: [react()] });

# FILE: client/src/index.css
:root { color-scheme: dark; }
body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; background: radial-gradient(1200px 600px at 20% 0%, #151826, #0b0e16); color: #fff; }
.container { max-width: 1200px; margin: 0 auto; padding: 24px; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 16px; }
.grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
.kpis { display: flex; gap: 12px; margin-top: 12px; }
.kpi { width: 180px; }
.buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
.button { appearance: none; border: 0; border-radius: 12px; padding: 10px 12px; font-weight: 600; cursor: pointer; }
.button.green { background: #16a34a; color: #fff; }
.button.red { background: #dc2626; color: #fff; }
.button.gray { background: rgba(255,255,255,0.1); color: #fff; }
.row { display: flex; align-items: center; justify-content: space-between; }
.history { max-height: 240px; overflow: auto; margin-top: 8px; display: flex; flex-direction: column; gap: 8px; }
.badge { font-size: 12px; opacity: 0.75; }
.footer { text-align: center; margin-top: 16px; opacity: 0.7; font-size: 12px; }
.title { font-size: 20px; font-weight: 800; }
.subtitle { font-size: 12px; opacity: 0.7; }

# FILE: client/src/index.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
const el = document.getElementById("root");
createRoot(el).render(<App />);

# FILE: client/src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

function fmt(t) { return new Date(t).toLocaleTimeString(); }
function wsUrl() { const h = window.location.hostname || "localhost"; return `ws://${h}:4000/ws`; }
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

export default function App() {
  const [series, setSeries] = useState(() => [{ time: Date.now(), price: 30000 }]);
  const [price, setPrice] = useState(30000);
  const [balance, setBalance] = useState(10000);
  const [open, setOpen] = useState(null);
  const [history, setHistory] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(wsUrl());
    wsRef.current = ws;
    ws.addEventListener("message", ev => {
      let msg; try { msg = JSON.parse(ev.data); } catch { return; }
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "tick" && typeof msg.price === "number" && typeof msg.time === "number") {
        setPrice(msg.price);
        setSeries(s => {
          const next = [...s, { time: msg.time, price: msg.price }];
          return next.slice(-120);
        });
      }
      if (msg.type === "orderOpen" && msg.order) {
        setOpen(msg.order);
        setHistory(h => [{ ...msg.order }, ...h].slice(0, 50));
      }
      if (msg.type === "orderClosed" && msg.order) {
        setOpen(null);
        const pnl = Number(msg.order.pnl) || 0;
        setBalance(b => Math.max(0, Math.round(b + pnl)));
        setHistory(h => [msg.order, ...h].slice(0, 50));
      }
      if (msg.type === "state") {
        const p = typeof msg.price === "number" ? msg.price : price;
        setPrice(p);
        const arr = Array.isArray(msg.trades) ? msg.trades : [];
        setHistory(arr.slice(0, 50));
        setOpen(msg.open || null);
      }
    });
    ws.addEventListener("open", () => { ws.send(JSON.stringify({ type: "getState" })); });
    return () => { try { ws.close(); } catch {} };
  }, []);

  const last = series[series.length - 1] || { time: Date.now(), price: price };
  const equity = useMemo(() => {
    if (!open) return balance;
    const pnl = open.side === "long" ? (price - open.entry) * open.size : (open.entry - price) * open.size;
    return Math.max(0, Math.round(balance + pnl));
  }, [balance, open, price]);

  function place(side) {
    const size = 1;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "placeOrder", side, size }));
    }
  }

  function close() {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "closeOrder" }));
    }
  }

  const chartData = series.map(p => ({ time: fmt(p.time), price: clamp(p.price, 1, 1000000) }));

  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="title">CryptoTrade Pro — Demo</div>
          <div className="subtitle">Simulated exchange with live ticks and mocked order confirmations</div>
        </div>
        <div>
          <div className="subtitle">Equity</div>
          <div className="title">${equity.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="row">
            <div>
              <div className="title">Live Market</div>
              <div className="subtitle">Simulated BTCUSD feed</div>
            </div>
            <div>
              <div className="subtitle">Last price</div>
              <div className="title">${price.toLocaleString()}</div>
              <div className="badge">{fmt(last.time)}</div>
            </div>
          </div>
          <div style={{ height: 300, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[dataMin => dataMin * 0.98, dataMax => dataMax * 1.02]} />
                <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                <Tooltip />
                <Area type="monotone" dataKey="price" stroke="#a78bfa" fillOpacity={1} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="kpis">
            <div className="card kpi"><div className="subtitle">Starting Balance</div><div className="title">${(10000).toLocaleString()}</div></div>
            <div className="card kpi"><div className="subtitle">Open Position</div><div className="title">{open ? `${open.side} ${open.size}u` : "None"}</div></div>
            <div className="card kpi"><div className="subtitle">Realized Balance</div><div className="title">${balance.toLocaleString()}</div></div>
          </div>
        </div>
        <div className="card">
          <div className="row">
            <div>
              <div className="subtitle">Trade Panel</div>
              <div className="title">Place a demo trade</div>
            </div>
            <div>
              <div className="subtitle">Balance</div>
              <div className="title">${balance.toLocaleString()}</div>
            </div>
          </div>
          <div className="buttons">
            <button className="button green" onClick={() => place("long")}>Buy Long</button>
            <button className="button red" onClick={() => place("short")}>Sell Short</button>
          </div>
          <div className="buttons" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <button className="button gray" onClick={close}>Close Position</button>
            <button className="button gray" onClick={() => { setHistory([]); setBalance(10000); setOpen(null); }}>Reset</button>
          </div>
          <div className="card" style={{ marginTop: 8 }}>
            <div className="subtitle">Trade History</div>
            <div className="history">
              {history.map(item => (
                <div key={item.id + String(item.closeTime || item.time)} className="card" style={{ padding: 8 }}>
                  <div className="row">
                    <div>
                      <div className="title" style={{ fontSize: 14 }}>{String(item.side).toUpperCase()} {item.size}u</div>
                      <div className="badge">Entry ${item.entry} · {fmt(item.time)}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="title" style={{ fontSize: 14 }}>{item.status === "open" ? "OPEN" : ((Number(item.pnl) || 0) >= 0 ? `+${Number(item.pnl)}` : String(item.pnl))}</div>
                      {item.exit ? <div className="badge">Exit ${item.exit}</div> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="footer">Demo UI. Not financial advice.</div>
    </div>
  );
}

# FILE: client/index.html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Crypto Trade Demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.jsx"></script>
  </body>
</html>

# FILE: tests/server.test.js
import assert from "node:assert";
import { WebSocket } from "ws";

const host = process.env.HOST || "localhost";
const url = `ws://${host}:4000/ws`;

function once(ws, type) { return new Promise(r => ws.once(type, r)); }

(async () => {
  const ws = new WebSocket(url);
  await once(ws, "open");
  ws.send(JSON.stringify({ type: "getState" }));
  const msg1 = await new Promise(res => ws.once("message", m => res(JSON.parse(String(m)))));
  assert.ok(msg1 && typeof msg1 === "object");
  let gotTick = false;
  const onMsg = m => { const j = JSON.parse(String(m)); if (j.type === "tick") gotTick = true; };
  ws.on("message", onMsg);
  await new Promise(r => setTimeout(r, 1500));
  assert.ok(gotTick);
  ws.send(JSON.stringify({ type: "placeOrder", side: "long", size: 1 }));
  const openMsg = await new Promise(res => ws.once("message", m => res(JSON.parse(String(m)))));
  assert.equal(openMsg.type, "orderOpen");
  assert.ok(openMsg.order && openMsg.order.status === "open");
  ws.send(JSON.stringify({ type: "closeOrder" }));
  const closeMsg = await new Promise(res => ws.once("message", m => res(JSON.parse(String(m)))));
  assert.equal(closeMsg.type, "orderClosed");
  assert.ok(typeof closeMsg.order.pnl === "number");
  ws.close();
  process.exit(0);
})();
