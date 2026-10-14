import { useState } from "react";
import { motion } from "framer-motion";
import { Store, MapPin, ShoppingCart, Loader2, HeartPulse } from "lucide-react";

export default function Pharmacy() {
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
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 text-center"
            >
                <div className="w-16 h-16 bg-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-teal shadow-inner">
                    <Store size={32} />
                </div>
                <h1 className="text-4xl font-serif font-bold text-text-primary mb-4 tracking-tight">
                    Pharmacy Services
                </h1>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                    Quickly locate pharmacies near you or order your prescribed medicines online with fast delivery.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nearby Pharmacies */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className="skeuo-card p-8 flex flex-col"
                >
                    <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center text-teal mb-6">
                        <MapPin size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-2">Local Pharmacies</h2>
                    <p className="text-text-secondary mb-8 flex-1">
                        Use your current location to find all open pharmacies near you instantly via Google Maps.
                    </p>
                    <button
                        onClick={handleFindNearby}
                        disabled={isLocating}
                        className="w-full py-4 skeuo-btn flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-sm"
                    >
                        {isLocating ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
                        {isLocating ? "Locating..." : "Find Nearby"}
                    </button>
                </motion.div>

                {/* Apollo Pharmacy */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className="skeuo-card p-8 flex flex-col"
                >
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6">
                        <HeartPulse size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-2">Apollo Pharmacy</h2>
                    <p className="text-text-secondary mb-8 flex-1">
                        Order your medications online directly from Apollo Pharmacy with verified prescriptions.
                    </p>
                    <a
                        href="https://www.apollopharmacy.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 rounded-xl border border-border bg-skeuo-bg hover:bg-blue-50 text-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-sm"
                    >
                        <ShoppingCart size={18} />
                        Order via Apollo
                    </a>
                </motion.div>

                {/* Amazon Pharmacy */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className="skeuo-card p-8 flex flex-col md:col-span-2"
                >
                    <div className="w-12 h-12 rounded-full bg-[#FF9900]/10 flex items-center justify-center text-[#FF9900] mb-6">
                        <ShoppingCart size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-2">Amazon Pharmacy</h2>
                    <p className="text-text-secondary mb-8 flex-1">
                        Get fast, reliable delivery on all your medical needs with Amazon Pharmacy integration.
                    </p>
                    <a
                        href="https://www.amazon.in/amazonpharmacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 rounded-xl border border-border bg-skeuo-bg hover:bg-orange-50 text-[#FF9900] transition-colors shadow-sm flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-sm max-w-sm mx-auto"
                    >
                        <ShoppingCart size={18} />
                        Order via Amazon
                    </a>
                </motion.div>
            </div>
        </div>
    );
}
