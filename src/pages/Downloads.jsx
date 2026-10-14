import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PrescriptionPDF from "../components/PrescriptionPDF";
import { FileText, Download, Loader2, Calendar, ShieldPlus, LogIn } from "lucide-react";


export default function Downloads() {
    const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const token = localStorage.getItem('token');
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrescriptions = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('http://localhost:5000/api/consultations', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const docs = await res.json();
                    const mappedDocs = (docs || []).map(doc => {
                        const aiResp = doc.diagnosis || {};
                        const conditionStr = aiResp.possible_conditions?.join(', ') || 'General Consultation';
                        return {
                            id: doc._id,
                            diagnosis: conditionStr,
                            dateLabel: new Date(doc.createdAt).toLocaleDateString(),
                            aiResponse: aiResp,
                            remedies: aiResp.biological_explanation || []
                        }
                    });
                    setPrescriptions(mappedDocs);
                }
            } catch (error) {
                console.error("Error fetching prescriptions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrescriptions();
    }, [token]);



    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="mb-8">
                <p className="text-[11px] font-semibold text-teal uppercase tracking-wider mb-1.5">Medical Records</p>
                <h1 className="text-3xl font-serif font-bold text-text-primary mb-1">My Reports</h1>
                <p className="text-text-muted text-sm">Access and download your medical reports and prescriptions.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-teal" size={36} />
                </div>
            ) : prescriptions.length > 0 ? (
                <div className="grid gap-3">
                    {prescriptions.map((p) => (
                        <div key={p.id} className="skeuo-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-teal-light rounded-xl flex items-center justify-center text-teal shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-text-primary">{p.diagnosis}</h3>
                                    <div className="flex items-center gap-4 text-sm text-text-muted mt-0.5">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={13} />
                                            {p.dateLabel || "Recent"}
                                        </span>
                                        <span className="px-2 py-0.5 bg-skeuo-inset rounded-md text-[10px] uppercase font-semibold text-text-muted tracking-wide border border-border-light">
                                            PDF
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <PDFDownloadLink
                                document={
                                    <PrescriptionPDF
                                        user={{ displayName: user.name, email: user.email }}
                                        aiResponse={p.aiResponse || {
                                            possible_conditions: [p.diagnosis],
                                            biological_explanation: p.remedies || [],
                                            mock_prescription: [],
                                        }}
                                        date={p.dateLabel}
                                    />
                                }
                                fileName={`DrXys_Prescription_${p.id}.pdf`}
                            >
                                {({ loading }) => (
                                    <button className="skeuo-btn px-5 py-2.5 flex items-center gap-2 text-sm">
                                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                                        Download
                                    </button>
                                )}
                            </PDFDownloadLink>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 skeuo-card border-2 border-dashed border-border">
                    <div className="w-16 h-16 bg-skeuo-bg-deep rounded-2xl flex items-center justify-center mx-auto mb-5 text-text-muted border border-border-light">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-text-primary mb-2">No reports yet</h3>
                    <p className="text-text-muted text-sm max-w-xs mx-auto">
                        Once Dr. Xys generates a diagnosis for you, it will appear here for download.
                    </p>
                </div>
            )}
        </div>
    );
}
