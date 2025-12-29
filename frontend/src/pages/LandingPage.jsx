import { Link } from 'react-router-dom';
import {
    ShoppingBag, Zap, Shield, BarChart3, ArrowRight,
    CheckCircle2, Package, Users, Receipt,
    Smartphone, Globe, LayoutDashboard, HelpCircle,
    Star, Quote, ChevronDown
} from 'lucide-react';
import { useState } from 'react';

import Footer from '../components/Footer';

const LandingPage = () => {
    const [activeFaq, setActiveFaq] = useState(null);

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden text-slate-900">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                            <ShoppingBag className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">Electro<span className="text-blue-600">Bill</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="px-6 py-2.5 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 uppercase text-xs tracking-widest active:scale-95">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-40 pb-24 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
                    <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-500/5 blur-[120px] rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trusted by 500+ Electronics Shops</span>
                    </div>
                    <h1 className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter leading-[0.85] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Smart Billing For<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Gadgets & Gear.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-2xl text-slate-500 font-medium mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        The ultimate POS and inventory system designed for electronics & electrical stores. Manage warranties, serial numbers, and GST billing effortlessly.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-in fade-in slide-in-from-bottom-16 duration-1000">
                        <Link to="/login" className="px-12 py-6 bg-blue-600 text-white font-black rounded-[28px] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 flex items-center gap-3 uppercase text-sm tracking-widest active:scale-95">
                            Start Free Trial
                            <ArrowRight size={20} />
                        </Link>
                        <button className="px-12 py-6 bg-white text-slate-900 font-black rounded-[28px] border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-3 uppercase text-sm tracking-widest active:scale-95">
                            Watch Demo
                        </button>
                    </div>
                </div>
            </header>

            {/* How It Works Section */}
            <section className="py-32 px-6 bg-white/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight uppercase mb-4">How it works</h2>
                        <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-0 -translate-y-1/2"></div>
                        {[
                            { step: "01", title: "Add Inventory", desc: "Scan barcodes or bulk upload TVs, Mobile Phones, Wires, and Accessories.", icon: Package },
                            { step: "02", title: "Quick Billing", desc: "Select items, add warranties, and generate thermal receipts with GST instantly.", icon: Receipt },
                            { step: "03", title: "Growth Analytics", desc: "Track top-selling brands, category-wise/model-wise sales, and profits.", icon: BarChart3 }
                        ].map((item, i) => (
                            <div key={i} className="relative z-10 bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 text-center group hover:-translate-y-2 transition-transform duration-500">
                                <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-600/20 group-hover:rotate-6 transition-all">
                                    <item.icon size={36} />
                                </div>
                                <span className="text-5xl font-black text-slate-900 opacity-[0.03] absolute top-6 right-10 group-hover:text-blue-600/10 transition-colors">{item.step}</span>
                                <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase">{item.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Showcase */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1">
                            <img
                                src="https://images.hindustantimes.com/tech/img/2020/07/07/1600x900/Panasonic_1594117018731_1594117037452.jpg"
                                alt="Dashboard Preview"
                                className="rounded-[40px] shadow-2xl border border-slate-200 hover:scale-[1.02] transition-transform duration-700 object-cover h-[500px] w-full"
                            />
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6 text-blue-600">
                                <Zap size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Powerful Dashboard</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[0.95] mb-8 uppercase">
                                Take Full Command <br /> of Your Electronics Store
                            </h2>
                            <ul className="space-y-6">
                                {[
                                    { title: "Warranty Management", desc: "Track warranty periods and handle returns/replacements smoothly.", icon: Shield },
                                    { title: "Smart Stock Alerts", desc: "Get notified when bestsellers like iPhone or cables are running low.", icon: Smartphone },
                                    { title: "Cloud Powered", desc: "Manage your shop from home, on any device.", icon: Globe },
                                    { title: "Payment Tracking", desc: "Monitor daily Cash, UPI, and Card collections separately.", icon: LayoutDashboard }
                                ].map((feature, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shrink-0 border border-slate-200 shadow-sm">
                                            <feature.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{feature.title}</h4>
                                            <p className="text-slate-500 font-medium text-sm">{feature.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-32 px-6 bg-slate-900 text-white relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-600 blur-[100px] rounded-full -translate-x-1/2"></div>
                </div>
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase mb-16">Loved by Shop Owners</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Rahul Sharma", role: "Gadget World Owner", text: "ElectroBill made tracking warranties so easy. My customers love the professional bills.", stars: 5 },
                            { name: "Anita Desai", role: "City Electronics", text: "The low stock alerts for small items like cables and batteries saved me from losing sales.", stars: 5 },
                            { name: "Vikram Singh", role: "Singh Electricals", text: "Best software for managing GST and supplier payments. Highly recommended!", stars: 5 }
                        ].map((testimonial, i) => (
                            <div key={i} className="p-10 bg-white/5 backdrop-blur-lg border border-white/10 rounded-[40px] text-left group hover:bg-white/10 transition-all duration-500">
                                <Quote className="text-blue-500 mb-6" size={40} />
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.stars)].map((_, i) => <Star key={i} size={16} className="fill-blue-500 text-blue-500" />)}
                                </div>
                                <p className="text-slate-300 font-medium italic mb-8 leading-relaxed opacity-80">"{testimonial.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center font-black text-blue-500 uppercase border border-blue-500/30">{testimonial.name[0]}</div>
                                    <div>
                                        <h4 className="font-bold text-white">{testimonial.name}</h4>
                                        <p className="text-slate-400 text-sm opacity-60">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-32 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-20">
                        <HelpCircle className="text-blue-600 mx-auto mb-4" size={48} />
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight uppercase mb-4">Frequently Asked</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { q: "Does it support barcode scanners?", a: "Yes! Simply plug in any USB or Bluetooth barcode scanner and start billing instantaneously." },
                            { q: "Can I print on thermal printers?", a: "Absolutely. We support all standard thermal receipt printers (2 inch & 3 inch) as well as A4 laser printers." },
                            { q: "How secure is my shop data?", a: "We use banking-grade encryption and secure access controls to ensure your business data is always protected." },
                            { q: "Does it handle GST calculation?", a: "Yes, GST is calculated automatically based on the HSN code and tax slab you define for each product." }
                        ].map((faq, i) => (
                            <div key={i} className="border border-slate-200 rounded-[28px] overflow-hidden transition-all bg-white hover:bg-slate-50">
                                <button
                                    onClick={() => toggleFaq(i)}
                                    className="w-full p-8 flex items-center justify-between text-left"
                                >
                                    <span className="text-lg font-black text-slate-900 uppercase tracking-tight">{faq.q}</span>
                                    <div className={`text-blue-600 transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={24} />
                                    </div>
                                </button>
                                <div className={`px-8 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-40 py-8 border-t border-slate-100' : 'max-h-0'}`}>
                                    <p className="text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-blue-600 rounded-[60px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-blue-600/40">
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                            <div className="absolute top-0 right-0 w-[40%] h-full bg-white/10 -skew-x-12 translate-x-1/2"></div>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-10 relative z-10 uppercase">
                            Ready to Upgrade <br /> Your Store?
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                            <Link to="/login" className="px-14 py-6 bg-slate-900 text-white font-black rounded-[28px] hover:bg-slate-800 transition-all shadow-xl flex items-center gap-3 uppercase text-sm tracking-widest active:scale-95">
                                Start Free Trial
                                <ArrowRight size={20} />
                            </Link>
                            <span className="text-white/80 font-medium">14-day free trial. No credit card required.</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comprehensive Footer */}
            <Footer />
        </div>
    );
};

export default LandingPage;
