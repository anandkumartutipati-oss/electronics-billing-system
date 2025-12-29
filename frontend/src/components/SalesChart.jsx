import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Rectangle } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#3B82F6', '#0EA5E9', '#EF4444', '#F59E0B', '#10B981', '#800000', '#8B5CF6', '#EC4899'];

const SalesChart = ({ data }) => {
    const { theme } = useTheme();

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-[400px] backdrop-blur-sm transition-colors flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Sales Overview</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} className="dark:opacity-20" />
                        <XAxis
                            dataKey="_id"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                                color: theme === 'dark' ? '#FFFFFF' : '#1F2937'
                            }}
                            itemStyle={{ color: theme === 'dark' ? '#FFFFFF' : '#1F2937' }}
                            cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                            formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Bar
                            dataKey="revenue"
                            radius={[6, 6, 0, 0]}
                            barSize={40}
                        >
                            {data && data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;
