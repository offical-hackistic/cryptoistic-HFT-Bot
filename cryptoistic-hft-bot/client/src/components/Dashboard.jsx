import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import TradeTable from './TradeTable';
import axios from 'axios';

const Dashboard = () => {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get('http://localhost:8000/trades');
        setTrades(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <Logo />
      <TradeTable trades={trades} />
    </div>
  );
};

export default Dashboard;