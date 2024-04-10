import React from 'react';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer,Cell } from 'recharts';

const PieChartComponent = ({ data }) => {
  // Function to group errors by errormessage
  const groupErrors = () => {
    const groupedData = {};
    data.forEach((error, index) => {
      const key = error.errormessage;
      if (!groupedData[key]) {
        groupedData[key] = { name: key, value: 1, colorIndex: index }; // Assign a color index to each error
      } else {
        groupedData[key].value++;
      }
    });
    return Object.values(groupedData); // Convert object to array of values
  };

  // Get the grouped data
  const groupedData = groupErrors();

  // Define colors for each error based on colorIndex
  const colors = [
      '#FF5252',
      '#D50000',
      '#FF1744',
      '#FF8A80', 
      '#FF1744',
      '#D50000',
      '#FF8A80',
      '#FF5252',
      '#FF1744',
      '#FF5252',
  ];

  return (
    <ResponsiveContainer width="90%" height={300}>
      <PieChart>
        <Pie data={groupedData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={60} label fill="#8884d8">
          {groupedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[entry.colorIndex % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        {groupedData.length <= 2 && <Legend/>}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent;
