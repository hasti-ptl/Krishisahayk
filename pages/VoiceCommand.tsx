import React, { useState, useEffect, useRef } from 'react';
import { Mic, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { parseVoiceCommand } from '../services/geminiService';
import { api } from '../services/api';
import { IntentType, ParsedIntent } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

enum VoiceState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  PROCESSING = 'PROCESSING',
  CONFIRMATION = 'CONFIRMATION',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

const VoiceCommand: React.FC = () => {
  const [state, setState] = useState<VoiceState>(VoiceState.IDLE);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState<ParsedIntent | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { language, t } = useLanguage();
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language; 

      recognitionRef.current.onstart = () => setState(VoiceState.LISTENING);
      
      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleProcessing(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Error", event);
        setErrorMessage(t('retry'));
        setState(VoiceState.ERROR);
      };
    } else {
      setErrorMessage(t('errorBrowser'));
      setState(VoiceState.ERROR);
    }
  }, [language]); // Re-initialize if language changes

  const startListening = () => {
    if (recognitionRef.current) {
        recognitionRef.current.lang = language;
    }
    setErrorMessage('');
    setTranscript('');
    setParsedData(null);
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error(e);
      recognitionRef.current.stop();
      setTimeout(() => recognitionRef.current.start(), 200);
    }
  };

  const stopListening = () => {
    recognitionRef.current.stop();
  };

  const handleProcessing = async (text: string) => {
    setState(VoiceState.PROCESSING);
    try {
      // Pass the current language to the parser so Gemini knows what language to reply in
      const result = await parseVoiceCommand(text, language);
      setParsedData(result);
      
      // Text to Speech for confirmation
      speakConfirmation(result.confirmation_message);
      
      setState(VoiceState.CONFIRMATION);
    } catch (error) {
      setErrorMessage(t('errorGeneric'));
      setState(VoiceState.ERROR);
    }
  };

  const speakConfirmation = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  const confirmAction = async () => {
    if (!parsedData) return;
    setState(VoiceState.PROCESSING);
    
    try {
      if (parsedData.intent === IntentType.ACTIVITY) {
        await api.postActivity({
          activity_type: parsedData.data.activity_type || 'General',
          crop: parsedData.data.crop || 'Unknown',
          area_acres: parsedData.data.area,
          date: new Date().toISOString().split('T')[0]
        });
      } else if (parsedData.intent === IntentType.TRANSACTION) {
        await api.postTransaction({
          type: parsedData.data.transaction_type || 'EXPENSE',
          category: parsedData.data.category || 'General',
          amount: parsedData.data.amount || 0,
          date: new Date().toISOString().split('T')[0]
        });
      }
      
      setState(VoiceState.SUCCESS);
      speakConfirmation(t('saved'));
      
      // Reset after 3 seconds
      setTimeout(() => {
        setState(VoiceState.IDLE);
        setTranscript('');
        setParsedData(null);
      }, 3000);

    } catch (e) {
      setErrorMessage(t('errorGeneric'));
      setState(VoiceState.ERROR);
    }
  };

  // Render Helpers
  const renderIdle = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">{t('speakNow')}</h2>
        <p className="text-gray-500">{t('speakHint')}</p>
        <p className="text-gray-500">{t('speakHint2')}</p>
      </div>
      <button 
        onClick={startListening}
        className="w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-orange-200 animate-pulse"
      >
        <Mic className="w-16 h-16 text-white" />
      </button>
      <p className="text-sm text-gray-400">{t('micHint')}</p>
    </div>
  );

  const renderListening = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <h2 className="text-2xl font-bold text-green-600 animate-pulse">{t('listening')}</h2>
      <div className="w-48 h-48 border-4 border-green-500 rounded-full flex items-center justify-center relative">
        <div className="absolute w-full h-full rounded-full bg-green-100 animate-ping opacity-20"></div>
        <Mic className="w-20 h-20 text-green-600" />
      </div>
      <button 
        onClick={stopListening} 
        className="bg-gray-200 px-6 py-2 rounded-full font-bold text-gray-700"
      >
        {t('stop')}
      </button>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
      <h2 className="text-xl font-bold text-gray-700">{t('processing')}</h2>
    </div>
  );

  const renderConfirmation = () => (
    <div className="flex flex-col h-full justify-between pt-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-500 mb-2">{t('confirmTitle')}</h3>
        <p className="text-xl italic text-gray-800 mb-6">"{transcript}"</p>
        
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <h3 className="text-sm font-bold text-blue-800 mb-2 uppercase tracking-wide">{t('aiUnderstood')}</h3>
          <p className="text-lg font-semibold text-blue-900">{parsedData?.confirmation_message}</p>
          
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {parsedData?.data.crop && (
               <div className="bg-white p-2 rounded">{t('crop')}: <b>{parsedData.data.crop}</b></div>
            )}
            {parsedData?.data.amount && (
               <div className="bg-white p-2 rounded">{t('amount')}: <b>₹{parsedData.data.amount}</b></div>
            )}
             {parsedData?.data.activity_type && (
               <div className="bg-white p-2 rounded">{t('activity')}: <b>{parsedData.data.activity_type}</b></div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <button 
          onClick={() => setState(VoiceState.IDLE)}
          className="bg-gray-200 text-gray-800 py-4 rounded-xl font-bold text-lg"
        >
          {t('incorrect')}
        </button>
        <button 
          onClick={confirmAction}
          className="bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-6 h-6" /> {t('correct')}
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-green-800">{t('success')}</h2>
      <p className="text-gray-500">{t('saved')}</p>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-red-600" />
      </div>
      <h2 className="text-xl font-bold text-red-800 text-center">{errorMessage}</h2>
      <button 
        onClick={() => setState(VoiceState.IDLE)}
        className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
      >
        {t('retry')}
      </button>
    </div>
  );

  return (
    <div className="h-full px-2">
      {state === VoiceState.IDLE && renderIdle()}
      {state === VoiceState.LISTENING && renderListening()}
      {state === VoiceState.PROCESSING && renderProcessing()}
      {state === VoiceState.CONFIRMATION && renderConfirmation()}
      {state === VoiceState.SUCCESS && renderSuccess()}
      {state === VoiceState.ERROR && renderError()}
    </div>
  );
};

export default VoiceCommand;
