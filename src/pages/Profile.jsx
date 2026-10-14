import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    User, Phone, MapPin, Droplet, ShieldPlus, Save, Loader2, CheckCircle2, 
    Briefcase, Users, HeartPulse, Stethoscope, Camera, Trash2, Plus, Edit2, X, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const token = localStorage.getItem('token');
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        name: user.name || "",
        contactNumber: "",
        address: "",
        bloodGroup: "",
        jobTitle: "",
        fatherName: "",
        motherName: "",
        healthBio: "",
        medicalHistory: "",
        height: "",
        weight: "",
        profilePicture: "",
        emergencyContacts: []
    });

    const [isEditing, setIsEditing] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', relation: '', contactNumber: '', bloodGroup: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const bloodGroups = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setFormData({ 
                        name: data.name || "",
                        contactNumber: data.contactNumber || "",
                        address: data.address || "",
                        bloodGroup: data.bloodGroup || "",
                        jobTitle: data.jobTitle || "",
                        fatherName: data.fatherName || "",
                        motherName: data.motherName || "",
                        healthBio: data.healthBio || "",
                        medicalHistory: data.medicalHistory || "",
                        height: data.height || "",
                        weight: data.weight || "",
                        profilePicture: data.profilePicture || "",
                        emergencyContacts: data.emergencyContacts || []
                    });
                }
            } catch (error) {
                console.error("Error loading user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth'; // Force full app reload to clear memory state
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 300;
                let scaleSize = 1;
                if (img.width > MAX_WIDTH) {
                    scaleSize = MAX_WIDTH / img.width;
                }
                canvas.width = img.width * scaleSize;
                canvas.height = img.height * scaleSize;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const base64Data = canvas.toDataURL('image/jpeg', 0.8);
                setFormData(prev => ({ ...prev, profilePicture: base64Data }));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const addEmergencyContact = () => {
        if(newContact.name && newContact.contactNumber) {
            setFormData(prev => ({ ...prev, emergencyContacts: [...prev.emergencyContacts, newContact] }));
            setNewContact({ name: '', relation: '', contactNumber: '', bloodGroup: '' });
        }
    };

    const removeEmergencyContact = (index) => {
        setFormData(prev => ({ ...prev, emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index) }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!token) return;

        setSaving(true);
        try {
            const res = await fetch('http://localhost:5000/api/user/profile', {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                setSaveSuccess(true);
                setIsEditing(false); // Switch back to view mode
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full flex-1 min-h-[50vh] bg-skeuo-bg flex items-center justify-center">
                <Loader2 className="animate-spin text-teal" size={40} />
            </div>
        );
    }

    return (
        <div className="w-full flex-1 bg-skeuo-bg text-text-primary p-4 md:p-8 pb-24 relative">
            
            {/* Success Popup Notification */}
            <AnimatePresence>
                {saveSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.95 }}
                        className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-skeuo-card border border-teal/20 shadow-[0_12px_40px_rgba(42,157,143,0.25)] rounded-2xl px-6 py-4 flex items-center gap-4"
                    >
                        <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="text-teal" size={24} />
                        </div>
                        <div className="pr-4">
                            <p className="font-bold text-text-primary text-sm">Profile Updated Successfully</p>
                            <p className="text-xs text-text-muted mt-0.5">Your changes have been saved securely.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                className="max-w-4xl mx-auto space-y-6"
            >
                {/* Header & Avatar */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-6">
                    <div>
                        <p className="text-[11px] font-semibold text-teal uppercase tracking-wider mb-1.5">Patient Information</p>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-serif font-bold text-text-primary">My Profile</h1>
                            {!isEditing && (
                                <>
                                    <button 
                                        onClick={() => setIsEditing(true)} 
                                        className="px-3 py-1.5 bg-border/40 hover:bg-border/60 text-text-secondary text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                        <Edit2 size={12} /> Edit
                                    </button>
                                    <button 
                                        onClick={handleLogout} 
                                        className="px-3 py-1.5 bg-danger/10 hover:bg-danger/20 text-danger text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                        <LogOut size={12} /> Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-text-primary">{formData.name || "Set your name"}</p>
                            <p className="text-xs text-text-muted">{user.email}</p>
                        </div>
                        <div 
                            className={`relative w-20 h-20 rounded-2xl border-2 border-border overflow-hidden bg-skeuo-card shadow-[0_2px_8px_rgba(0,0,0,0.08)] ${isEditing ? 'cursor-pointer group' : ''} flex items-center justify-center`}
                            onClick={() => isEditing && fileInputRef.current?.click()}
                        >
                            {formData.profilePicture ? (
                                <img src={formData.profilePicture} className={`w-full h-full object-cover ${isEditing ? 'transition-transform duration-300 group-hover:scale-110' : ''}`} alt="Avatar" />
                            ) : (
                                <User className="text-text-muted/50" size={32} />
                            )}
                            
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="text-white" size={24} />
                                </div>
                            )}
                            
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageUpload} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    
                    {/* Primary Details */}
                    <div className="skeuo-card p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-teal rounded-r-full" />
                        <h3 className="flex items-center gap-3 text-base font-bold mb-5 text-text-primary">
                            <User className="text-teal" size={18} /> Personal Details
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField label="Full Name" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" isEditing={isEditing} />
                            <InputField label="Mobile Number" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="+1 555-0192" icon={<Phone size={13} />} isEditing={isEditing} />
                            
                            <div className="md:col-span-2">
                                <InputField label="Address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Full street address..." icon={<MapPin size={13} />} isEditing={isEditing} />
                            </div>
                            
                            <InputField label="Job Title / Occupation" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} placeholder="Software Engineer" icon={<Briefcase size={13} />} isEditing={isEditing} />
                            
                            <SelectField label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} options={bloodGroups} icon={<Droplet size={13} className="text-danger" />} isEditing={isEditing} />
                        </div>
                    </div>

                    {/* Family Details */}
                    <div className="skeuo-card p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-r-full" />
                        <h3 className="flex items-center gap-3 text-base font-bold mb-5 text-text-primary">
                            <Users className="text-blue-500" size={18} /> Family Details
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleInputChange} placeholder="Father's Full Name" isEditing={isEditing} />
                            <InputField label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleInputChange} placeholder="Mother's Full Name" isEditing={isEditing} />
                        </div>
                    </div>

                    {/* Health Profile */}
                    <div className="skeuo-card p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-r-full" />
                        <h3 className="flex items-center gap-3 text-base font-bold mb-5 text-text-primary">
                            <HeartPulse className="text-purple-500" size={18} /> Health Profile
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <InputField 
                                label="Height (cm/ft)" 
                                name="height" 
                                value={formData.height} 
                                onChange={handleInputChange} 
                                placeholder="e.g. 175 cm" 
                                isEditing={isEditing} 
                            />
                            <InputField 
                                label="Weight (kg/lbs)" 
                                name="weight" 
                                value={formData.weight} 
                                onChange={handleInputChange} 
                                placeholder="e.g. 70 kg" 
                                isEditing={isEditing} 
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-5">
                            <TextAreaField 
                                label="Health Bio (Quick Overview)" 
                                name="healthBio" 
                                value={formData.healthBio} 
                                onChange={handleInputChange} 
                                placeholder="I am generally healthy, but I occasionally experience mild allergies during spring..." 
                                isEditing={isEditing}
                            />
                            <TextAreaField 
                                label="Medical History / Chronic Conditions" 
                                name="medicalHistory" 
                                value={formData.medicalHistory} 
                                onChange={handleInputChange} 
                                placeholder="Asthma (diagnosed 2010), Hypertension, Past surgeries..." 
                                icon={<Stethoscope size={13} />} 
                                isEditing={isEditing}
                            />
                        </div>
                    </div>

                    {/* Emergency Contacts */}
                    <div className="skeuo-card p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-terracotta rounded-r-full" />
                        <h3 className="flex items-center gap-3 text-base font-bold mb-5 text-terracotta">
                            <ShieldPlus className="text-terracotta" size={18} /> Emergency Contacts
                        </h3>
                        
                        <div className="space-y-4">
                            {/* List Contacts */}
                            {formData.emergencyContacts.length === 0 && !isEditing ? (
                                <p className="text-sm text-text-muted italic bg-skeuo-bg/50 p-4 rounded-xl border border-transparent">No emergency contacts saved.</p>
                            ) : (
                                <AnimatePresence>
                                    {formData.emergencyContacts.map((contact, idx) => (
                                        <motion.div 
                                            key={idx}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center justify-between p-4 bg-skeuo-bg border border-border rounded-xl"
                                        >
                                            <div>
                                                <p className="font-bold text-sm text-text-primary">{contact.name} <span className="text-text-muted font-normal text-xs ml-2">({contact.relation})</span></p>
                                                <p className="text-xs text-text-muted flex items-center gap-2 mt-1">
                                                    <Phone size={10} /> {contact.contactNumber}
                                                    {contact.bloodGroup && <><span className="mx-1">•</span><Droplet size={10} className="text-danger" /> {contact.bloodGroup}</>}
                                                </p>
                                            </div>
                                            {isEditing && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeEmergencyContact(idx)}
                                                    className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}

                            {/* Add Contact Form (Only in Edit Mode) */}
                            <AnimatePresence>
                                {isEditing && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-5 bg-border/20 rounded-xl border border-border border-dashed mt-4 overflow-hidden"
                                    >
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Add New Contact</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                            <input 
                                                type="text" placeholder="Name" 
                                                value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})}
                                                className="skeuo-input py-2 text-sm"
                                            />
                                            <input 
                                                type="text" placeholder="Relation" 
                                                value={newContact.relation} onChange={e => setNewContact({...newContact, relation: e.target.value})}
                                                className="skeuo-input py-2 text-sm"
                                            />
                                            <input 
                                                type="text" placeholder="Phone" 
                                                value={newContact.contactNumber} onChange={e => setNewContact({...newContact, contactNumber: e.target.value})}
                                                className="skeuo-input py-2 text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <select 
                                                    value={newContact.bloodGroup} onChange={e => setNewContact({...newContact, bloodGroup: e.target.value})}
                                                    className="skeuo-input py-2 text-sm w-full"
                                                >
                                                    <option value="" disabled>Blood</option>
                                                    {bloodGroups.filter(Boolean).map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                                </select>
                                                <button 
                                                    type="button" 
                                                    onClick={addEmergencyContact}
                                                    disabled={!newContact.name || !newContact.contactNumber}
                                                    className="bg-terracotta text-white p-2 rounded-lg disabled:opacity-50 hover:bg-[#c95c47] transition-colors flex items-center justify-center shrink-0"
                                                >
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <AnimatePresence>
                        {isEditing && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="flex justify-end pt-4 sticky bottom-6 z-10 gap-3"
                            >
                                <button 
                                    type="button" 
                                    disabled={saving}
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Reset form data? Could do, but skipping for simplicity
                                    }}
                                    className="py-4 px-6 rounded-2xl font-bold tracking-wider text-sm text-text-secondary bg-skeuo-card border border-border hover:bg-border/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="py-4 px-10 rounded-2xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-all shadow-lg bg-gradient-to-b from-teal to-[#1A7065] text-white border border-[#145C53] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),_0_6px_16px_rgba(42,157,143,0.3)] hover:from-[#35A597] hover:to-[#1D7E72] disabled:opacity-70"
                                >
                                    {saving ? (
                                        <><Loader2 size={18} className="animate-spin" /> Saving...</>
                                    ) : (
                                        <><Save size={18} /> Save Changes</>
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </form>
            </motion.div>
        </div>
    );
}

/* Helper UI Components */
function InputField({ label, name, value, onChange, placeholder, icon, isEditing }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                {icon} {label}
            </label>
            {isEditing ? (
                <input 
                    type="text" 
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="skeuo-input"
                />
            ) : (
                <p className="py-3 px-4 bg-skeuo-bg/30 border border-transparent rounded-xl text-text-primary text-sm min-h-[46px] flex items-center">
                    {value || <span className="text-text-muted/60 italic text-xs font-medium">Not provided</span>}
                </p>
            )}
        </div>
    );
}

function TextAreaField({ label, name, value, onChange, placeholder, icon, isEditing }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                {icon} {label}
            </label>
            {isEditing ? (
                <textarea 
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    rows={3}
                    className="skeuo-input resize-y min-h-[100px]"
                />
            ) : (
                <p className="py-3 px-4 bg-skeuo-bg/30 border border-transparent rounded-xl text-text-primary text-sm min-h-[100px] whitespace-pre-wrap">
                    {value || <span className="text-text-muted/60 italic text-xs font-medium">Not provided</span>}
                </p>
            )}
        </div>
    );
}

function SelectField({ label, name, value, onChange, options, icon, isEditing }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                {icon} {label}
            </label>
            {isEditing ? (
                <select 
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="skeuo-input appearance-none cursor-pointer"
                >
                    <option value="" disabled>Select Blood Type</option>
                    {options.filter(Boolean).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            ) : (
                <p className="py-3 px-4 bg-skeuo-bg/30 border border-transparent rounded-xl text-text-primary text-sm min-h-[46px] flex items-center">
                    {value || <span className="text-text-muted/60 italic text-xs font-medium">Not provided</span>}
                </p>
            )}
        </div>
    );
}
