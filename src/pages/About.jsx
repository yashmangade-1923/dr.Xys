import { motion } from "framer-motion";
import { Info, Target, Eye, Activity } from "lucide-react";

export default function About() {
    const cardMotion = {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { type: "spring", stiffness: 200, damping: 22 }
    };

    return (
        <div className="w-full flex-1 bg-skeuo-bg text-text-primary p-8 pb-8">
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                className="max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="mb-10 flex flex-col items-center justify-center text-center border-b border-border pb-8 mt-8">
                    <div className="w-14 h-14 rounded-2xl bg-teal flex items-center justify-center mb-4 shadow-[0_2px_8px_rgba(42,157,143,0.25),_inset_0_1px_0_rgba(255,255,255,0.2)]">
                        <Activity className="text-white w-7 h-7" />
                    </div>
                    <p className="text-[11px] font-semibold text-teal uppercase tracking-wider mb-2">About Us</p>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-primary">MediConsult AI</h1>
                </div>

                {/* Cards */}
                <div className="space-y-6">
                    
                    {/* Introduction */}
                    <motion.div 
                        {...cardMotion}
                        transition={{ ...cardMotion.transition, delay: 0.05 }}
                        className="skeuo-card p-7 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-teal rounded-r-full" />
                        <h3 className="flex items-center gap-3 text-lg font-serif font-bold mb-3 text-text-primary">
                            <Info className="text-teal" size={22} /> Empowering Your Health with Intelligent Care
                        </h3>
                        <p className="text-text-secondary leading-relaxed text-base pl-[34px]">
                            "At MediConsult AI, we believe that understanding your body shouldn't require a medical degree. When you aren't feeling well, you need immediate, clear, and compassionate answers. Dr. Xys is more than just a symptom checker—she is your advanced AI healthcare companion, designed to listen, analyze, and guide you toward better health."
                        </p>
                    </motion.div>

                    {/* Mission */}
                    <motion.div 
                        {...cardMotion}
                        transition={{ ...cardMotion.transition, delay: 0.1 }}
                        className="skeuo-card p-7 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-success rounded-r-full" />
                        <h3 className="flex items-center gap-3 text-lg font-serif font-bold mb-1 text-text-primary">
                            <Target className="text-success" size={22} /> Our Mission
                        </h3>
                        <h4 className="text-sm font-semibold text-success/80 mb-3 pl-[34px]">Bridging the Gap Between Symptoms and Solutions</h4>
                        <p className="text-text-secondary leading-relaxed text-base pl-[34px]">
                            "Our mission is to make high-quality healthcare information accessible to everyone, instantly. We aim to replace the anxiety of late-night web searches with calm, scientifically grounded insights. By combining conversational AI with deep biological understanding, we empower you to take control of your health journey with confidence."
                        </p>
                    </motion.div>

                    {/* Vision */}
                    <motion.div 
                        {...cardMotion}
                        transition={{ ...cardMotion.transition, delay: 0.15 }}
                        className="skeuo-card p-7 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-terracotta rounded-r-full" />
                        <h3 className="flex items-center gap-3 text-lg font-serif font-bold mb-1 text-text-primary">
                            <Eye className="text-terracotta" size={22} /> Our Vision
                        </h3>
                        <h4 className="text-sm font-semibold text-terracotta/80 mb-3 pl-[34px]">A Future of Proactive Wellness</h4>
                        <p className="text-text-secondary leading-relaxed text-base pl-[34px]">
                            "We envision a world where technology and healthcare work in perfect harmony. A world where no one feels lost or alone when navigating an illness. Dr. Xys is being built to be the first step in your care—helping you understand the 'why' behind your symptoms, managing your recovery, and seamlessly connecting you to human medical professionals when you need them most."
                        </p>
                    </motion.div>

                </div>
            </motion.div>
        </div>
    );
}
