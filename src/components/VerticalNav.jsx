import { NavLink } from "react-router-dom";

import { Activity, Home, Info, FileText, User, Store, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function VerticalNav() {
    const isSignedIn = true;
    const user = { imageUrl: null }; // Mock user

    const navItems = [
        { path: "/", icon: Home, label: "Dashboard" },
        { path: "/downloads", icon: FileText, label: "Records" },
        { path: "/pharmacy", icon: Store, label: "Pharmacy" },
        { path: "/about", icon: Info, label: "About" },
    ];

    return (
        <motion.nav 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="w-[80px] min-h-screen skeuo-sidebar flex flex-col items-center py-8 z-50 fixed left-0 top-0 overflow-y-auto"
        >
            {/* Brand Logo */}
            <div className="mb-12 cursor-pointer group flex flex-col items-center">
                <div className="relative w-11 h-11 rounded-xl bg-teal flex items-center justify-center shadow-[0_2px_6px_rgba(42,157,143,0.3),_inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform duration-300 group-hover:scale-105">
                    <Activity className="text-white w-6 h-6" />
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-grow flex flex-col gap-6 w-full">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `group flex flex-col items-center justify-center w-full relative transition-all duration-300 ${
                                isActive ? "text-teal" : "text-text-muted hover:text-text-primary"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                    isActive
                                        ? "bg-teal-light border border-teal/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06),_0_1px_0_rgba(255,255,255,0.8)]"
                                        : "hover:bg-skeuo-bg-deep"
                                }`}>
                                    <item.icon className="w-5 h-5 z-10" />
                                </div>
                                <span className={`text-[9px] font-semibold mt-1.5 transition-opacity duration-200 ${
                                    isActive ? "opacity-100 text-teal" : "opacity-0 group-hover:opacity-100 text-text-muted"
                                }`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeIndicator"
                                        className="absolute right-0 w-[3px] h-7 bg-teal rounded-l-full"
                                        style={{
                                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 0 4px rgba(42,157,143,0.2)"
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-6">
                {/* SOS Emergency Button */}
                <div className="relative group flex flex-col items-center">
                    <a href="tel:108" className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-danger/10 border border-danger/20 hover:bg-danger hover:border-danger hover:text-white text-danger transition-all duration-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),_0_2px_4px_rgba(212,107,107,0.2)]">
                        <AlertTriangle className="w-5 h-5 z-10" />
                    </a>
                    <span className="text-[9px] font-bold mt-1.5 text-danger opacity-100 transition-opacity duration-200">
                        108
                    </span>
                    <span className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full text-[9px] font-bold text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-danger border border-danger-dark px-2.5 py-1.5 rounded-lg shadow-md pointer-events-none z-50">
                        Emergency SOS
                    </span>
                </div>

                {/* Profile Button */}
                <div className="relative group">
                    <NavLink to="/profile" className="block p-1.5 rounded-full border border-border bg-skeuo-card hover:bg-skeuo-bg-deep transition-colors shadow-[0_2px_6px_rgba(0,0,0,0.06)]">
                    {isSignedIn ? (
                        <img 
                            src={user?.imageUrl} 
                            alt="Profile" 
                            className="w-9 h-9 rounded-full border border-border object-cover" 
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full border border-border bg-skeuo-bg-deep flex items-center justify-center">
                            <User size={16} className="text-teal" />
                        </div>
                    )}
                </NavLink>

                <span className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full text-[9px] font-semibold text-text-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-skeuo-card border border-border-light px-2 py-1 rounded-lg shadow-sm pointer-events-none">
                    Profile
                </span>
            </div>
            </div>
        </motion.nav>
    );
}
