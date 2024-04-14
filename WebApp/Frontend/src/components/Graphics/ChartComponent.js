import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ChartComponent = ({ data, checkedItems }) => {

  const formatYAxisTick = (tick) => `${tick}%`;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 40, right: 0, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp"  tickFormatter={(date) => new Date(date).toLocaleDateString('es-ES')}/>
        <YAxis domain={[0, 100]} tickFormatter={formatYAxisTick}/>
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
        {checkedItems[0] && <Line type="monotone" dataKey="lightlevel" stroke="#ffc658" name="Intensidad lumínica" unit="%"/>}
        {checkedItems[1] && <Line type="monotone" dataKey="soilmoisture" stroke="#ff7300" name="Humedad tierra" unit="%"/>}
        {checkedItems[2] && <Line type="monotone" dataKey="airhumidity" stroke="#8884d8" name="Humedad Aire" unit="%"/>}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ChartComponent;
