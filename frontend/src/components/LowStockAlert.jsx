import React from 'react';
import { AlertTriangle } from 'lucide-react';

const LowStockAlert = ({ products }) => {
    if (!products || products.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="text-orange-500" size={20} />
                    Low Stock Alerts
                </h3>
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-bold">
                    {products.length} Items
                </span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto">
                {products.map((product) => (
                    <div key={product._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-800 dark:text-white">{product.productName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {product.skuCode}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-red-600 dark:text-red-400">{product.stockQuantity} left</p>
                            {product.supplierId && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer">
                                    Call {product.supplierId.phone}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LowStockAlert;
