import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateShopSettings } from '../features/shops/shopSlice';
import { toast } from 'react-toastify';
import { Upload, Save, Building2, Phone, Mail, FileText, MapPin, ImageIcon, X } from 'lucide-react';
import BASE_URL from '../api';

const ShopSettings = () => {
    const dispatch = useDispatch();
    const { currentShop, isLoading } = useSelector((state) => state.shops);

    const [formData, setFormData] = useState({
        shopName: '',
        phone: '',
        email: '',
        address: '',
        gstNumber: '',
        terms: '',
        logo: ''
    });

    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (currentShop) {
            setFormData({
                shopName: currentShop.shopName || '',
                phone: currentShop.phone || '',
                email: currentShop.email || '',
                address: currentShop.address || '',
                gstNumber: currentShop.gstNumber || '',
                terms: currentShop.terms || '',
                logo: currentShop.logo || ''
            });
        }
    }, [currentShop]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image size too large. Max 2MB allowed.");
            return;
        }

        const formDataUpload = new FormData();
        formDataUpload.append('logo', file);

        setUploading(true);
        try {
            const response = await fetch(`${BASE_URL}/shops/upload`, {
                method: 'POST',
                body: formDataUpload,
            });

            const data = await response.json();
            if (response.ok) {
                const cleanBase = BASE_URL.replace('/api', '');
                const fullLogoUrl = data.logoUrl.startsWith('http') ? data.logoUrl : `${cleanBase}${data.logoUrl}`;

                setFormData(prev => ({ ...prev, logo: fullLogoUrl }));
                toast.success("Logo uploaded successfully!");
            } else {
                throw new Error(data.message || "Upload failed");
            }

        } catch (error) {
            console.error("Upload error:", error);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result }));
            };
            reader.readAsDataURL(file);
            toast.info("Using local preview (Upload failed)");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await dispatch(updateShopSettings(formData)).unwrap();
            toast.success("Shop settings updated successfully!");
        } catch (error) {
            toast.error(error?.message || "Failed to update settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto h-full overflow-y-auto pb-24">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Shop Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your shop profile, branding, and invoice configuration.</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 text-sm whitespace-nowrap"
                >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column: Basic Details */}
                <div className="space-y-6">
                    {/* General Info */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Building2 size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            General Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Shop Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.shopName}
                                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all shadow-sm text-sm"
                                    required
                                    placeholder="e.g. Alpha Electronics"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">GST Number</label>
                                <div className="relative">
                                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={formData.gstNumber}
                                        onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all shadow-sm text-sm"
                                        placeholder="GSTIN"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mobile Number <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all shadow-sm text-sm"
                                        required
                                        placeholder="+91 ...."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all shadow-sm text-sm"
                                        placeholder="store@example.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <MapPin size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            Location
                        </h2>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Address <span className="text-red-500">*</span></label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows="5"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all shadow-sm text-sm resize-none"
                                required
                                placeholder="Shop Number, Street, City, State, Zip..."
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Branding & Terms */}
                <div className="space-y-6">
                    {/* Branding */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <ImageIcon size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            Branding & Logo
                        </h2>

                        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                            <div className="flex-shrink-0">
                                <div
                                    className="relative group w-32 h-32 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm hover:shadow-md transition-all cursor-zoom-in"
                                    onClick={() => formData.logo && setShowPreview(true)}
                                >
                                    {formData.logo ? (
                                        <img src={formData.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <div className="text-gray-300 dark:text-gray-500">
                                            <ImageIcon size={40} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-center sm:items-start gap-3 w-full">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 dark:text-white">Shop Logo</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recommended: Square PNG, max 2MB.</p>
                                </div>

                                <div className="relative">
                                    <button
                                        type="button"
                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all flex items-center gap-2 active:scale-95"
                                        disabled={uploading}
                                    >
                                        <Upload size={16} />
                                        {uploading ? 'Uploading...' : 'Upload New Logo'}
                                    </button>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            Invoice Terms
                        </h2>
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Terms & Conditions</label>
                            <textarea
                                value={formData.terms}
                                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                                rows="5"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all shadow-sm text-sm resize-none"
                                placeholder="e.g. Goods once sold will not be taken back..."
                            />
                        </div>
                    </div>
                </div>

            </form>

            {/* Logo Preview Modal */}
            {showPreview && formData.logo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowPreview(false)}></div>
                    <div className="relative bg-white dark:bg-gray-900 p-4 rounded-[2rem] shadow-2xl max-w-2xl w-full animate-in zoom-in-95 duration-300 overflow-hidden border border-gray-200 dark:border-gray-800">
                        <button
                            onClick={() => setShowPreview(false)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 hover:bg-red-500 hover:text-white text-gray-500 rounded-xl transition-all active:scale-95 z-10"
                        >
                            <X size={20} />
                        </button>
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-full aspect-square bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center p-8 border border-dashed border-gray-200 dark:border-gray-700">
                                <img src={formData.logo} alt="Large Preview" className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="text-center pb-4">
                                <h3 className="text-xl font-black text-gray-800 dark:text-white">Logo Preview</h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopSettings;
