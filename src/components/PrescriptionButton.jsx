import { PDFDownloadLink } from "@react-pdf/renderer";
import PrescriptionPDF from "./PrescriptionPDF";

import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";

export default function PrescriptionButton({ aiResponse }) {
    // Fetch real user from localStorage instead of mock
    const user = JSON.parse(localStorage.getItem('user')) || { name: "Patient", email: "N/A" };
    const [saving, setSaving] = useState(false);

    const pdfProps = {
        user: { displayName: user.name, email: user.email },
        aiResponse,
        date: new Date().toLocaleDateString()
    };

    return (
        <div className="w-full mt-4">
            <PDFDownloadLink
                document={<PrescriptionPDF {...pdfProps} />}
                fileName={`DrXys_Prescription_${Date.now()}.pdf`}
                className="w-full py-4 skeuo-btn flex items-center justify-center gap-2 uppercase tracking-widest text-[11px] block text-center"
                style={{ textDecoration: 'none' }}
            >
                {({ loading, error }) => (
                    <>
                        {loading || saving ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <FileDown size={18} />
                        )}
                        <span>{loading ? 'Generating PDF...' : 'Download PDF Report'}</span>
                    </>
                )}
            </PDFDownloadLink>
        </div>
    );
}
