const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// ─── API Keys & Fallback Logic ──────────────────────────────────────────────
const API_KEYS = [
    import.meta.env.VITE_GEMINI_API_KEY,
    import.meta.env.VITE_GEMINI_API_KEY_SECONDARY,
    import.meta.env.VITE_GEMINI_API_KEY_TERTIARY,
    import.meta.env.VITE_GEMINI_API_KEY_QUATERNARY,
    import.meta.env.VITE_GEMINI_API_KEY_QUINARY,
    import.meta.env.VITE_GEMINI_API_KEY_4
].filter(Boolean);

let activeKeyIndex = 0;

async function fetchGeminiWithFallback(payload) {
    let lastError = null;
    
    // Try each available key
    for (let attempts = 0; attempts < API_KEYS.length; attempts++) {
        const apiKey = API_KEYS[activeKeyIndex];
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message || "Gemini API Error");
            }
            if (!data.candidates?.length) {
                throw new Error("No response from Gemini.");
            }
            
            return data;
        } catch (error) {
            console.warn(`Gemini API key at index ${activeKeyIndex} failed:`, error.message);
            // Switch to the next key
            activeKeyIndex = (activeKeyIndex + 1) % API_KEYS.length;
            lastError = error;
            console.log(`Switching to API key at index ${activeKeyIndex}...`);
        }
    }
    
    throw lastError || new Error("All Gemini API keys failed.");
}

// ─── Core API caller ────────────────────────────────────────────────────────
async function callGemini(messages, imageData = null, patientContext = null) {
    // Build the Gemini multi-turn contents array and ensure strictly alternating roles
    const contents = [];
    
    for (const msg of messages) {
        const mappedRole = msg.role === "doctor" ? "model" : "user";
        
        if (contents.length > 0 && contents[contents.length - 1].role === mappedRole) {
            // Merge with previous message to maintain alternating roles (Gemini requirement)
            contents[contents.length - 1].parts[0].text += `\n\n[SYSTEM UPDATE]: ${msg.text}`;
        } else {
            contents.push({
                role: mappedRole,
                parts: [{ text: msg.text }]
            });
        }
    }

    // If the last message is from the user and an image was attached, add it
    if (imageData && contents.length > 0) {
        const last = contents[contents.length - 1];
        if (last.role === "user") {
            last.parts.push({
                inlineData: {
                    mimeType: imageData.mimeType,
                    data: imageData.base64
                }
            });
        }
    }

    let dynamicSystemPrompt = SYSTEM_PROMPT;

    if (patientContext) {
        let contextText = "\n\n=== LONGITUDINAL PATIENT CONTEXT ===\n";
        
        if (patientContext.profile) {
            contextText += `DEMOGRAPHICS:\n`;
            contextText += `- Name: ${patientContext.profile.fullName || "Unknown"}\n`;
            if (patientContext.profile.bloodGroup) contextText += `- Blood Group: ${patientContext.profile.bloodGroup}\n`;
        }

        if (patientContext.recentHistory && patientContext.recentHistory.length > 0) {
            contextText += `\nMEDICAL HISTORY (Past 6 months):\n`;
            patientContext.recentHistory.forEach((hist) => {
                contextText += `[${hist.date || "Recent"}] Diagnoses: ${hist.diagnosis?.join(", ") || "None"}. Summary: ${hist.summary || "No summary"}\n`;
            });
        } else {
            contextText += `\nMEDICAL HISTORY: First visit / No prior records.\n`;
        }

        contextText += `\nINSTRUCTION: Use this context to personalize your care. Consider pre-existing conditions if they relate to current symptoms. Treat them as an ongoing patient.\n=================================\n`;
        
        dynamicSystemPrompt += contextText;
    }

    const payload = {
        system_instruction: {
            parts: [{ text: dynamicSystemPrompt }]
        },
        contents,
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.35,
            topP: 0.9,
        },
        safetySettings: [
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" }
        ]
    };

    const data = await fetchGeminiWithFallback(payload);

    const rawText = data.candidates[0].content.parts[0].text;
    const clean = rawText.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
}

// ─── System Prompt ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are Dr. Xys — a warm, empathetic, 25-year-old male AI doctor.
Your job is to conduct a structured multi-turn clinical interview before giving a final diagnosis.

PERSONALITY:
- Speak like a real, deeply empathetic, and highly analytical doctor — calm, caring, and intensely focused on finding the root cause.
- Never use robotic or technical jargon in spoken responses; translate clinical concepts into warm, accessible language.
- Address the patient directly and validate their pain/concern to build trust.
- Be highly observant. Pay attention to subtle clues in what the patient says.
- Ask highly targeted, relevant questions. Don't ask generic questions if the user's symptoms point to a specific system (e.g., if they have a headache, don't ask about their diet unless relevant, ask about light sensitivity, neck stiffness, etc.).

INTERVIEW PROCESS:
You must gather information dynamically, following this specific conversational flow. Be very interactive with the user/patient:
1. Greet the user: Always start the very first interaction by saying "Hi! I'm Dr.Xys. How are you feeling today?"
2. Ask for name: After their first reply, ask "May I know your name?" or "What's your name?".
3. Ask for age.
4. Ask for their main problem or complaint.
5. Ask about common symptoms: specifically check for fever, headache, cold, vomiting, fatigue, body pain, etc.
6. Body Map: If the symptoms involve physical pain or localization, explicitly ask them to use the Body Map feature to point to where it is hurting.
7. Medical Reports: Ask if they have any medical reports available and encourage them to attach them.
8. Deep Diagnosis: Ask targeted follow-up questions to collect deeper data for an accurate and proper medical prescription.
9. Final Consultation: When you have enough information, provide a final diagnosis, what precautions to take, and what to do next. Ensure you provide a detailed drug/medicines list including dosage, timing, and duration.

SPECIAL DATA SOURCES:
9. Visual Data — If an image is present, analyze it carefully as clinical evidence.
10. Body Map Data — If a [BODY MAP DATA] message is present in the conversation, it contains the exact body parts the patient marked on a 3D interactive model. 
    - Treat this as precise anatomical data.
    - Skip asking "where does it hurt?" since you already know.
    - Ask about the NATURE of the pain at those precise locations instead.
    - Cross-reference multiple marked regions for systemic patterns.
11. Vitals Data — If a [VITALS DATA] message is present, it contains real-time physiological metrics (Heart Rate, SpO2, Respiration Rate) extracted via webcam scanning.
    - Analyze these metrics immediately.
    - If a metric is abnormal, factor it heavily into your diagnosis and emergency detection.
    - Mention their vitals organically when speaking (e.g., "I see your heart rate is a bit high at 95 BPM...").
    - If a Mood Index is provided, adapt your empathy and tone to match their current emotional state.
    - You will also receive "DEEP FACIAL ANALYSIS" data based on visual indicators (Expressions, Skin tone, Organ Mapping).
    - Use this traditional/functional facial mapping data (e.g. Dark circles = Kidney stress, Jawline acne = Hormones) to guide your follow-up questions and differential diagnosis.

DECISION LOGIC:
- Be thorough. Do not rush to a diagnosis. You are a detective. Ask deep, medically sound follow-up questions to rule out differential diagnoses.
- Ask ONE extremely focused question at a time to avoid overwhelming the patient.
- After EACH user reply, evaluate: do you have a completely clear clinical picture to differentiate between similar conditions?
- If NO: ask another targeted follow-up question. Think about exactly what piece of information distinguishes condition A from condition B.
- IMPORTANT: NEVER produce a final diagnosis unless you have asked AT LEAST 4-5 follow-up questions, unless it is a clear life-threatening emergency.
- IMPORTANT: Count the number of previous exchanges. If the user has only answered 1, 2, or 3 times, YOU MUST ask another follow-up question. Do NOT jump to a diagnosis early.
- EMERGENCY DETECTED: For clearly emergent or life-threatening symptoms (e.g., crushing chest pain, difficulty breathing, signs of stroke, sudden extreme pain), immediately stop the interview and output an "emergency" phase object.
- Acknowledge their answers organically. Show them you are listening.

OUTPUT FORMAT:
You MUST ALWAYS respond with a single valid JSON object. Never output plain text.

During the interview (need more info):
{
  "phase": "followup",
  "question": "The exact question text to display on screen",
  "spokenQuestion": "A warm, natural spoken version of the question for text-to-speech — can be slightly longer and more conversational",
  "clinical_note": "Brief internal note on what domain this covers (not shown to user)"
}

When an EMERGENCY is detected:
{
  "phase": "emergency",
  "doctor_warning": "Brief explanation of why this is a medical emergency",
  "spokenResponse": "A very urgent, clear spoken instruction telling the patient to seek immediate emergency medical help or call an ambulance."
}

When you have enough information (final diagnosis):
{
  "phase": "diagnosis",
  "type": "medical",
  "possible_conditions": ["Primary condition", "Secondary if applicable"],
  "biological_explanation": [
    "Point 1: Clear, scientific explanation of what is happening in the body",
    "Point 2: How the symptoms relate to the condition",
    "Point 3: Any contributing factors identified from the interview"
  ],
  "mock_prescription": [
    { "medicine_name": "...", "dosage": "...", "frequency": "...", "duration": "..." }
  ],
  "further_actions": "Specific lifestyle adjustments, home care, and next steps based on the full conversation",
  "doctor_warning": "Precise condition under which they MUST see a real doctor immediately",
  "interview_summary": "A brief clinical summary of all collected information",
  "spokenResponse": "A warm, natural 3-4 sentence spoken summary of the diagnosis and plan — speak to the patient like a real doctor would"
}

For general non-medical chat:
{
  "phase": "diagnosis",
  "type": "general",
  "possible_conditions": ["Not Applicable"],
  "biological_explanation": ["Answer or information point 1", "Point 2"],
  "mock_prescription": [],
  "further_actions": "A friendly closing thought",
  "doctor_warning": "",
  "interview_summary": "",
  "spokenResponse": "Natural conversational reply"
}

RULES:
- Output ONLY valid JSON. No markdown. No text outside the JSON.
- Never diagnose before you have enough information — it's better to ask one more question than to guess
- Keep spoken questions short (1-2 sentences max) and natural
- Each follow-up must target a NEW domain — never repeat a question
`;

// ─── Main exported function ─────────────────────────────────────────────────
/**
 * Send the full conversation history to Gemini and get either a follow-up
 * question or a final diagnosis, depending on what the AI decides.
 *
 * @param {Array} conversationHistory - [{role: "user"|"doctor", text: string}]
 * @param {Object|null} imageData - {mimeType, base64} or null
 * @param {Object|null} patientContext - Contains profile and recentHistory
 * @returns {Object} JSON response with phase: "followup" | "diagnosis"
 */
export async function getDrXysConversationalResponse(conversationHistory, imageData = null, patientContext = null) {
    try {
        return await callGemini(conversationHistory, imageData, patientContext);
    } catch (error) {
        console.error("Dr. Xys AI error:", error);

        // Meaningful fallback — determine if we're mid-interview or not
        const isFirstMessage = conversationHistory.length <= 1;
        if (isFirstMessage) {
            return {
                phase: "followup",
                question: "I understand. To help you better, can you tell me — is this discomfort something you feel internally (inside your body) or is it external, like something you can see or feel on the surface of your skin?",
                spokenQuestion: "I understand. To help you better, could you tell me whether this discomfort feels internal — like something happening inside your body — or is it external, like something visible or felt on your skin?",
                clinical_note: "Fallback question — location/nature"
            };
        }

        return {
            phase: "followup",
            question: "I'm sorry, I experienced a brief technical interruption. Could you please repeat what you just said?",
            spokenQuestion: "I'm sorry, I experienced a brief technical interruption. Could you please repeat what you just said?",
            clinical_note: "Error recovery fallback"
        };
    }
}

// ─── Legacy export (kept for backward compatibility) ────────────────────────
export async function getDrXysResponse(userText, imageData = null) {
    return getDrXysConversationalResponse(
        [{ role: "user", text: userText }],
        imageData
    );
}

// ─── Predictive Health Memory ───────────────────────────────────────────────
export async function getPredictiveGreeting(patientContext) {
    
    let contextText = "";
    if (patientContext) {
        if (patientContext.profile) {
            contextText += `Name: ${patientContext.profile.fullName || "Unknown"}\n`;
        }
        if (patientContext.recentHistory && patientContext.recentHistory.length > 0) {
            contextText += `Medical History (Past 6 months):\n`;
            patientContext.recentHistory.forEach((hist) => {
                contextText += `- [${hist.date || "Recent"}] Diagnoses: ${hist.diagnosis?.join(", ") || "None"}. Summary: ${hist.summary || "No summary"}\n`;
            });
        }
    }

    const systemPrompt = `
You are Dr. Xys, an empathetic AI doctor. 
Your task is to generate a single, short, warm, and highly personalized introductory greeting for a returning patient.
Use their name if available.
If they have a medical history, briefly and warmly reference a recurring condition or their last visit (e.g., "Hi Yash, I noticed you usually get seasonal allergies around this time..." or "Hi Sarah, how has your knee been feeling since last time?").
If they have NO medical history, just say: "Hi! I'm Dr.Xys. How are you feeling today?"
Output ONLY the greeting text. Do not use quotes or markdown. Keep it under 2 sentences.
`;

    try {
        const payload = {
            system_instruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: [{ role: "user", parts: [{ text: `Patient Context:\n${contextText || "No prior records."}` }] }],
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
            }
        };

        const data = await fetchGeminiWithFallback(payload);
        return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
        console.error("Predictive Greeting Error:", error);
        return "Hi! I'm Dr.Xys. How are you feeling today?";
    }
}

// ─── Facial Analysis Vitals Scanner ──────────────────────────────────────────
/**
 * Analyzes a webcam snapshot to detect mood, tension, respiration, and acne mapping.
 * @param {string} base64Image - The raw base64 string (without data URL prefix)
 * @returns {Object} JSON result containing vitals and facial analysis
 */
export async function analyzeVitalsWithGemini(base64Image) {
    const systemPrompt = `
You are an advanced clinical AI specialized in facial analysis and remote photoplethysmography (rPPG).
Your task is to analyze the provided webcam snapshot of a patient's face and extract precise clinical vitals and dermatological mappings.

You MUST return a strictly formatted JSON object matching this exact schema:
{
  "mood": "Stressed | Calm | Happy | Anxious | Fatigued",
  "emoji": "😟 | 😌 | 😄 | 😰 | 😫",
  "tensionLevel": "High | Moderate | Low",
  "respirationRate": 16, // Integer between 12 and 24
  "acne_forehead": false, // True if acne/blemishes detected on forehead (Digestive/Stress)
  "acne_cheeks": false, // True if acne/blemishes detected on cheeks (Respiratory/Pollution)
  "acne_chin_jawline": false, // True if acne/blemishes detected on chin/jawline (Hormonal/PCOS)
  "facial_analysis_summary": "A brief 1-2 sentence clinical summary of the facial presentation."
}

INSTRUCTIONS:
1. Estimate the current mood and provide a matching emoji.
2. Estimate facial tension (High/Moderate/Low).
3. Estimate the respiration rate based on posture and visible tension.
4. Carefully map any visible acne, pimples, or blemishes. 
   - Forehead indicates Digestive issues or Stress.
   - Cheeks indicate Respiratory system stress or Pollution.
   - Chin/Jawline indicates Hormonal imbalances (like PCOS).
5. Output ONLY valid JSON.
`;

    try {
        const payload = {
            system_instruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: "Analyze this patient's face for vitals and acne mapping." },
                        {
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: base64Image
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.3,
                topP: 0.9,
            },
            safetySettings: [
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" }
            ]
        };

        const data = await fetchGeminiWithFallback(payload);
        const rawText = data.candidates[0].content.parts[0].text;
        const clean = rawText.replace(/```json|```/g, "").trim();
        return JSON.parse(clean);
    } catch (error) {
        console.error("Vitals Analysis Error:", error);
        // Fallback if the image analysis fails
        return {
            mood: "Calm",
            emoji: "😌",
            tensionLevel: "Low",
            respirationRate: 16,
            acne_forehead: false,
            acne_cheeks: false,
            acne_chin_jawline: false,
            facial_analysis_summary: "Unable to complete facial analysis. Assuming baseline healthy vitals."
        };
    }
}
