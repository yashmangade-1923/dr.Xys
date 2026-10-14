import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Stethoscope, Mic, ShieldCheck, HeartPulse, Activity } from "lucide-react";
import { useGlobalVoice } from "../context/VoiceContext";

export default function Home() {
    const { phase } = useGlobalVoice();
    const isOngoing = phase !== "idle" && phase !== "done";

    return (
        <div className="w-full flex-1 bg-skeuo-bg text-text-primary flex flex-col items-center justify-center p-8 relative">
            {/* Background glowing effects */}
            <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-teal/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-[50%] right-[40%] w-64 h-64 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-4xl mx-auto text-center z-10"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-skeuo-card border border-border-light shadow-sm mb-6">
                    <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Meet Dr. Xys</span>
                </div>

                <h1 className="text-6xl md:text-7xl font-serif font-bold mb-6 tracking-tight">
                    Your Personal AI <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-blue-400">
                        Healthcare Assistant
                    </span>
                </h1>

                <p className="text-lg text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
                    Experience a warm, empathetic, and professional consultation with Dr. Xys. Speak naturally, share your symptoms, and get a structured diagnosis with actionable treatment plans.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/consult">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-8 py-4 rounded-full ${isOngoing ? 'bg-warning text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-teal text-white shadow-[0_0_20px_rgba(20,184,166,0.4)]'} font-semibold text-sm tracking-widest uppercase flex items-center gap-3`}
                        >
                            <Mic size={18} className={isOngoing ? "animate-pulse" : ""} />
                            {isOngoing ? "Resume Consultation" : "Start Consultation"}
                        </motion.button>
                    </Link>
                    <Link to="/about">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 rounded-full bg-skeuo-card border border-border text-text-primary font-semibold text-sm tracking-widest uppercase shadow-sm flex items-center gap-3 hover:bg-skeuo-bg-deep transition-colors"
                        >
                            <Activity size={18} />
                            Learn More
                        </motion.button>
                    </Link>
                </div>
            </motion.div>

            {/* Features Section */}
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-24 z-10"
            >
                {[
                    { icon: Stethoscope, title: "Deep Diagnostics", desc: "interactive Doctor's Q&A and body map" },
                    { icon: ShieldCheck, title: "Privacy First", desc: "All your data stays safe & secure" },
                    { icon: HeartPulse, title: "Instant Prescriptions", desc: "Get detailed reports & nearby hospital links." }
                ].map((feat, idx) => (
                    <div key={idx} className="p-6 skeuo-card border border-border-light rounded-2xl flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-xl bg-skeuo-inset flex items-center justify-center mb-4 text-teal">
                            <feat.icon size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-text-primary mb-2">{feat.title}</h3>
                        <p className="text-sm text-text-muted">{feat.desc}</p>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
