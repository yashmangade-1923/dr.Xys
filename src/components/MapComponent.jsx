import { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, Navigation, Loader2 } from "lucide-react";

// --- CUSTOM ICONS ---
// Default Blue Clinic Icon
const defaultIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// Highlighted Nearest Clinic Icon (Green)
const nearestIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// Highlighted User Location Icon (Red)
const userIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// --- HELPER: Haversine Distance ---
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, map.getZoom() || 14);
    return null;
}

export default function MapComponent() {
    const [position, setPosition] = useState([28.4595, 77.0266]); // Default: Gurgaon
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    
    const watchIdRef = useRef(null);

    useEffect(() => {
        // Just fetch clinics on initial load based on default or single getCurrentPosition
        // We defer continuous tracking until they click the button or we force it.
        startTracking();
        
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    const startTracking = () => {
        setLoading(true);
        setError(null);
        if (!navigator.geolocation) {
            setError("Geolocation not supported by this browser.");
            setLoading(false);
            return;
        }

        // Clear existing watch if any
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        setIsTracking(true);
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition([latitude, longitude]);
                
                // If we haven't loaded clinics yet, fetch them now
                if (clinics.length === 0) {
                     fetchClinics(latitude, longitude);
                } else {
                     setLoading(false);
                }
            },
            (err) => {
                setError("Location tracking denied. Ensure GPS is enabled.");
                setIsTracking(false);
                setLoading(false);
                if (clinics.length === 0) fetchClinics(position[0], position[1]);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const fetchClinics = async (lat, lon) => {
        setLoading(true);
        // Overpass API query for hospitals and clinics within 5km
        const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:5000, ${lat}, ${lon});
        node["amenity"="clinic"](around:5000, ${lat}, ${lon});
      );
      out body;
    `;

        try {
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data = await response.json();
            setClinics(data.elements || []);
        } catch (err) {
            console.error("Failed to fetch clinics", err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Nearest Clinic automatically when position or clinics change
    const nearestClinicId = useMemo(() => {
        if (!clinics.length || !position) return null;
        let nearest = null;
        let minDistance = Infinity;

        clinics.forEach(c => {
            const dist = getDistanceKm(position[0], position[1], c.lat, c.lon);
            if (dist < minDistance) {
                minDistance = dist;
                nearest = c.id;
            }
        });
        return nearest;
    }, [clinics, position]);

    return (
        <div className="w-full h-[450px] bg-slate-950 rounded-[2.5rem] overflow-hidden relative border border-white/5 shadow-2xl">
            {loading && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                        <Loader2 className="animate-spin text-cyber-blue" size={48} />
                        <div className="absolute inset-0 blur-xl bg-cyber-blue/20 animate-pulse" />
                    </div>
                    <p className="font-space font-black text-cyber-blue uppercase tracking-widest text-sm animate-pulse">Synchronizing Neural Network...</p>
                </div>
            )}

            {error && !loading && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/20 border border-red-500/50 backdrop-blur-md p-3 rounded-2xl text-red-200 text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {error} - Fallback to Default Node
                </div>
            )}

            <MapContainer center={position} zoom={14} className="w-full h-full z-0 opacity-90 contrast-125 saturate-50">
                {/* Free high-res satellite tiles from ESRI */}
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                />
                <ChangeView center={position} />

                {/* User Location Marker (Red) */}
                <Marker position={position} icon={userIcon}>
                    <Popup>
                        <div className="bg-slate-900 text-white p-2 rounded-lg border border-red-500/50">
                            <h4 className="font-black text-red-400 border-b border-red-500/30 pb-1 mb-1 uppercase text-xs">Patient Active Node</h4>
                            <span className="font-bold text-[10px] text-slate-400">LAT:</span> <span className="text-[10px] font-mono">{position[0].toFixed(5)}</span><br />
                            <span className="font-bold text-[10px] text-slate-400">LON:</span> <span className="text-[10px] font-mono">{position[1].toFixed(5)}</span>
                        </div>
                    </Popup>
                </Marker>

                {/* Clinic Markers */}
                {clinics.map((clinic) => {
                    const isNearest = clinic.id === nearestClinicId;
                    const cLat = clinic.lat;
                    const cLon = clinic.lon;
                    const distKm = getDistanceKm(position[0], position[1], cLat, cLon).toFixed(2);

                    return (
                        <Marker 
                            key={clinic.id} 
                            position={[cLat, cLon]}
                            icon={isNearest ? nearestIcon : defaultIcon}
                            zIndexOffset={isNearest ? 1000 : 0} // Ensure nearest marker is on top
                        >
                            <Popup>
                                <div className={`p-2 border bg-slate-950 ${isNearest ? 'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]' : 'border-cyber-blue/20'}`}>
                                    {isNearest && <div className="text-[9px] font-black uppercase text-green-400 mb-1 flex items-center gap-1 animate-pulse"><MapPin size={10} /> Optimal Target</div>}
                                    <h4 className="font-black text-white uppercase text-xs mb-1">
                                        {clinic.tags.name || "UNIDENTIFIED FACILITY"}
                                    </h4>
                                    <div className="text-[10px] text-slate-400 font-space tracking-wider uppercase mb-1">
                                        TYPE: {clinic.tags.amenity}
                                    </div>
                                    <div className="text-[10px] text-cyber-blue font-black tracking-widest">
                                        DISTANCE: {distKm} KM
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Stats UI Overlay */}
            <div className="absolute top-6 left-6 z-40">
                <div className="glass-panel p-6 rounded-[2rem] border-white/10 max-w-[280px]">
                    <div className="flex items-center gap-2 text-cyber-blue mb-3">
                        <Navigation size={14} className={isTracking && !error ? "animate-pulse" : ""} />
                        <span className="font-space font-black text-[10px] uppercase tracking-[0.2em]">{isTracking && !error ? 'Live Tracking Active' : 'Neural Link Status'}</span>
                    </div>
                    <h3 className="text-white font-black text-xl mb-1 tracking-tight">Facility Node Map</h3>
                    <p className="text-slate-400 text-[11px] mb-5 leading-relaxed">
                        Detected <span className="text-cyber-blue font-bold">{clinics.length} clinical nodes</span> via satellite within your synchronization radius of 5km.
                    </p>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={startTracking}
                            disabled={isTracking && !error}
                            className={`w-full py-3 border text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                isTracking && !error 
                                ? "bg-white/10 border-white/20 opacity-50 cursor-default" 
                                : "bg-white/5 border-white/10 hover:bg-white/10 active:scale-95"
                            }`}
                        >
                            <MapPin size={12} className="inline mr-2 -mt-0.5" /> 
                            {isTracking && !error ? 'Tracking Online' : 'Enable Live Tracking'}
                        </button>
                        <button
                            onClick={() => fetchClinics(position[0], position[1])}
                            className="w-full py-3 bg-cyber-blue text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,242,255,0.2)]"
                        >
                            Sync Facility Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
