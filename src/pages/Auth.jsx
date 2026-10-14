import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, MapPin, Phone, LogIn, UserPlus, Loader2, HeartPulse, Activity } from "lucide-react";

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        address: "",
        contactNumber: "",
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const endpoint = isLogin ? `${API_URL}/auth/login` : `${API_URL}/auth/register`;

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Authentication failed');
            }

            // Save token and navigate with a full reload to initialize state
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/profile';
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex font-sans overflow-hidden bg-[#F0F4F8] relative">
            
            {/* Ambient Background Animations */}
            <motion.div 
                animate={{ 
                    x: [0, 100, -50, 0],
                    y: [0, -100, 50, 0],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#2A9D8F]/15 blur-[120px] pointer-events-none"
            />
            <motion.div 
                animate={{ 
                    x: [0, -150, 50, 0],
                    y: [0, 150, -50, 0],
                }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#3B82F6]/10 blur-[100px] pointer-events-none"
            />
            <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[30%] right-[30%] w-[30vw] h-[30vw] rounded-full bg-[#F4A261]/10 blur-[100px] pointer-events-none"
            />

            {/* Left Column: AI Medical Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 z-10">
                <div className="relative z-10 text-center flex flex-col items-center">
                    
                    {/* Beating Heart Icon */}
                    <motion.div
                        animate={{ scale: [1, 1.25, 1, 1.15, 1] }}
                        transition={{ 
                            duration: 1.5, 
                            repeat: Infinity, 
                            ease: "easeInOut", 
                            times: [0, 0.15, 0.3, 0.45, 1] 
                        }}
                        className="mb-8 w-28 h-28 bg-gradient-to-br from-teal to-blue-500 rounded-3xl flex items-center justify-center shadow-[0_8px_32px_rgba(42,157,143,0.4)] relative"
                    >
                        <HeartPulse className="text-white relative z-10" size={56} />
                        
                        {/* Pulse Ripple Effect */}
                        <motion.div
                            animate={{ opacity: [0.8, 0], scale: [1, 2] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                            className="absolute inset-0 border-2 border-teal rounded-3xl"
                        />
                    </motion.div>
                    
                    <h1 className="text-6xl font-serif font-bold text-slate-800 tracking-tight mb-4 relative">
                        Dr. Xys
                        <motion.div
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute bottom-0 left-0 h-0.5 w-1/2 bg-gradient-to-r from-transparent via-teal to-transparent"
                        />
                    </h1>
                    <p className="text-slate-600 text-lg font-medium tracking-wide max-w-sm">
                        Your intelligent AI healthcare companion.
                    </p>

                    {/* Animated EKG Line Background */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] opacity-10 pointer-events-none flex items-center justify-center overflow-hidden">
                        <motion.div 
                            animate={{ x: ["-50%", "0%"] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className="w-[200%] flex text-teal"
                        >
                            <Activity size={300} strokeWidth={0.5} className="shrink-0" />
                            <Activity size={300} strokeWidth={0.5} className="shrink-0" />
                            <Activity size={300} strokeWidth={0.5} className="shrink-0" />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Right Column: Auth Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10 overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md bg-white/70 backdrop-blur-2xl border border-white p-8 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)]"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-serif font-bold text-slate-800 mb-2">
                            {isLogin ? "Welcome Back" : "Create Account"}
                        </h2>
                        <p className="text-slate-500 font-medium text-sm">
                            {isLogin ? "Sign in to access your medical records." : "Register to start your consultation."}
                        </p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center justify-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -20 }}
                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -20 }}
                                    className="space-y-4 overflow-hidden"
                                >
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-teal">
                                            <User size={18} className="text-slate-400 group-focus-within:text-teal transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Full Name"
                                            required={!isLogin}
                                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-teal/10 focus:border-teal transition-all shadow-sm outline-none"
                                        />
                                    </div>
                                    
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone size={18} className="text-slate-400 group-focus-within:text-teal transition-colors" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={handleChange}
                                            placeholder="Contact Number"
                                            required={!isLogin}
                                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-teal/10 focus:border-teal transition-all shadow-sm outline-none"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MapPin size={18} className="text-slate-400 group-focus-within:text-teal transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Home Address"
                                            required={!isLogin}
                                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-teal/10 focus:border-teal transition-all shadow-sm outline-none"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail size={18} className="text-slate-400 group-focus-within:text-teal transition-colors" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                required
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-teal/10 focus:border-teal transition-all shadow-sm outline-none"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock size={18} className="text-slate-400 group-focus-within:text-teal transition-colors" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                required
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-teal/10 focus:border-teal transition-all shadow-sm outline-none"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-6 rounded-xl bg-gradient-to-r from-teal to-blue-500 text-white font-bold tracking-wide uppercase text-sm shadow-[0_8px_20px_rgba(42,157,143,0.3)] hover:shadow-[0_12px_25px_rgba(42,157,143,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                            {isLogin ? "Sign In" : "Create Account"}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500 font-medium">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="ml-2 font-bold text-teal hover:text-blue-500 transition-colors"
                        >
                            {isLogin ? "Sign up" : "Log in"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
