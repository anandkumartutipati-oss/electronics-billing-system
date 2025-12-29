import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#3B82F6', '#0EA5E9', '#EF4444', '#F59E0B', '#10B981', '#800000', '#8B5CF6', '#EC4899'];

const CategoryChart = ({ data }) => {
    const { theme } = useTheme();

    const chartData = data?.byType?.map(item => ({
        name: item._id || 'Unknown',
        Sales: item.totalSales,
        Count: item.count
    })) || [];

    if (chartData.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex items-center justify-center backdrop-blur-sm">
                <p className="text-gray-500 dark:text-gray-400">No category data available</p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[400px] backdrop-blur-sm flex flex-col transition-colors">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Category Performance</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="dark:opacity-20" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} className="capitalize" tick={{ fill: '#9CA3AF' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} tickFormatter={(value) => `₹${value}`} />
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
                        <Bar dataKey="Sales" radius={[4, 4, 0, 0]} barSize={40}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CategoryChart;
