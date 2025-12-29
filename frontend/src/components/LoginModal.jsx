import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const LoginModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('owner'); // 'owner' or 'admin'
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const { email, password } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }

        if (isSuccess || user) {
            onClose(); // Close modal on success
            // Redirect based on role
            if (user.role === 'superadmin') {
                navigate('/superadmin');
            } else {
                navigate('/dashboard');
            }
        }

        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch, onClose]);

    if (!isOpen) return null;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const userData = { email, password };
        dispatch(login(userData));
    };

    // Tab switching handler (Reset form when switching)
    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        setFormData({ email: '', password: '' });
        dispatch(reset());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Glassy Modal Content */}
            <div className="relative w-full max-w-md bg-white/10 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
                        <p className="text-blue-200 text-sm">Sign in to your account to continue</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-black/20 rounded-xl mb-8 backdrop-blur-md">
                        <button
                            onClick={() => handleTabSwitch('owner')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === 'owner'
                                    ? 'bg-white text-blue-900 shadow-md transform scale-[1.02]'
                                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <User size={16} />
                            Owner / Staff
                        </button>
                        <button
                            onClick={() => handleTabSwitch('admin')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === 'admin'
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md transform scale-[1.02]'
                                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <User size={16} />
                            Super Admin
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-blue-100 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200 group-focus-within:text-white transition-colors" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={onChange}
                                    required
                                    placeholder="Enter your email"
                                    className="w-full bg-black/20 text-white placeholder-blue-200/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-black/30 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-blue-100 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200 group-focus-within:text-white transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={password}
                                    onChange={onChange}
                                    required
                                    placeholder="Enter your password"
                                    className="w-full bg-black/20 text-white placeholder-blue-200/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-black/30 transition-all font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4 flex items-center justify-center gap-2 ${activeTab === 'admin'
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-purple-500/40'
                                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-blue-500/40'
                                }`}
                        >
                            {isLoading ? <Loader2 size={24} className="animate-spin" /> : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
