import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

// Import all avatar frames
import idleFrame from "../assets/dr_xys_idle.png";
import speakFrame1 from "../assets/dr_xys_speaking1.png";
import speakFrame2 from "../assets/dr_xys_speaking2.png";

const SPEAK_FRAMES = [idleFrame, speakFrame1, speakFrame2, speakFrame1];

export default function AiDoctorFace({ isSpeaking, isListening, isProcessing }) {
    const [currentFrame, setCurrentFrame] = useState(0);
    const intervalRef = useRef(null);

    const statusLabel = isSpeaking ? "Speaking" : isListening ? "Listening" : isProcessing ? "Analyzing" : "Ready";
    const statusDotColor = isSpeaking ? "bg-teal" : isListening ? "bg-danger" : isProcessing ? "bg-warning" : "bg-text-muted";

    // --- Mouth animation: cycle through speaking frames ---
    useEffect(() => {
        if (isSpeaking) {
            // Rapidly cycle between frames to simulate speech
            intervalRef.current = setInterval(() => {
                setCurrentFrame(prev => (prev + 1) % SPEAK_FRAMES.length);
            }, 180); // ~5.5 frames/sec for natural lip sync feel
        } else {
            clearInterval(intervalRef.current);
            setCurrentFrame(0); // Reset to idle/closed mouth
        }
        return () => clearInterval(intervalRef.current);
    }, [isSpeaking]);



    // Select which image to show
    const displayImage = isSpeaking ? SPEAK_FRAMES[currentFrame] : idleFrame;

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden rounded-[2rem]">
            
            {/* Warm ambient glow */}
            <motion.div 
                className="absolute inset-0 pointer-events-none z-0 rounded-full"
                animate={{
                    background: isSpeaking 
                        ? 'radial-gradient(circle at center, rgba(42,157,143,0.12), transparent 70%)'
                        : isListening
                        ? 'radial-gradient(circle at center, rgba(212,107,107,0.08), transparent 70%)'
                        : isProcessing
                        ? 'radial-gradient(circle at center, rgba(224,164,88,0.08), transparent 70%)'
                        : 'radial-gradient(circle at center, rgba(42,157,143,0.04), transparent 70%)'
                }}
                transition={{ duration: 1 }}
            />

            {/* Avatar Frame — skeuomorphic picture frame */}
            <motion.div
                className="relative z-10 w-full max-w-[340px] aspect-square rounded-full flex items-center justify-center"
                style={{
                    background: 'linear-gradient(145deg, #FFFFFF 0%, #EDE9E3 100%)',
                    boxShadow: `
                        0 4px 12px rgba(0,0,0,0.08),
                        0 12px 40px rgba(0,0,0,0.06),
                        inset 0 2px 0 rgba(255,255,255,0.9),
                        inset 0 -2px 4px rgba(0,0,0,0.04)
                    `,
                    padding: '6px',
                    border: '1px solid #DDD9D2',
                }}
                animate={
                    isSpeaking ? { scale: [1, 1.008, 1] } :
                    isListening ? { scale: 1.015 } :
                    { scale: 1 }
                }
                transition={
                    isSpeaking 
                        ? { duration: 0.3, repeat: Infinity, repeatType: "reverse" }
                        : { duration: 0.4, ease: "easeOut" }
                }
            >
                {/* Processing Ring */}
                <AnimatePresence>
                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1.05, rotate: 360 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-[-12px] border-2 border-dashed border-teal/30 rounded-full z-0"
                        />
                    )}
                </AnimatePresence>

                {/* Main Avatar Image — switches frames when speaking */}
                <div className="relative w-full h-full rounded-full overflow-hidden z-10"
                    style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
                        border: '3px solid #EDE9E3',
                    }}
                >
                    {/* Idle frame (always rendered as base) */}
                    <img
                        src={idleFrame}
                        alt="Dr. Xys"
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Speaking frame overlay — crossfade animation */}
                    {isSpeaking && (
                        <motion.img
                            key={currentFrame}
                            src={displayImage}
                            alt="Dr. Xys speaking"
                            className="absolute inset-0 w-full h-full object-cover"
                            initial={{ opacity: 0.6 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.08 }}
                        />
                    )}



                    {/* Listening ring glow */}
                    {isListening && (
                        <motion.div
                            className="absolute inset-0 z-15 pointer-events-none rounded-full"
                            animate={{ 
                                boxShadow: [
                                    'inset 0 0 20px rgba(212,107,107,0.0)',
                                    'inset 0 0 20px rgba(212,107,107,0.15)',
                                    'inset 0 0 20px rgba(212,107,107,0.0)',
                                ]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    )}

                    {/* Speaking ripple */}
                    <AnimatePresence>
                        {isSpeaking && (
                            <motion.div
                                className="absolute inset-0 z-15 pointer-events-none rounded-full"
                                animate={{
                                    boxShadow: [
                                        'inset 0 0 15px rgba(42,157,143,0.0)',
                                        'inset 0 0 15px rgba(42,157,143,0.1)',
                                        'inset 0 0 15px rgba(42,157,143,0.0)',
                                    ]
                                }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Outer speaking pulse ring */}
                <AnimatePresence>
                    {isSpeaking && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: [0.3, 0], scale: [1, 1.15] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            className="absolute inset-0 border-2 border-teal/20 rounded-full z-20 pointer-events-none"
                        />
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Subtle breathing animation when idle */}
            {!isSpeaking && !isListening && !isProcessing && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{ scale: [1, 1.003, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            )}

            {/* Status Badge */}
            <div className="absolute top-6 left-6 z-30 skeuo-card px-4 py-2 rounded-full flex items-center gap-2.5" 
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div className={`w-2 h-2 rounded-full ${statusDotColor} ${(isListening || isSpeaking) ? "animate-soft-pulse" : ""}`} />
                <span className="text-[11px] font-semibold text-text-secondary tracking-wide">
                    {statusLabel}
                </span>
            </div>
        </div>
    );
}
