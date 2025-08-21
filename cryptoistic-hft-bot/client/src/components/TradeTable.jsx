import React from 'react';

const TradeTable = ({ trades }) => (
  <table className="trade-table">
    <thead>
      <tr>
        <th>Coin</th>
        <th>Type</th>
        <th>Entry</th>
        <th>Exit</th>
        <th>Profit</th>
      </tr>
    </thead>
    <tbody>
      {trades.map((t, idx) => (
        <tr key={idx}>
          <td>{t.coin}</td>
          <td>{t.type}</td>
          <td>{t.entry}</td>
          <td>{t.exit ?? '-'}</td>
          <td>{t.profit ?? '-'}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default TradeTable;