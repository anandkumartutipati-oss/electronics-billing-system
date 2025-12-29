import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const COLOR_MAP = {
    'Cash': '#10B981', // Green
    'UPI': '#3B82F6',  // Blue
    'Card': '#F59E0B', // Orange
    'EMI': '#0EA5E9',  // Sky Blue
};

const DEFAULT_COLOR = '#8884d8';
const COLORS = ['#3B82F6', '#0EA5E9', '#EF4444', '#F59E0B', '#10B981', '#800000', '#8B5CF6', '#EC4899'];

const PaymentChart = ({ data }) => {
    const { theme } = useTheme();

    if (!data || data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-80 flex items-center justify-center transition-colors">
                <p className="text-gray-500 dark:text-gray-400">No payment data available</p>
            </div>
        )
    }

    const chartData = data.map(item => ({
        name: item._id,
        value: item.totalAmount
    }));

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[400px] backdrop-blur-sm transition-colors flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Payment Mode Share</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            stroke={theme === 'dark' ? '#111827' : '#FFFFFF'}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLOR_MAP[entry.name] || COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => `₹${value.toLocaleString()}`}
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                                color: theme === 'dark' ? '#FFFFFF' : '#1F2937'
                            }}
                            itemStyle={{ color: theme === 'dark' ? '#FFFFFF' : '#1F2937' }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PaymentChart;
