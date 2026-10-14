import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, RefreshCw, MapPin } from "lucide-react";
import Model from "react-body-highlighter";

export default function BodyMapPanel({ isOpen, onClose, onConfirm }) {
    const [isFront, setIsFront] = useState(true);
    
    // Markers: { id, x, y, label, side: 'front' | 'back' }
    const [markers, setMarkers] = useState([]);
    
    // State for the currently adding marker (shows input)
    const [draftMarker, setDraftMarker] = useState(null);
    const inputRef = useRef(null);

    if (!isOpen) return null;

    const handleMapClick = (e) => {
        // If already drafting, ignore
        if (draftMarker) return;

        const rect = e.currentTarget.getBoundingClientRect();
        // Calculate percentage to make it responsive
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setDraftMarker({
            id: Date.now(),
            x,
            y,
            side: isFront ? 'front' : 'back',
            label: ""
        });
        
        // Focus input
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const saveDraftMarker = () => {
        if (draftMarker && draftMarker.label.trim()) {
            setMarkers(prev => [...prev, draftMarker]);
        }
        setDraftMarker(null);
    };

    const handleDraftKeyDown = (e) => {
        if (e.key === 'Enter') {
            saveDraftMarker();
        } else if (e.key === 'Escape') {
            setDraftMarker(null);
        }
    };

    const deleteMarker = (id) => {
        setMarkers(prev => prev.filter(m => m.id !== id));
    };

    const handleConfirm = () => {
        const payload = markers.map((m, i) => ({
            id: m.id,
            label: m.label,
            level: 5 // Default intensity
        }));
        onConfirm(payload);
    };

    const data = []; // We don't use react-body-highlighter's built-in highlighting anymore

    // Filter markers for current view
    const visibleMarkers = markers.filter(m => m.side === (isFront ? 'front' : 'back'));
    const isDraftVisible = draftMarker && draftMarker.side === (isFront ? 'front' : 'back');

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="w-full max-w-6xl h-[85vh] bg-skeuo-bg border border-border shadow-2xl rounded-3xl overflow-hidden p-8 relative flex flex-col md:flex-row gap-8"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-text-muted hover:text-text-primary hover:bg-skeuo-card rounded-full transition-colors z-10"
                        >
                            <X size={24} />
                        </button>
                        
                        {/* Left: 3D Body Map UI */}
                        <div className="flex-1 flex flex-col items-center h-full">
                            <div className="w-full flex justify-between items-end mb-4">
                                <div>
                                    <h2 className="text-3xl font-serif font-bold text-text-primary mb-2">Body Map</h2>
                                    <p className="text-sm text-text-secondary">
                                        Click exactly where it hurts to drop a pin, then type the specific body part.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => {
                                        setIsFront(!isFront);
                                        setDraftMarker(null);
                                    }}
                                    className="px-4 py-2 bg-white/80 border border-border rounded-xl shadow-sm text-text-secondary hover:text-teal transition-colors flex items-center gap-2 text-sm font-bold"
                                >
                                    <RefreshCw size={16} />
                                    {isFront ? "Switch to Back View" : "Switch to Front View"}
                                </button>
                            </div>

                            <div 
                                className="relative w-full flex-1 bg-skeuo-card border border-border-light rounded-2xl flex items-center justify-center p-4 overflow-hidden shadow-inner cursor-crosshair"
                                onClick={handleMapClick}
                            >
                                <div className="h-full pointer-events-none">
                                    <Model
                                        data={data}
                                        style={{ height: '100%', padding: '2rem' }}
                                        type={isFront ? "anterior" : "posterior"}
                                    />
                                </div>

                                {/* Render permanent markers */}
                                {visibleMarkers.map(m => (
                                    <div 
                                        key={m.id}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
                                        style={{ left: `${m.x}%`, top: `${m.y}%` }}
                                    >
                                        <div className="w-4 h-4 bg-danger rounded-full border-2 border-white shadow-[0_0_10px_rgba(212,107,107,0.8)] animate-pulse" />
                                        <div className="mt-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm border border-border rounded shadow-sm text-[10px] font-bold text-text-primary whitespace-nowrap">
                                            {m.label}
                                        </div>
                                    </div>
                                ))}

                                {/* Render draft marker */}
                                {isDraftVisible && (
                                    <div 
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20"
                                        style={{ left: `${draftMarker.x}%`, top: `${draftMarker.y}%` }}
                                        onClick={(e) => e.stopPropagation()} // Prevent dropping another pin when clicking the input
                                    >
                                        <div className="w-4 h-4 bg-teal rounded-full border-2 border-white shadow-[0_0_10px_rgba(42,157,143,0.8)]" />
                                        <div className="mt-2 bg-white p-2 rounded-xl shadow-xl border border-border flex flex-col gap-2">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={draftMarker.label}
                                                onChange={(e) => setDraftMarker({...draftMarker, label: e.target.value})}
                                                onKeyDown={handleDraftKeyDown}
                                                placeholder="What hurts here?"
                                                className="text-xs px-3 py-1.5 border border-border rounded-lg outline-none focus:border-teal w-40 text-text-primary"
                                            />
                                            <div className="flex justify-between gap-2">
                                                <button 
                                                    onClick={() => setDraftMarker(null)}
                                                    className="text-[10px] text-text-muted hover:text-danger px-2"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    onClick={saveDraftMarker}
                                                    className="text-[10px] font-bold text-white bg-teal px-3 py-1 rounded-md hover:bg-teal-dark"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Selected Locations & Actions */}
                        <div className="w-full md:w-80 flex flex-col justify-between pt-[4.5rem]">
                            <div className="flex-1 overflow-hidden flex flex-col">
                                <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
                                    <MapPin size={18} className="text-teal" /> 
                                    Pinned Locations
                                </h3>
                                <div className="flex-1 space-y-3 overflow-y-auto pr-2 pb-4">
                                    {markers.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-50">
                                            <MapPin size={32} className="text-text-muted mb-2" />
                                            <p className="text-sm text-text-muted italic">Click on the body map to drop pins on your specific pain locations.</p>
                                        </div>
                                    ) : (
                                        markers.map(m => (
                                            <div key={m.id} className="flex items-center justify-between bg-skeuo-inset p-3 rounded-xl border border-border shadow-sm group">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-text-primary capitalize">{m.label}</span>
                                                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{m.side} view</span>
                                                </div>
                                                <button 
                                                    onClick={() => deleteMarker(m.id)} 
                                                    className="p-1.5 text-text-muted hover:text-danger hover:bg-white rounded-lg transition-colors"
                                                    title="Remove pin"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-6 border-t border-border-light">
                                <button
                                    onClick={handleConfirm}
                                    disabled={markers.length === 0 && !draftMarker}
                                    className="w-full py-4 rounded-xl bg-teal text-white font-bold text-base hover:bg-teal-dark flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(42,157,143,0.3)]"
                                >
                                    <Check size={20} /> Confirm {markers.length > 0 ? markers.length : ""} Location{markers.length !== 1 ? 's' : ''}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-3.5 rounded-xl border border-border bg-skeuo-card text-text-secondary font-bold text-sm hover:bg-skeuo-bg-deep transition-colors shadow-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
