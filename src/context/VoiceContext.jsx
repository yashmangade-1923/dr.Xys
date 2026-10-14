import React, { createContext, useContext } from 'react';
import { useVoiceInteraction } from '../hooks/useVoiceInteraction';

const VoiceContext = createContext(null);

export function VoiceProvider({ children }) {
    const voiceState = useVoiceInteraction();
    
    return (
        <VoiceContext.Provider value={voiceState}>
            {children}
        </VoiceContext.Provider>
    );
}

export function useGlobalVoice() {
    const context = useContext(VoiceContext);
    if (!context) {
        throw new Error("useGlobalVoice must be used within a VoiceProvider");
    }
    return context;
}
