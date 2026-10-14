import { useState, useCallback, useRef, useEffect } from "react";
import { getDrXysConversationalResponse, getPredictiveGreeting } from "../services/gemini";



// ─── Phases ─────────────────────────────────────────────────────────────────
// "idle"        → No consultation active
// "listening"   → Mic is open, waiting for patient speech
// "processing"  → Calling Gemini API
// "speaking"    → Doctor TTS is playing
// "interviewing"→ Mid-interview (doctor has asked ≥1 follow-up)
// "done"        → Final diagnosis received

export function useVoiceInteraction() {
    // ── Core state ───────────────────────────────────────────────────────────
    const [phase, setPhase] = useState("idle");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);

    // ── Conversation ─────────────────────────────────────────────────────────
    const [conversationHistory, setConversationHistory] = useState([]);
    const historyRef = useRef([]);
    const speakTokenRef = useRef(0);
    // {role: "user"|"doctor", text: string, timestamp: Date, isQuestion?: bool}

    const [currentQuestion, setCurrentQuestion] = useState(null); // doctor's current Q
    const [aiResponse, setAiResponse] = useState(null);           // final diagnosis
    const [questionCount, setQuestionCount] = useState(0);

    // ── Body Map Data ────────────────────────────────────────────────────────
    const [bodyMapData, setBodyMapData] = useState(null);
    // Array of { partId, label, level } e.g. [{ partId: "head", label: "Head", level: 7 }]
    const bodyMapRef = useRef(null);

    // ── Vitals Data ──────────────────────────────────────────────────────────
    const [vitalsData, setVitalsData] = useState(null);
    const vitalsRef = useRef(null);

    // ── Patient Context ──────────────────────────────────────────────────────
    const [patientContext, setPatientContext] = useState(null);
    const patientContextRef = useRef(null);

    // ── Refs (stable across renders) ─────────────────────────────────────────
    const recognitionRef = useRef(null);
    const imageRef = useRef(null);           // Stable snapshot of uploadedImage
    const autoRestartRef = useRef(false);    // Whether to auto-open mic after TTS
    const audioRef = useRef(null);           // Currently playing ElevenLabs Audio

    const token = localStorage.getItem('token');

    // Keep refs in sync
    useEffect(() => {
        imageRef.current = uploadedImage;
    }, [uploadedImage]);

    useEffect(() => {
        historyRef.current = conversationHistory;
    }, [conversationHistory]);

    useEffect(() => {
        bodyMapRef.current = bodyMapData;
    }, [bodyMapData]);

    useEffect(() => {
        vitalsRef.current = vitalsData;

        // If vitals are scanned mid-consultation, show a visual system message
        if (vitalsData && phase === "interviewing") {
            const systemMsg = {
                role: "system",
                text: `Facial Analysis: ${vitalsData.tensionLevel} Tension, ${vitalsData.respirationRate}/min Respiration, Mood: ${vitalsData.mood} ${vitalsData.emoji}. Acne: Forehead(${vitalsData.acne_forehead}), Cheeks(${vitalsData.acne_cheeks}), Jawline(${vitalsData.acne_chin_jawline}).`,
                timestamp: new Date()
            };
            setConversationHistory(prev => [...prev, systemMsg]);
        }
    }, [vitalsData, phase]);

    useEffect(() => {
        patientContextRef.current = patientContext;
    }, [patientContext]);

    // ── Fetch Patient Context (Demographics & History) ───────────────────────
    useEffect(() => {
        const fetchPatientContext = async () => {
            if (!token) return;
            try {
                // Fetch demographics & history from custom backend
                const res = await fetch('http://localhost:5000/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const profileData = await res.json();
                    
                    const histRes = await fetch('http://localhost:5000/api/consultations', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    let historyDocs = [];
                    if (histRes.ok) {
                        const docs = await histRes.json();
                        historyDocs = docs.slice(0, 5).map(data => ({
                            date: new Date(data.createdAt).toLocaleDateString(),
                            diagnosis: data.diagnosis?.possible_conditions || [],
                            summary: data.diagnosis?.interview_summary || ""
                        }));
                    }
                    
                    setPatientContext({
                        profile: profileData,
                        recentHistory: historyDocs
                    });
                }
            } catch (err) {
                console.warn("Could not fetch patient context for AI:", err);
            }
        };
        fetchPatientContext();
    }, [token]);

    // ─── Text-to-Speech (ElevenLabs) ─────────────────────────────────────────
    const speak = useCallback(async (text, onDone) => {
        if (!text) {
            onDone?.();
            return;
        }

        const token = ++speakTokenRef.current;

        // Cancel any existing audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }

        setIsSpeaking(true);

        try {
            const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
            const voiceId = "pNInz6obpgDQGcFmaJgB"; 
            
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: "POST",
                headers: {
                    "Accept": "audio/mpeg",
                    "xi-api-key": apiKey,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text: text,
                    model_id: "eleven_turbo_v2_5",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`ElevenLabs API failed: ${response.status} ${errText}`);
            }

            if (token !== speakTokenRef.current) return;

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            
            audio.onended = () => {
                if (token === speakTokenRef.current) setIsSpeaking(false);
                URL.revokeObjectURL(url);
                onDone?.();
            };
            
            audio.onerror = () => {
                if (token === speakTokenRef.current) setIsSpeaking(false);
                URL.revokeObjectURL(url);
                onDone?.();
            };

            audioRef.current = audio;
            await audio.play();

        } catch (err) {
            console.error("TTS Error:", err);
            
            // Fallback to Native Browser TTS if ElevenLabs fails (e.g. rate limit / abuse detection)
            console.log("Falling back to native browser TTS...");
            if ('speechSynthesis' in window) {
                // Cancel any ongoing native speech
                window.speechSynthesis.cancel();
                
                const utterance = new SpeechSynthesisUtterance(text);
                
                // Try to find a good English male voice to match Dr. Xys
                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('Google UK English Male') || v.name.includes('Daniel'))) || voices[0];
                if (preferredVoice) utterance.voice = preferredVoice;
                
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                
                utterance.onend = () => {
                    if (token === speakTokenRef.current) setIsSpeaking(false);
                    onDone?.();
                };
                
                utterance.onerror = (e) => {
                    console.warn("Native TTS Error:", e);
                    if (token === speakTokenRef.current) setIsSpeaking(false);
                    onDone?.();
                };
                
                window.speechSynthesis.speak(utterance);
            } else {
                if (token === speakTokenRef.current) setIsSpeaking(false);
                onDone?.();
            }
        }
    }, []);

    // ─── Speech Recognition ──────────────────────────────────────────────────
    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser. Please use Chrome.");
            return;
        }

        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (e) => {
            setIsListening(false);
            console.warn("Speech recognition error:", e.error);
        };

        recognition.onresult = async (event) => {
            const userText = event.results[0][0].transcript.trim();
            if (!userText) return;

            setIsListening(false);
            setPhase("processing");

            // Add the user's message to the conversation history
            const userMessage = { role: "user", text: userText, timestamp: new Date() };

            const updatedHistory = [...historyRef.current, userMessage];
            setConversationHistory(updatedHistory);
            
            processWithAI(updatedHistory, imageRef.current, bodyMapRef.current, vitalsRef.current, patientContextRef.current);
        };

        recognition.start();
        recognitionRef.current = recognition;
    }, []); // eslint-disable-line

    // ─── Process with AI ─────────────────────────────────────────────────────
    const processWithAI = useCallback(async (history, imageData, painData, vitalsData, pContext) => {
        try {
            // Build clean history for API (role + text only)
            let apiHistory = history.map(m => ({ role: m.role, text: m.text }));

            // Inject body map pain data as context if available
            if (painData && painData.length > 0) {
                const painDescription = painData.map(p =>
                    `${p.label}: Pain Level ${p.level}/10`
                ).join(", ");
                const bodyMapContext = {
                    role: "user",
                    text: `[BODY MAP DATA — The patient marked the following pain locations on the 3D body map: ${painDescription}. Use this data as clinical evidence alongside their verbal descriptions.]`
                };
                // Insert body map context right after the first user message
                apiHistory = [apiHistory[0], bodyMapContext, ...apiHistory.slice(1)];
            }

            // Inject vitals data as context if available
            if (vitalsData) {
                let text = `[VITALS DATA — The patient just completed a real-time rPPG scan. Their current vitals are: Heart Rate: ${vitalsData.heartRate} BPM, SpO2: ${vitalsData.spO2}%, Respiration: ${vitalsData.respiration} breaths/min.`;
                if (vitalsData.mood) {
                    text += ` Mood Index: ${vitalsData.happiness}% (${vitalsData.mood}).`;
                }
                if (vitalsData.facialAnalysis) {
                    text += `\nDEEP FACIAL ANALYSIS:\n- Expression: ${vitalsData.facialAnalysis.expression}\n- Organ Mapping: ${vitalsData.facialAnalysis.organMapping}\n- Skin Tone: ${vitalsData.facialAnalysis.skin}.`;
                }
                text += ` Use this clinical and emotional data in your analysis.]`;

                const vitalsContext = {
                    role: "user",
                    text: text
                };
                apiHistory = [apiHistory[0], vitalsContext, ...apiHistory.slice(1)];
            }

            const result = await getDrXysConversationalResponse(apiHistory, imageData, pContext);

            if (result.phase === "followup") {
                // ── Doctor asks a clarifying question ────────────────────────
                const doctorMessage = {
                    role: "doctor",
                    text: result.question,
                    timestamp: new Date(),
                    isQuestion: true,
                    clinicalNote: result.clinical_note
                };

                setCurrentQuestion(result.question);
                setQuestionCount(prev => prev + 1);
                setPhase("interviewing");

                setConversationHistory(prev => [...prev, doctorMessage]);

                // Speak the question, then auto-restart mic
                speak(result.spokenQuestion, () => {
                    // Auto-restart mic after doctor finishes speaking
                    setTimeout(() => {
                        setPhase("listening");
                        startListening();
                    }, 2000); // Increased to 2 seconds to pace API requests and feel more human
                });

            } else if (result.phase === "emergency") {
                // ── Emergency detected ─────────────────────────────────────
                const doctorMessage = {
                    role: "doctor",
                    text: result.doctor_warning || "MEDICAL EMERGENCY DETECTED.",
                    timestamp: new Date(),
                    isQuestion: false,
                    isEmergency: true
                };

                setConversationHistory(prev => [...prev, doctorMessage]);
                setAiResponse(result);
                setCurrentQuestion(null);
                setPhase("emergency");
                setUploadedImage(null);

                // Speak the emergency warning
                speak(result.spokenResponse);

            } else if (result.phase === "diagnosis") {
                // ── Final diagnosis received ─────────────────────────────────
                const summaryText = result.interview_summary
                    ? `Based on our conversation: ${result.interview_summary}`
                    : `Diagnosis: ${result.possible_conditions?.join(", ")}`;

                const doctorMessage = {
                    role: "doctor",
                    text: summaryText,
                    timestamp: new Date(),
                    isQuestion: false,
                    isFinalDiagnosis: true
                };

                setConversationHistory(prev => [...prev, doctorMessage]);
                setAiResponse(result);
                setCurrentQuestion(null);
                setPhase("done");
                setUploadedImage(null);

                // Save full consultation to Database
                await saveConsultationToDatabase(history, result, imageData);

                // Speak the final summary
                speak(result.spokenResponse);
            }

        } catch (error) {
            console.error("AI processing error:", error);
            setPhase("done");
            speak("I'm sorry, I encountered a technical issue. Please try starting a new consultation.");
        }
    }, [speak, startListening]); // eslint-disable-line

    // ─── Save to Database ─────────────────────────────────────────────────────
    const saveConsultationToDatabase = useCallback(async (history, diagnosis, imageData) => {
        if (!token) return;
        try {
            await fetch('http://localhost:5000/api/consultations', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patientContext: patientContextRef.current,
                    diagnosis: {
                        possible_conditions: diagnosis.possible_conditions || [],
                        biological_explanation: diagnosis.biological_explanation || [],
                        mock_prescription: diagnosis.mock_prescription || [],
                        further_actions: diagnosis.further_actions || "",
                        doctor_warning: diagnosis.doctor_warning || "",
                        interview_summary: diagnosis.interview_summary || "",
                        type: diagnosis.type || "medical"
                    },
                    transcript: history.map(m => ({
                        role: m.role,
                        text: m.text,
                        timestamp: m.timestamp?.toISOString() || new Date().toISOString()
                    })),
                    vitals: vitalsRef.current,
                    bodyMap: bodyMapRef.current
                })
            });
        } catch (err) {
            console.warn("Could not save consultation to database:", err.message);
        }
    }, [token]);

    // ─── Start a fresh consultation ──────────────────────────────────────────
    const startConsultation = useCallback(async () => {
        // Cancel any ongoing speech or recognition
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        recognitionRef.current?.abort();

        // Reset state and show processing UI
        setPhase("processing");
        setConversationHistory([]);
        setAiResponse(null);
        setCurrentQuestion(null);
        setQuestionCount(0);
        setBodyMapData(null);

        // Fetch proactive personalized greeting
        const greeting = await getPredictiveGreeting(patientContextRef.current);

        const initialDoctorMessage = {
            role: "doctor",
            text: greeting,
            timestamp: new Date(),
            isQuestion: true,
            clinicalNote: "Predictive Greeting"
        };

        // Transition to interviewing
        setPhase("interviewing");
        setConversationHistory([initialDoctorMessage]);
        setCurrentQuestion(greeting);
        setQuestionCount(1);

        // Speak the greeting, then listen
        speak(greeting, () => {
            setTimeout(() => {
                setPhase("listening");
                startListening();
            }, 600);
        });
    }, [startListening, speak]);

    // ─── Reset / New consultation ────────────────────────────────────────────
    const resetConsultation = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        recognitionRef.current?.abort();
        setPhase("idle");
        setConversationHistory([]);
        setAiResponse(null);
        setCurrentQuestion(null);
        setQuestionCount(0);
        setIsListening(false);
        setIsSpeaking(false);
        setUploadedImage(null);
        setBodyMapData(null);
        setVitalsData(null);
    }, []);

    // ─── Cleanup on unmount ──────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
            recognitionRef.current?.abort();
        };
    }, []);

    // ─── Derived helpers ─────────────────────────────────────────────────────
    const isProcessing = phase === "processing";
    const isIdle = phase === "idle";
    const isDone = phase === "done";
    const isInterviewing = phase === "interviewing";
    const isEmergency = phase === "emergency";

    // For backward compat with AiDoctorFace component
    const transcribedText = conversationHistory.find(m => m.role === "user")?.text || "";

    return {
        // State
        phase,
        isListening,
        isSpeaking,
        isProcessing,
        isIdle,
        isDone,
        isInterviewing,
        isEmergency,

        // Conversation
        conversationHistory,
        currentQuestion,
        questionCount,
        aiResponse,
        uploadedImage,
        bodyMapData,
        vitalsData,
        transcribedText,   // Last user message (compat)

        // Actions
        setUploadedImage,
        setBodyMapData,
        setVitalsData,
        startConsultation,
        resetConsultation,
        speak,
        startListening,
    };
}
