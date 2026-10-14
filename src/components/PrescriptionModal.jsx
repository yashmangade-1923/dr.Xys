import { motion, AnimatePresence } from "framer-motion";
import { Pill, AlertTriangle, X, ShieldCheck, MapPin, ShoppingCart, Loader2, Store } from "lucide-react";
import PrescriptionButton from "./PrescriptionButton";
import { useState } from "react";

export default function PrescriptionModal({ isOpen, onClose, aiResponse }) {
    const [isLocating, setIsLocating] = useState(false);

    const handleFindNearby = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    window.open(`https://www.google.com/maps/search/pharmacy/@${latitude},${longitude},15z`, '_blank');
                    setIsLocating(false);
                },
                (error) => {
                    console.warn("Geolocation failed:", error);
                    window.open(`https://www.google.com/maps/search/pharmacies+near+me`, '_blank');
                    setIsLocating(false);
                },
                { timeout: 10000 }
            );
        } else {
            window.open(`https://www.google.com/maps/search/pharmacies+near+me`, '_blank');
            setIsLocating(false);
        }
    };
    return (
        <AnimatePresence>
            {isOpen && aiResponse && aiResponse.type !== "general" && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 16 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 16 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="w-full max-w-2xl skeuo-card overflow-hidden flex flex-col"
                        style={{
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 24px 64px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)'
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border-light bg-skeuo-bg/50">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-teal tracking-widest uppercase mb-1">
                                    Medical Report
                                </span>
                                <h2 className="text-xl font-serif font-bold text-text-primary">
                                    Recommended Treatment Plan
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-skeuo-bg-deep text-text-muted hover:text-text-primary transition-colors"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5">
                            {/* Warning Banner */}
                            {aiResponse.doctor_warning && (
                                <div className="flex items-start gap-4 p-4 bg-warning/8 border border-warning/25 rounded-xl">
                                    <AlertTriangle className="shrink-0 mt-0.5 text-warning" size={20} />
                                    <div className="flex flex-col gap-2.5">
                                        <h4 className="text-xs font-bold tracking-wide uppercase mb-0 text-warning">
                                            Important Advisory
                                        </h4>
                                        <p className="text-sm leading-relaxed text-text-secondary">
                                            {aiResponse.doctor_warning}
                                        </p>
                                        <a href="tel:108" className="inline-flex w-fit items-center gap-1.5 px-3 py-1.5 bg-danger/90 hover:bg-danger text-white text-[10px] uppercase font-bold tracking-wider rounded border border-danger shadow-sm transition-colors mt-1">
                                            <AlertTriangle size={12} />
                                            Call 108 (Emergency)
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Prescription Items */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 text-text-muted">
                                    <Pill size={16} />
                                    <h3 className="text-xs font-bold tracking-wide uppercase">
                                        Suggested Medicines & Remedies
                                    </h3>
                                </div>

                                {aiResponse.mock_prescription?.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2.5">
                                        {aiResponse.mock_prescription.map((med, index) => (
                                            <div
                                                key={index}
                                                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 skeuo-inset hover:bg-skeuo-bg transition-colors rounded-xl"
                                            >
                                                <div className="flex flex-col mb-2 sm:mb-0">
                                                    <span className="text-base font-bold text-teal">
                                                        {med.medicine_name}
                                                    </span>
                                                    <span className="text-xs text-text-muted">
                                                        {med.dosage}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col sm:items-end text-sm text-text-secondary">
                                                    <span className="font-semibold text-text-primary">{med.frequency}</span>
                                                    <span className="text-xs text-text-muted">Duration: {med.duration}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-text-muted italic skeuo-inset p-4 text-center rounded-xl">
                                        No specific medications recommended for this query.
                                    </p>
                                )}
                            </div>

                            {/* Further Actions */}
                            {aiResponse.further_actions && (
                                <div className="p-5 bg-teal-light/40 border border-teal/10 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2.5 text-teal">
                                        <ShieldCheck size={16} />
                                        <h3 className="text-xs font-bold tracking-wide uppercase">
                                            Lifestyle & Follow-up
                                        </h3>
                                    </div>
                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        {aiResponse.further_actions}
                                    </p>
                                </div>
                            )}

                            {/* Pharmacy Options */}
                            <div className="pt-2 border-t border-border-light">
                                <div className="flex items-center gap-2 mb-4 text-text-muted mt-4">
                                    <Store size={16} />
                                    <h3 className="text-xs font-bold tracking-wide uppercase">
                                        Fulfill Prescription
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Nearby Pharmacies */}
                                    <button
                                        onClick={handleFindNearby}
                                        disabled={isLocating}
                                        className="flex items-center justify-between p-4 rounded-xl border border-border bg-skeuo-card hover:bg-skeuo-bg transition-colors shadow-sm text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center text-teal">
                                                {isLocating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                                            </div>
                                            <div>
                                                <span className="block text-sm font-bold text-text-primary group-hover:text-teal transition-colors">Local Pharmacies</span>
                                                <span className="block text-xs text-text-muted">Find on Google Maps</span>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Online Delivery - Apollo */}
                                    <a
                                        href="https://www.apollopharmacy.in/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 rounded-xl border border-border bg-skeuo-card hover:bg-skeuo-bg transition-colors shadow-sm text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                                <ShoppingCart size={16} />
                                            </div>
                                            <div>
                                                <span className="block text-sm font-bold text-text-primary group-hover:text-blue-600 transition-colors">Apollo Pharmacy</span>
                                                <span className="block text-xs text-text-muted">Order online for delivery</span>
                                            </div>
                                        </div>
                                    </a>

                                    {/* Online Delivery - Amazon */}
                                    <a
                                        href="https://www.amazon.in/amazonpharmacy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 rounded-xl border border-border bg-skeuo-card hover:bg-skeuo-bg transition-colors shadow-sm text-left group md:col-span-2"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#FF9900]/10 flex items-center justify-center text-[#FF9900]">
                                                <ShoppingCart size={16} />
                                            </div>
                                            <div>
                                                <span className="block text-sm font-bold text-text-primary group-hover:text-[#FF9900] transition-colors">Amazon Pharmacy</span>
                                                <span className="block text-xs text-text-muted">Fast delivery with Prime</span>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border-light bg-skeuo-bg/30">
                            <div className="-mt-4">
                                <PrescriptionButton aiResponse={aiResponse} />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
