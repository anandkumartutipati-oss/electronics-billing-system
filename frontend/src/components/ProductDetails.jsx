import { X } from 'lucide-react';

const ProductDetails = ({ product, onClose }) => {
    if (!product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row border border-gray-100 dark:border-gray-700">

                {/* Image Section */}
                <div className="w-full md:w-1/2 p-6 bg-gray-50 dark:bg-gray-700 flex items-center justify-center relative">
                    <img
                        src={product.images && product.images.length > 0 ? (product.images[0].imageUrl || product.images[0]) : 'https://via.placeholder.com/400'}
                        alt={product.productName}
                        className="max-h-80 object-contain mix-blend-multiply dark:mix-blend-normal rounded-lg shadow-sm"
                    />
                    {product.stockQuantity < 5 && (
                        <span className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wide shadow-sm">Low Stock</span>
                    )}
                </div>

                {/* Details Section */}
                <div className="w-full md:w-1/2 p-8 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <X size={24} />
                    </button>

                    <div className="mb-6">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wider">{product.brand}</span>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 mb-2">{product.productName}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">{product.category}</span>
                            <span>•</span>
                            <span>SKU: {product.skuCode}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Selling Price</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{product.sellingPrice}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Purchase Price</p>
                            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">₹{product.purchasePrice}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Stock</p>
                            <p className={`text-lg font-medium ${product.stockQuantity > 0 ? 'text-gray-900 dark:text-white' : 'text-red-500 dark:text-red-400'}`}>
                                {product.stockQuantity} {product.unit}s
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">GST</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">{product.gstPercent}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Warranty</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">{product.warrantyMonths} Months</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Guarantee</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">{product.guaranteeMonths} Months</p>
                        </div>
                    </div>

                    {product.shopId && (
                        <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Store Location</p>
                            <p className="font-medium text-gray-900 dark:text-white">{product.shopId.shopName || 'Unknown Shop'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
