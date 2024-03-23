import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ChartComponent = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 40, right: 0, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp"  tickFormatter={(date) => new Date(date).toLocaleDateString('es-ES')}/>
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="soilmoisture" stroke="#8884d8" name="Humedad tierra" />
        <Line type="monotone" dataKey="temperature" stroke="#82ca9d" name="Temperatura" />
        <Line type="monotone" dataKey="airhumidity" stroke="#ffc658" name="Humedad Aire" />
        <Line type="monotone" dataKey="lightlevel" stroke="#ff7300" name="Intensidad lumínica" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ChartComponent;
