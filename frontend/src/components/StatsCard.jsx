import React from 'react';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => {

    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow backdrop-blur-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
                    <Icon size={24} />
                </div>
            </div>
            {(trend || trendValue) && (
                <div className="mt-4 flex items-center text-sm">
                    {trend === 'up' && <span className="text-green-500 dark:text-green-400 font-medium">↑ {trendValue}</span>}
                    {trend === 'down' && <span className="text-red-500 dark:text-red-400 font-medium">↓ {trendValue}</span>}
                    <span className="text-gray-400 dark:text-gray-500 ml-2">vs last month</span>
                </div>
            )}
        </div>
    );
};

export default StatsCard;
