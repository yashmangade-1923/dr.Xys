import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";

// Define styles
const styles = StyleSheet.create({
    page: { padding: 40, backgroundColor: "#ffffff" },
    header: { marginBottom: 30, borderBottom: 2, borderBottomColor: "#3b82f6", paddingBottom: 10 },
    title: { fontSize: 28, fontWeight: "bold", color: "#1e3a8a", marginBottom: 5 },
    subtitle: { fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#1e293b", marginBottom: 8, textTransform: "uppercase" },
    patientInfo: { flexDirection: "row", marginBottom: 20, backgroundColor: "#f8fafc", padding: 15, borderRadius: 8 },
    infoBlock: { flex: 1 },
    label: { fontSize: 8, color: "#64748b", marginBottom: 2 },
    value: { fontSize: 11, fontWeight: "bold", color: "#0f172a" },
    text: { fontSize: 11, color: "#334155", lineHeight: 1.6 },
    bullet: { marginBottom: 5, flexDirection: "row" },
    bulletDot: { width: 4, height: 4, backgroundColor: "#3b82f6", borderRadius: 2, marginTop: 6, marginRight: 8 },
    footer: { position: "absolute", bottom: 40, left: 40, right: 40, borderTop: 1, borderTopColor: "#e2e8f0", paddingTop: 10, textAlign: "center" },
    footerText: { fontSize: 8, color: "#94a3b8" }
});

export default function PrescriptionPDF({ user, date, aiResponse }) {
    if (!aiResponse) return null;

    const conditions = aiResponse.possible_conditions || [];
    const explanations = aiResponse.biological_explanation || [];
    const prescriptions = aiResponse.mock_prescription || [];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Dr. Xys</Text>
                    <Text style={styles.subtitle}>AI-Powered Health Diagnostic Report</Text>
                </View>

                {/* Patient Details */}
                <View style={styles.patientInfo}>
                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>PATIENT NAME</Text>
                        <Text style={styles.value}>{user?.displayName || user?.fullName || "N/A"}</Text>
                    </View>
                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>EMAIL</Text>
                        <Text style={styles.value}>{user?.email || "N/A"}</Text>
                    </View>
                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>DATE</Text>
                        <Text style={styles.value}>{date}</Text>
                    </View>
                </View>

                {/* Possible Conditions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preliminary Deep Diagnosis</Text>
                    <Text style={styles.text}>{conditions.join(", ") || "Unknown Condition"}</Text>
                </View>

                {/* Biological Explanation */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Biological Pathophysiology</Text>
                    {explanations.map((exp, i) => (
                        <View key={`exp-${i}`} style={styles.bullet}>
                            <View style={styles.bulletDot} />
                            <Text style={styles.text}>{exp}</Text>
                        </View>
                    ))}
                </View>

                {/* Prescriptions */}
                {prescriptions.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mock Prescription Protocol</Text>
                        {prescriptions.map((med, i) => (
                            <View key={`med-${i}`} style={{ marginBottom: 10, padding: 8, backgroundColor: "#f8fafc" }}>
                                <Text style={{ fontSize: 12, fontWeight: "bold", color: "#0f172a" }}>{med.medicine_name}</Text>
                                <Text style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>Dosage: {med.dosage} | Freq: {med.frequency}</Text>
                                <Text style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>Duration: {med.duration}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Further Actions */}
                {aiResponse.further_actions && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Further Actions / Lifestyle</Text>
                        <Text style={styles.text}>{aiResponse.further_actions}</Text>
                    </View>
                )}

                {/* Warning */}
                <View style={[styles.section, { marginTop: 40, padding: 10, border: 1, borderColor: "#fee2e2", backgroundColor: "#fef2f2" }]}>
                    <Text style={{ fontSize: 9, color: "#dc2626", fontWeight: "bold" }}>MEDICAL DISCLAIMER:</Text>
                    <Text style={{ fontSize: 8, color: "#991b1b", marginTop: 4 }}>
                        This assistant is for informational purposes only and does not constitute medical advice, diagnosis, or treatment.
                        Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition.
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Certified Digital Document Generated by Project XYS v1.9</Text>
                </View>
            </Page>
        </Document>
    );
}
