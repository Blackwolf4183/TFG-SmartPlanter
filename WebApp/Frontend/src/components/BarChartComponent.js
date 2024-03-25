import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BarChartComponent = ({ data }) => {
  const formatYAxisTick = (tick) => `${tick}ml`;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 40, right: 0, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" tickFormatter={(date) => new Date(date).toLocaleDateString('es-ES')} />
        <YAxis domain={[0, 200]} tickFormatter={formatYAxisTick} />
        <Tooltip
          content={({ label, payload }) => {
            return (
              <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
                <p>{new Date(label).toLocaleString('es-ES')}</p>
                {payload.map((item, index) => (
                  <p key={index} style={{ color: item.color }}>
                    {item.name}: {item.value.toFixed(2)}{item.unit}
                  </p>
                ))}
              </div>
            );
          }}
        />
        <Legend />
        <Bar dataKey="irrigationamount" fill="#8884d8" name="Volumen de riego" unit="ml" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;
