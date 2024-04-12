import React from 'react';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const PieChartComponent = ({ data }) => {
  // Function to group errors by error message, maintaining both full and truncated names
  const groupErrors = () => {
    const groupedData = {};
    data.forEach((error, index) => {
      const fullKey = error.errormessage; // Full error message
      const truncatedKey = limitString(error.errormessage, 50); // Truncated error message
      if (!groupedData[fullKey]) {
        groupedData[fullKey] = { name: truncatedKey, fullName: fullKey, value: 1, colorIndex: index };
      } else {
        groupedData[fullKey].value++;
      }
    });
    return Object.values(groupedData); // Convert object to array of values
  };

  function limitString(str, maxLength) {
    if (str.length > maxLength) {
        return str.substring(0, maxLength) + '...';
    }
    return str;
  }

  const groupedData = groupErrors();

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
        <Pie
          data={groupedData}
          dataKey="value"
          nameKey="name" // Use truncated names for legend
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={60}
          label
          fill="#8884d8"
        >
          {groupedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[entry.colorIndex % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name, props) => `${props.payload.fullName}: ${value}`} /> {/* Custom tooltip using full names */}
        {groupedData.length <= 2 && <Legend formatter={(value) => groupedData.find(x => x.name === value).name} />} {/* Custom legend using full names */}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent;
