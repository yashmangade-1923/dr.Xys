import { useState } from "react";
import { motion } from "framer-motion";
import { Instagram, Phone, Star, Activity, Mail } from "lucide-react";

export default function Footer() {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const submitRating = async (starValue) => {
        if (submitting) return;
        setRating(starValue);
        setSubmitting(true);
        
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            await fetch('http://localhost:5000/api/ratings', {
                method: 'POST',
                headers,
                body: JSON.stringify({ rating: starValue })
            });
        } catch (error) {
            console.error("Failed to submit rating:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const contacts = [
        { icon: Instagram, label: "@dr.xys_1923", link: "https://instagram.com/dr.xys_1923" },
        { icon: Phone, label: "8766413211", link: "tel:8766413211" },
        { icon: Mail, label: "yashmangade1923@gmail.com", link: "mailto:yashmangade1923@gmail.com" },
    ];

    return (
        <footer className="bg-skeuo-bg-deep border-t border-border pt-14 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 mb-10">
                {/* Contact Info */}
                <div className="space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center text-white shadow-[0_2px_6px_rgba(42,157,143,0.25),_inset_0_1px_0_rgba(255,255,255,0.2)]">
                            <Activity size={20} />
                        </div>
                        <span className="text-xl font-serif font-bold text-text-primary">Dr. Xys</span>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
                        Providing advanced health tech solutions. Connect with us for support or more information.
                    </p>
                    <div className="space-y-3">
                        {contacts.map((contact, i) => (
                            <a
                                key={i}
                                href={contact.link}
                                className="flex items-center gap-3 text-text-secondary hover:text-teal transition-colors text-sm"
                            >
                                <contact.icon size={18} />
                                <span>{contact.label}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="skeuo-card p-8">
                    <h3 className="text-lg font-serif font-bold text-text-primary mb-1">Rate your experience</h3>
                    <p className="text-text-muted mb-5 text-sm">We value your feedback to improve Dr. Xys</p>

                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                                key={star}
                                whileTap={{ scale: 0.85 }}
                                onClick={() => submitRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                className="relative p-1 cursor-pointer"
                            >
                                <Star
                                    size={28}
                                    className={`${star <= (hover || rating)
                                        ? "fill-warning text-warning"
                                        : "text-border"
                                        } transition-colors duration-200`}
                                />
                                {rating === star && (
                                    <motion.div
                                        layoutId="star-aura"
                                        className="absolute inset-0 bg-warning/15 blur-lg rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <motion.p
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 text-teal font-semibold text-sm"
                        >
                            Thank you for the {rating}-star rating!
                        </motion.p>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 border-t border-border pt-6 text-center text-text-muted text-xs">
                &copy; {new Date().getFullYear()} Dr. Xys. All rights reserved.
            </div>
        </footer>
    );
}
