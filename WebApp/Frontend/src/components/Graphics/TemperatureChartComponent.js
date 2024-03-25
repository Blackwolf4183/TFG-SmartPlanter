import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const TemperatureChartComponent = ({ data }) => {

  const formatYAxisTick = (tick) => `${tick}ºC`;

  return (
    <ResponsiveContainer width="100%" >
      <AreaChart data={data} margin={{ top: 40, right: 0, left: -20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="2 2" />
        <XAxis dataKey="timestamp"  tickFormatter={(date) => new Date(date).toLocaleDateString('es-ES')}/>
        <YAxis  tickFormatter={formatYAxisTick}/>
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
        <Area type="monotone" dataKey="temperature" stroke="#8884d8" fill="#8884d8" name="Temperatura" unit="ºC"/>
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TemperatureChartComponent;
