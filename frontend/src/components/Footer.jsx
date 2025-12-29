import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 transition-colors duration-300">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* About Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <ShoppingBag className="text-white w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">ElectroBill</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400">
                            Empowering electronics and electrical shops with smart billing, inventory management, and analytics.
                            Simplify your business today.
                        </p>
                        <div className="flex space-x-3">
                            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="p-2.5 rounded-full bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white transition-all duration-300 hover:scale-110"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-bold text-white">Quick Links</h4>
                        <ul className="space-y-3">
                            <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
                            <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                            <li><Link to="/features" className="hover:text-blue-400 transition-colors">Features</Link></li>
                            <li><Link to="/login" className="hover:text-blue-400 transition-colors">Login / Sign Up</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-bold text-white">Features</h4>
                        <ul className="space-y-3">
                            <li className="hover:text-blue-400 transition-colors cursor-pointer">GST Invoicing</li>
                            <li className="hover:text-blue-400 transition-colors cursor-pointer">Inventory Tracking</li>
                            <li className="hover:text-blue-400 transition-colors cursor-pointer">Warranty Management</li>
                            <li className="hover:text-blue-400 transition-colors cursor-pointer">Low Stock Alerts</li>
                            <li className="hover:text-blue-400 transition-colors cursor-pointer">Sales Analytics</li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-bold text-white">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3 group">
                                <MapPin size={20} className="text-blue-500 mt-1 shrink-0 group-hover:scale-110 transition-transform" />
                                <span className="text-sm group-hover:text-blue-400 transition-colors">
                                    123 Tech Park, Electronics City,<br />Bangalore, KA 560100
                                </span>
                            </li>
                            <li className="flex items-center space-x-3 group">
                                <Phone size={20} className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
                                <a href="tel:+919876543210" className="text-sm hover:text-blue-400 transition-colors">
                                    +91 98765 43210
                                </a>
                            </li>
                            <li className="flex items-center space-x-3 group">
                                <Mail size={20} className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
                                <a href="mailto:support@electrobill.com" className="text-sm hover:text-blue-400 transition-colors">
                                    support@electrobill.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800 bg-slate-950">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-slate-500">
                            © {currentYear} ElectroBill Systems. All rights reserved.
                        </p>
                        <div className="flex space-x-8 text-sm">
                            <a href="#" className="text-slate-500 hover:text-blue-400 transition-colors">Privacy Policy</a>
                            <a href="#" className="text-slate-500 hover:text-blue-400 transition-colors">Terms of Service</a>
                            <a href="#" className="text-slate-500 hover:text-blue-400 transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
