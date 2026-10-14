import { motion } from "framer-motion";
import MapComponent from "../components/MapComponent";
import { MapPin } from "lucide-react";

export default function FindDoctor() {
    return (
        <div className="w-full flex-1 bg-skeuo-bg flex flex-col">
            <div className="px-8 py-6 border-b border-border bg-skeuo-card z-10 shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-text-primary flex items-center gap-2">
                        <MapPin className="text-terracotta" size={24} />
                        Find Nearby Care
                    </h1>
                    <p className="text-sm text-text-muted mt-1">
                        Locate hospitals, clinics, and specialists near your area.
                    </p>
                </div>
            </div>
            
            <div className="flex-1 relative">
                <MapComponent />
            </div>
        </div>
    );
}
