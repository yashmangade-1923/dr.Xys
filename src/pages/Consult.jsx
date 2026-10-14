import { useState, useRef, useEffect } from "react";
import AiDoctorFace from "../components/AiDoctorFace";
import MapComponent from "../components/MapComponent";
import PrescriptionModal from "../components/PrescriptionModal";
import BodyMapPanel from "../components/BodyMapPanel";
import VitalsScanner from "../components/VitalsScanner";
import { useGlobalVoice } from "../context/VoiceContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mic, Activity, Stethoscope, Camera, X, RotateCcw,
    ChevronRight, AlertTriangle, Heart, MessageCircle, User, Loader2, Crosshair, MapPin, Paperclip
} from "lucide-react";

// ─── Chat bubble components ──────────────────────────────────────────────────
function DoctorBubble({ message, isLatest }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -16, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="flex items-start gap-3 max-w-[90%]"
        >
            {/* Avatar chip */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-teal flex items-center justify-center shadow-sm mt-1">
                <Stethoscope size={15} className="text-white" />
            </div>
            <div className={`flex-1 p-4 rounded-2xl rounded-tl-sm border ${
                message.isFinalDiagnosis
                    ? "bg-teal-light/50 border-teal/20"
                    : "bg-skeuo-card border-border-light"
            } shadow-[0_2px_8px_rgba(0,0,0,0.05)]`}>
                <p className="text-[10px] font-semibold text-teal uppercase tracking-wider mb-1.5">
                    {message.isFinalDiagnosis ? "Diagnosis Complete" : "Dr. Xys"}
                </p>
                <p className="text-sm text-text-primary leading-relaxed">{message.text}</p>
                <p className="text-[10px] text-text-muted mt-1.5">
                    {message.timestamp?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
            </div>
            {/* Live pulse for latest doctor question */}
            {isLatest && message.isQuestion && (
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="self-center w-2 h-2 bg-teal rounded-full shrink-0"
                />
            )}
        </motion.div>
    );
}

function UserBubble({ message }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 16, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="flex items-start gap-3 max-w-[90%] ml-auto flex-row-reverse"
        >
            <div className="shrink-0 w-8 h-8 rounded-full bg-skeuo-bg-deep border border-border flex items-center justify-center mt-1">
                <User size={15} className="text-text-muted" />
            </div>
            <div className="flex-1 p-4 rounded-2xl rounded-tr-sm bg-skeuo-inset border border-border shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)]">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">You</p>
                <p className="text-sm text-text-primary leading-relaxed">{message.text}</p>
                <p className="text-[10px] text-text-muted mt-1.5">
                    {message.timestamp?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
            </div>
        </motion.div>
    );
}

// ─── Phase status label ───────────────────────────────────────────────────────
function PhaseLabel({ phase, questionCount, isSpeaking }) {
    if (phase === "idle") return <span className="text-text-muted">Ready to consult</span>;
    if (phase === "listening") return <span className="text-danger font-semibold">Listening&hellip;</span>;
    if (phase === "processing") return <span className="text-warning font-semibold">Thinking&hellip;</span>;
    if (isSpeaking) return <span className="text-teal font-semibold">Speaking&hellip;</span>;
    if (phase === "interviewing") return <span className="text-teal font-semibold">Question {questionCount}</span>;
    if (phase === "done") return <span className="text-success font-semibold">Diagnosis ready</span>;
    return null;
}

// ─── Main Consult Component ──────────────────────────────────────────────────────
export default function Consult() {
    const {
        phase, isListening, isSpeaking, isProcessing,
        isIdle, isDone, isInterviewing, isEmergency,
        conversationHistory, currentQuestion,
        questionCount, aiResponse,
        uploadedImage, setUploadedImage,
        bodyMapData, setBodyMapData,
        vitalsData, setVitalsData,
        startConsultation, resetConsultation, startListening
    } = useGlobalVoice();

    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [isBodyMapOpen, setIsBodyMapOpen] = useState(false);
    const [isVitalsScannerOpen, setIsVitalsScannerOpen] = useState(false);
    const fileInputRef = useRef(null);
    const chatContainerRef = useRef(null);

    const handleBodyMapConfirm = (painData) => {
        setBodyMapData(painData);
        setIsBodyMapOpen(false);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result.split(",")[1];
            setUploadedImage({ mimeType: file.type, base64: base64String, localUrl: reader.result });
        };
        reader.readAsDataURL(file);
    };

    // Auto-scroll to bottom of main container
    useEffect(() => {
        const scrollContainer = document.getElementById("main-scroll-container");
        if (scrollContainer) {
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [conversationHistory, phase, aiResponse]);

    const isActive = !isIdle;
    const canStart = isIdle || isDone;

    return (
        <div className="w-full flex-1 flex text-text-primary bg-skeuo-bg">

            {/* ── LEFT PANEL — Doctor Persona ── */}
            <div className="w-[38%] h-screen sticky top-0 flex flex-col items-center justify-between py-10 px-8 border-r border-border z-10">
                
                {/* Header */}
                <div className="text-center w-full">
                    <p className="text-[10px] font-semibold text-teal uppercase tracking-[0.3em]">
                        Your Personal Doctor
                    </p>
                    <h1 className="text-2xl font-serif font-bold mt-1.5 text-text-primary">
                        Dr. Xys <span className="text-text-muted font-sans font-light text-lg">| Health AI</span>
                    </h1>

                    {/* Phase indicator */}
                    <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-skeuo-card border border-border-light shadow-sm">
                        {(isListening || isProcessing || isSpeaking) && (
                            <span className={`w-1.5 h-1.5 rounded-full ${
                                isListening ? "bg-danger animate-soft-pulse" :
                                isProcessing ? "bg-warning animate-soft-pulse" :
                                "bg-teal animate-soft-pulse"
                            }`} />
                        )}
                        <span className="text-xs">
                            <PhaseLabel
                                phase={phase}
                                questionCount={questionCount}
                                isSpeaking={isSpeaking}
                            />
                        </span>
                    </div>
                </div>

                {/* Avatar */}
                <div className="flex-grow w-full flex items-center justify-center -my-4">
                    <AiDoctorFace
                        isSpeaking={isSpeaking}
                        isListening={isListening}
                        isProcessing={isProcessing}
                    />
                </div>

                {/* Bottom action area */}
                <div className="w-full max-w-sm mt-auto flex flex-col gap-3">

                    {/* Image attachment — only show when idle/not mid-interview */}
                    {canStart && (
                        uploadedImage ? (
                            <div className="relative w-full h-20 rounded-xl border border-border overflow-hidden skeuo-card">
                                <img
                                    src={uploadedImage.localUrl}
                                    alt="Symptom"
                                    className="w-full h-full object-cover opacity-70"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal bg-white/85 px-3 py-1 rounded-full shadow-sm">
                                        Image Attached
                                    </span>
                                </div>
                                <button
                                    onClick={() => setUploadedImage(null)}
                                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full hover:bg-danger/10 transition-colors z-10 border border-border-light shadow-sm"
                                >
                                    <X size={12} className="text-text-secondary" />
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="py-3 rounded-xl border border-border bg-skeuo-card hover:bg-skeuo-bg-deep transition-all flex flex-col items-center justify-center gap-1.5 text-text-muted hover:text-text-primary shadow-sm"
                                >
                                    <Paperclip size={16} className="text-teal" />
                                    <span className="text-[9px] font-semibold uppercase tracking-wider">File</span>
                                </button>
                                <button
                                    onClick={() => setIsBodyMapOpen(true)}
                                    className="py-3 rounded-xl border border-border bg-skeuo-card hover:bg-skeuo-bg-deep transition-all flex flex-col items-center justify-center gap-1.5 text-text-muted hover:text-text-primary shadow-sm"
                                >
                                    <Crosshair size={16} className="text-terracotta" />
                                    <span className="text-[9px] font-semibold uppercase tracking-wider">Body Map</span>
                                </button>
                                <button
                                    onClick={() => setIsVitalsScannerOpen(true)}
                                    className="py-3 rounded-xl border border-border bg-skeuo-card hover:bg-skeuo-bg-deep transition-all flex flex-col items-center justify-center gap-1.5 text-text-muted hover:text-text-primary shadow-sm"
                                >
                                    <Activity size={16} className="text-blue-500" />
                                    <span className="text-[9px] font-semibold uppercase tracking-wider">Scan Vitals</span>
                                </button>
                            </div>
                        )
                    )}

                    {/* Body map confirmed badge */}
                    {bodyMapData && bodyMapData.length > 0 && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl border border-teal/20 bg-teal-light/30">
                            <div className="flex items-center gap-2">
                                <MapPin size={13} className="text-teal" />
                                <span className="text-[10px] font-semibold text-teal uppercase tracking-wider">
                                    {bodyMapData.length} pain location{bodyMapData.length > 1 ? 's' : ''} marked
                                </span>
                            </div>
                            <button
                                onClick={() => setIsBodyMapOpen(true)}
                                className="text-[10px] font-bold text-teal hover:underline"
                            >
                                Edit
                            </button>
                        </div>
                    )}

                    {/* Vitals confirmed badge */}
                    {vitalsData && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10">
                            <div className="flex items-center gap-2">
                                <Activity size={13} className="text-blue-500" />
                                <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">
                                    Vitals Extracted: {vitalsData.heartRate} BPM
                                </span>
                            </div>
                            <button
                                onClick={() => setIsVitalsScannerOpen(true)}
                                className="text-[10px] font-bold text-blue-500 hover:underline"
                            >
                                Rescan
                            </button>
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleImageUpload}
                    />

                    {/* ── Main action button ── */}
                    <AnimatePresence mode="wait">
                        {isIdle && (
                            <motion.button
                                key="start"
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={startConsultation}
                                className="relative w-full py-5 skeuo-btn rounded-2xl text-sm flex flex-col items-center justify-center gap-2"
                            >
                                <Mic size={24} />
                                <span className="text-[11px] tracking-wider uppercase font-bold">
                                    Start Consultation
                                </span>
                            </motion.button>
                        )}

                        {isListening && (
                            <motion.div
                                key="listening"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-full py-5 rounded-2xl flex flex-col items-center justify-center gap-2 border border-danger/30 bg-danger/5"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.15, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    <Mic size={24} className="text-danger" />
                                </motion.div>
                                <span className="text-xs text-danger font-semibold uppercase tracking-wider">
                                    Listening&hellip;
                                </span>
                            </motion.div>
                        )}

                        {isProcessing && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-full py-5 rounded-2xl flex flex-col items-center justify-center gap-2 border border-warning/25 bg-warning/5"
                            >
                                <Loader2 size={24} className="text-warning animate-spin" />
                                <span className="text-xs text-warning font-semibold uppercase tracking-wider">
                                    Analyzing&hellip;
                                </span>
                            </motion.div>
                        )}

                        {isSpeaking && (
                            <motion.div
                                key="speaking"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-full py-5 rounded-2xl flex flex-col items-center justify-center gap-2 border border-teal/20 bg-teal-light/30"
                            >
                                <motion.div
                                    animate={{ scaleY: [1, 1.4, 0.8, 1.2, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                >
                                    <Activity size={24} className="text-teal" />
                                </motion.div>
                                <span className="text-xs text-teal font-semibold uppercase tracking-wider">
                                    Doctor Speaking&hellip;
                                </span>
                            </motion.div>
                        )}

                        {isDone && (
                            <motion.button
                                key="reset"
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={resetConsultation}
                                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 border border-border bg-skeuo-card hover:bg-skeuo-bg-deep transition-all text-text-secondary text-sm font-semibold shadow-sm"
                            >
                                <RotateCcw size={16} />
                                New Consultation
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* Resume / Reset mid-consultation */}
                    {isInterviewing && !isListening && !isProcessing && !isSpeaking && (
                        <div className="flex flex-col gap-2 w-full mt-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={startListening}
                                className="w-full py-4 bg-teal hover:bg-teal-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                            >
                                <Mic size={18} />
                                Tap to Speak
                            </motion.button>
                            <button
                                onClick={resetConsultation}
                                className="text-[11px] text-text-muted hover:text-danger transition-colors flex items-center justify-center gap-1.5 mt-2"
                            >
                                <RotateCcw size={12} /> End consultation
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── RIGHT PANEL — Conversation & Diagnosis ── */}
            <div className="relative w-[62%] flex flex-col">
                {/* ── Emergency UI Override ── */}
                <AnimatePresence>
                    {isEmergency && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 z-50 bg-danger/10 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-28 h-28 bg-danger rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(212,107,107,0.6)] mb-8"
                            >
                                <AlertTriangle size={50} className="text-white" />
                            </motion.div>
                            <h2 className="text-4xl font-serif font-bold text-danger mb-4">
                                MEDICAL EMERGENCY DETECTED
                            </h2>
                            <p className="text-lg text-text-primary mb-10 max-w-lg font-medium leading-relaxed bg-white/60 p-6 rounded-2xl border border-danger/20 shadow-sm">
                                {aiResponse?.doctor_warning || "Please seek immediate medical attention."}
                            </p>

                            <a href="tel:108" className="w-full max-w-sm">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-5 bg-danger hover:bg-red-600 text-white rounded-2xl font-bold text-lg shadow-[0_4px_20px_rgba(212,107,107,0.4)] flex items-center justify-center gap-3 transition-colors"
                                >
                                    <AlertTriangle size={24} />
                                    CALL 108 IMMEDIATELY
                                </motion.button>
                            </a>
                            
                            <button
                                onClick={resetConsultation}
                                className="mt-6 text-sm font-semibold text-text-muted hover:text-text-primary transition-colors underline"
                            >
                                Dismiss & Start New Consultation
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={chatContainerRef} className="flex-1 px-10 py-8 pb-12 flex flex-col">

                    {/* ── Empty / Idle State ── */}
                    {!isActive && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center h-full text-center"
                        >
                            <div className="w-24 h-24 rounded-3xl bg-skeuo-card border border-border-light flex items-center justify-center mb-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                                <MessageCircle size={40} className="text-teal/30" />
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-text-primary mb-2">
                                Ready for Your Consultation
                            </h2>
                            <p className="text-text-muted text-sm max-w-sm leading-relaxed">
                                Dr. Xys will ask you a series of careful questions to understand your condition thoroughly before providing a diagnosis.
                            </p>
                            <div className="mt-8 grid grid-cols-2 gap-3 max-w-sm w-full">
                                {[
                                    "Asks targeted follow-up questions",
                                    "Considers diet, history & triggers",
                                    "Internal vs external pain analysis",
                                    "Remembers past consultations",
                                ].map((feat, i) => (
                                    <div key={i} className="skeuo-card p-3 text-left">
                                        <div className="w-1.5 h-1.5 bg-teal rounded-full mb-1.5" />
                                        <p className="text-xs text-text-secondary leading-snug">{feat}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Conversation Timeline ── */}
                    {isActive && (
                        <div className="space-y-4 max-w-2xl mx-auto">

                            {/* Consultation started header */}
                            <div className="text-center mb-6">
                                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-4 py-1.5 bg-skeuo-card rounded-full border border-border-light shadow-sm">
                                    Consultation in progress
                                </span>
                            </div>

                            {/* Chat bubbles */}
                            {conversationHistory.map((msg, idx) => {
                                if (msg.role === "doctor") {
                                    return <DoctorBubble key={idx} message={msg} isLatest={idx === conversationHistory.length - 1} />;
                                }
                                if (msg.role === "system") {
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-center my-4"
                                        >
                                            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-500 px-4 py-2 rounded-xl text-[10px] font-semibold text-center flex items-center gap-2 shadow-sm uppercase tracking-wider">
                                                <Activity size={12} />
                                                {msg.text}
                                            </div>
                                        </motion.div>
                                    );
                                }
                                return <UserBubble key={idx} message={msg} />;
                            })}

                            {/* Processing indicator (typing animation) */}
                            {isProcessing && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-teal flex items-center justify-center shadow-sm">
                                        <Stethoscope size={15} className="text-white" />
                                    </div>
                                    <div className="skeuo-card px-5 py-3.5 rounded-2xl rounded-tl-sm border border-border-light shadow-sm">
                                        <div className="flex gap-1.5 items-center">
                                            {[0, 1, 2].map(i => (
                                                <motion.div
                                                    key={i}
                                                    className="w-2 h-2 bg-teal/60 rounded-full"
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Listening indicator */}
                            {isListening && (
                                <motion.div
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-3 flex-row-reverse"
                                >
                                    <div className="w-8 h-8 rounded-full bg-skeuo-bg-deep border border-border flex items-center justify-center">
                                        <User size={15} className="text-text-muted" />
                                    </div>
                                    <div className="skeuo-inset px-5 py-3.5 rounded-2xl rounded-tr-sm border border-danger/20">
                                        <div className="flex gap-1.5 items-center">
                                            <motion.div
                                                className="w-2 h-2 bg-danger/70 rounded-full"
                                                animate={{ scale: [1, 1.5, 1] }}
                                                transition={{ duration: 0.8, repeat: Infinity }}
                                            />
                                            <span className="text-xs text-danger font-medium">Listening for your response&hellip;</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                        </div>
                    )}

                    {/* ── Final Diagnosis Card ── */}
                    <AnimatePresence>
                        {aiResponse && isDone && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.2 }}
                                className="max-w-2xl mx-auto mt-6 skeuo-card p-7"
                            >
                                {/* Header */}
                                <div className="border-b border-border-light pb-5 mb-5">
                                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 block">
                                        {aiResponse.type === "general" ? "Response" : "Clinical Diagnosis"}
                                    </span>
                                    {aiResponse.type === "general" ? (
                                        <h3 className="font-serif font-bold text-text-primary text-xl">
                                            Conversation Processed
                                        </h3>
                                    ) : (
                                        <div className="space-y-2">
                                            {aiResponse.possible_conditions?.map((c, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <Stethoscope className="text-teal shrink-0" size={20} />
                                                    <h3 className="font-serif font-bold text-text-primary text-xl">{c}</h3>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Interview summary badge */}
                                    {aiResponse.interview_summary && (
                                        <div className="mt-3 text-xs text-text-muted bg-skeuo-inset px-4 py-2 rounded-lg border border-border-light leading-relaxed">
                                            <span className="font-semibold text-teal">Clinical Summary: </span>
                                            {aiResponse.interview_summary}
                                        </div>
                                    )}
                                </div>

                                {/* Explanation */}
                                <div className="mb-6">
                                    <span className="text-[10px] font-semibold text-teal uppercase tracking-wider mb-2.5 block">
                                        {aiResponse.type === "general" ? "Key Information" : "Medical Explanation"}
                                    </span>
                                    <div className="skeuo-inset p-5 rounded-xl space-y-3">
                                        {aiResponse.biological_explanation?.map((point, idx) => (
                                            <div key={idx} className="flex items-start gap-3 text-sm text-text-secondary">
                                                <ChevronRight className="shrink-0 text-teal mt-0.5" size={14} />
                                                <p className="leading-relaxed">{point}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer actions row */}
                                <div className="flex items-center justify-between pt-5 border-t border-border-light gap-4">
                                    <div className="flex-1">
                                        {aiResponse.type !== "general" && aiResponse.doctor_warning ? (
                                            <div className="flex items-start gap-3 bg-warning/8 border border-warning/20 p-4 rounded-xl">
                                                <AlertTriangle className="shrink-0 mt-0.5 text-warning" size={16} />
                                                <div className="flex flex-col gap-2.5">
                                                    <p className="text-xs leading-relaxed text-text-secondary font-medium">
                                                        {aiResponse.doctor_warning}
                                                    </p>
                                                    <a href="tel:108" className="inline-flex w-fit items-center gap-1.5 px-3 py-1.5 bg-danger/90 hover:bg-danger text-white text-[10px] uppercase font-bold tracking-wider rounded border border-danger shadow-sm transition-colors">
                                                        <AlertTriangle size={12} />
                                                        Call 108 (Emergency)
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-text-muted">
                                                <Heart size={14} className="text-teal" />
                                                <span className="text-xs font-medium">No urgent concerns flagged</span>
                                            </div>
                                        )}
                                    </div>
                                    {aiResponse.type !== "general" && (
                                        <button
                                            onClick={() => setIsPrescriptionModalOpen(true)}
                                            className="shrink-0 py-3 px-5 skeuo-btn flex items-center gap-2 uppercase tracking-wider text-[10px]"
                                        >
                                            View Treatment Plan
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <PrescriptionModal
                isOpen={isPrescriptionModalOpen}
                onClose={() => setIsPrescriptionModalOpen(false)}
                aiResponse={aiResponse}
            />

            <BodyMapPanel
                isOpen={isBodyMapOpen}
                onClose={() => setIsBodyMapOpen(false)}
                onConfirm={handleBodyMapConfirm}
            />

            <VitalsScanner
                isOpen={isVitalsScannerOpen}
                onClose={() => setIsVitalsScannerOpen(false)}
                onScanComplete={(vitals) => {
                    // Inject into conversation history logic
                    setVitalsData(vitals);
                }}
            />
        </div>
    );
}
