import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, Wind, Smile } from "lucide-react";
import { analyzeVitalsWithGemini } from "../services/gemini";

export default function VitalsScanner({ isOpen, onClose, onScanComplete }) {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [scanProgress, setScanProgress] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [results, setResults] = useState(null);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
            setScanProgress(0);
            setIsScanning(false);
            setScanComplete(false);
            setResults(null);
        }
        return () => stopCamera();
    }, [isOpen]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error("Camera access denied:", error);
            alert("Could not access the camera. Please allow camera permissions to scan vitals.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const startScan = async () => {
        setIsScanning(true);
        setScanProgress(0);
        
        let base64Image = null;
        if (videoRef.current) {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            base64Image = dataUrl.split(",")[1];
        }

        // Animate progress while waiting for Gemini
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            if (progress <= 90) {
                setScanProgress(progress);
            }
        }, 300);

        let analysisData = null;
        if (base64Image) {
            analysisData = await analyzeVitalsWithGemini(base64Image);
        } else {
            analysisData = {
                mood: "Calm", emoji: "😌", tensionLevel: "Low", respirationRate: 16,
                acne_forehead: false, acne_cheeks: false, acne_chin_jawline: false,
                facial_analysis_summary: "No camera detected."
            };
        }

        clearInterval(interval);
        setScanProgress(100);
        
        setTimeout(() => {
            setIsScanning(false);
            setScanComplete(true);
            stopCamera(); // Turn off the camera since we have the results!
            setResults(analysisData);
            onScanComplete(analysisData);
        }, 500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 16 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 16 }}
                        className="w-full max-w-lg bg-skeuo-card rounded-3xl overflow-hidden shadow-2xl border border-border flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border-light bg-skeuo-bg/50">
                            <div className="flex items-center gap-3">
                                <Activity className="text-teal" size={24} />
                                <h2 className="text-xl font-bold text-text-primary">AI Facial Analysis</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-skeuo-bg-deep text-text-muted transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scanner View */}
                        {!scanComplete && (
                            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                                {!stream && (
                                    <p className="text-white/50 animate-pulse">Initializing Camera...</p>
                                )}
                                
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`w-full h-full object-cover transition-opacity duration-1000 ${stream ? 'opacity-100' : 'opacity-0'}`}
                                />

                                {/* Scanning Overlay Grid */}
                                {isScanning && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100">
                                            <motion.ellipse
                                                cx="50" cy="50" rx="20" ry="25"
                                                fill="none" stroke="#2A9D8F" strokeWidth="0.5"
                                                strokeDasharray="2 2"
                                                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.8, 0.3] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                            {/* Crosshairs */}
                                            <path d="M50,20 L50,23 M50,77 L50,80 M25,50 L28,50 M72,50 L75,50" stroke="#2A9D8F" strokeWidth="0.5" />
                                        </svg>
                                        
                                        {/* Scanning laser line */}
                                        <motion.div
                                            className="w-full h-1 bg-teal shadow-[0_0_15px_rgba(42,157,143,1)] opacity-70"
                                            animate={{ y: ["0%", "100%", "0%"] }}
                                            transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                                        />
                                        
                                        <div className="absolute inset-0 bg-[radial-gradient(transparent_40%,rgba(0,0,0,0.8)_100%)]" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Results Overlay */}
                        <AnimatePresence>
                            {scanComplete && results && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-black flex flex-col p-6 overflow-y-auto max-h-[70vh]"
                                >
                                    <div className="flex-1 flex flex-col items-center justify-start w-full">
                                            <Activity size={48} className="text-teal mb-4 shrink-0" />
                                            <h3 className="text-2xl font-bold text-white mb-2 shrink-0">Scan Complete</h3>
                                            <p className="text-teal-light mb-6 shrink-0">Vitals successfully extracted</p>
                                            
                                            <div className="w-full max-w-xs space-y-3 shrink-0">
                                                <div className="flex items-center justify-between text-white/80 bg-white/5 p-3 rounded-lg border border-white/10">
                                                    <span className="flex items-center gap-2"><Smile size={16} className="text-yellow-400"/> Mood / Emoji</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-white font-bold">{results.mood}</span>
                                                        <motion.span 
                                                            className="text-2xl"
                                                            animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
                                                            transition={{ duration: 1.5, repeat: Infinity }}
                                                        >
                                                            {results.emoji}
                                                        </motion.span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-white/80 bg-white/5 p-3 rounded-lg border border-white/10">
                                                    <span className="flex items-center gap-2"><Activity size={16} className="text-rose-400"/> Tension Level</span>
                                                    <span className="font-mono text-white font-bold">{results.tensionLevel}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-white/80 bg-white/5 p-3 rounded-lg border border-white/10">
                                                    <span className="flex items-center gap-2"><Wind size={16} className="text-teal-400"/> Respiration</span>
                                                    <span className="font-mono text-white font-bold">{results.respirationRate} /min</span>
                                                </div>
                                            </div>

                                            {/* Deep Facial Analysis Section */}
                                            <div className="w-full max-w-xs mt-4 pt-4 border-t border-white/20 shrink-0">
                                                <h4 className="text-teal font-semibold text-xs mb-3 uppercase tracking-wider">Clinical Acne Mapping</h4>
                                                <div className="space-y-2 text-xs">
                                                    <div className={`p-2.5 rounded border ${results.acne_forehead ? 'bg-rose-500/20 border-rose-500/50' : 'bg-white/5 border-white/5'}`}>
                                                        <span className="text-white/70 block mb-0.5">Forehead (Digestive/Stress)</span>
                                                        <span className={results.acne_forehead ? "text-rose-300 font-bold" : "text-white/50"}>{results.acne_forehead ? "Detected" : "Clear"}</span>
                                                    </div>
                                                    <div className={`p-2.5 rounded border ${results.acne_cheeks ? 'bg-rose-500/20 border-rose-500/50' : 'bg-white/5 border-white/5'}`}>
                                                        <span className="text-white/70 block mb-0.5">Cheeks (Respiratory/Pollution)</span>
                                                        <span className={results.acne_cheeks ? "text-rose-300 font-bold" : "text-white/50"}>{results.acne_cheeks ? "Detected" : "Clear"}</span>
                                                    </div>
                                                    <div className={`p-2.5 rounded border ${results.acne_chin_jawline ? 'bg-rose-500/20 border-rose-500/50' : 'bg-white/5 border-white/5'}`}>
                                                        <span className="text-white/70 block mb-0.5">Chin/Jawline (Hormonal/PCOS)</span>
                                                        <span className={results.acne_chin_jawline ? "text-rose-300 font-bold" : "text-white/50"}>{results.acne_chin_jawline ? "Detected" : "Clear"}</span>
                                                    </div>
                                                </div>
                                                <p className="mt-3 text-white/60 text-[11px] leading-tight italic">
                                                    {results.facial_analysis_summary}
                                                </p>
                                            </div>

                                            <button
                                                onClick={onClose}
                                                className="mt-6 px-8 py-3 bg-teal hover:bg-teal-dark text-white rounded-xl font-bold tracking-wider text-sm shadow-lg transition-colors shrink-0 uppercase"
                                            >
                                                Close & Transmit
                                            </button>
                                        </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Controls */}
                        <div className="p-6 bg-skeuo-bg flex flex-col gap-4">
                            {!scanComplete ? (
                                <>
                                    <button
                                        onClick={startScan}
                                        disabled={!stream || isScanning}
                                        className="w-full py-4 skeuo-btn flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-sm"
                                    >
                                        {isScanning ? (
                                            <>Performing AI Facial Scan...</>
                                        ) : (
                                            <>Start AI Facial Scan</>
                                        )}
                                    </button>
                                    
                                    <div className="h-2 bg-border rounded-full overflow-hidden">
                                        <motion.div 
                                            className="h-full bg-teal"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${scanProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-text-muted text-center">
                                        Please hold your face still in the frame and ensure good lighting.
                                    </p>
                                </>
                            ) : (
                                <div className="text-center text-sm font-semibold text-teal py-2 animate-pulse">
                                    Transmitting vitals to Dr. Xys...
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
