import React, { useState, useEffect, useRef } from 'react';
import { Send, Sun, Zap, Waves, CloudRain, Frown, Volume2, Mic, Video, VolumeX, MicOff, VideoOff, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ChatMessage, Emotion } from '../types';
import { detectEmotion, getSoulResponse, logEmotion, updateUserPoints, saveChatMessage } from '../services/mockApi';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const faceapi = (window as any).faceapi;

const SoulAvatar: React.FC<{ currentEmotion: Emotion }> = ({ currentEmotion }) => {
    const emotionMap: Record<Emotion, React.ReactNode> = {
        [Emotion.Joy]: <Sun className="w-5 h-5 text-yellow-400" />,
        [Emotion.Calm]: <Waves className="w-5 h-5 text-blue-400" />,
        [Emotion.Anxiety]: <Zap className="w-5 h-5 text-purple-400" />,
        [Emotion.Frustration]: <Frown className="w-5 h-5 text-orange-400" />,
        [Emotion.Sadness]: <CloudRain className="w-5 h-5 text-gray-400" />,
        [Emotion.Neutral]: <></>,
    };

    return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warm-purple-300 to-calm-blue-300 flex items-center justify-center shadow-md relative shrink-0">
            <span className="text-2xl">✨</span>
            <div className="absolute -top-1 -right-1 bg-white p-1 rounded-full shadow animate-ping-short">
                {emotionMap[currentEmotion]}
            </div>
        </div>
    );
};

const MessageBubble: React.FC<{ message: ChatMessage; onBoosterComplete: (boosterId: string, points: number) => void }> = ({ message, onBoosterComplete }) => {
    const isSoul = message.sender === 'soul';

    const handleComplete = () => {
        if (message.moodBooster) {
            onBoosterComplete(message.moodBooster.id, 10);
        }
    };
    
    return (
        <div className={`flex items-end gap-3 my-2 ${isSoul ? 'justify-start' : 'justify-end'}`}>
            {isSoul && <SoulAvatar currentEmotion={message.emotion || Emotion.Neutral} />}
            <div className={`max-w-xs md:max-w-md p-3 text-sm md:text-base ${isSoul 
                ? 'bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-gray-200 rounded-r-2xl rounded-tl-lg' 
                : 'bg-warm-purple-500 text-white rounded-l-2xl rounded-tr-lg'
            }`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.moodBooster && !message.moodBooster.completed && (
                    <div className="mt-2 pt-2 border-t border-warm-purple-300 dark:border-warm-purple-600">
                        <p className={`text-xs font-semibold mb-2 ${isSoul ? 'text-warm-purple-700 dark:text-warm-purple-300' : 'text-warm-purple-100'}`}>✨ Mood Booster</p>
                        <p className="text-sm italic mb-3">{message.moodBooster.text}</p>
                        <Button onClick={handleComplete} className="bg-green-500 hover:bg-green-600 text-xs py-1 px-3 w-auto">Mark as Complete (+10 pts)</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper function to strip emojis from a string
const stripEmojis = (text: string) => {
    return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
};

const ChatPage: React.FC = () => {
    const { user, setUser } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isSoulTyping, setIsSoulTyping] = useState(false);
    const [isTtsEnabled, setIsTtsEnabled] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isCameraEnabled, setIsCameraEnabled] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
    
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const detectionIntervalRef = useRef<number | null>(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
       if (user?.chatHistory) {
            if (user.chatHistory.length === 0) {
                 setMessages([{ id: 1, sender: 'soul', text: "Hello! I'm Soul. How are you feeling today? 😊", emotion: Emotion.Neutral }]);
            } else {
                setMessages(user.chatHistory);
            }
       }
    }, [user?.id]);

    useEffect(scrollToBottom, [messages]);
    
    // --- Feature Effects ---

    // Load Face-API models
    useEffect(() => {
        const loadModels = async () => {
            if (!faceapi) {
                console.error("face-api.js not loaded");
                return;
            }
            const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights';
            try {
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
                setModelsLoaded(true);
            } catch (error) {
                console.error("Failed to load face-api models:", error);
            }
        };
        loadModels();
    }, []);

    // Initialize Speech Recognition
    useEffect(() => {
        if (!SpeechRecognition) {
            console.warn("Speech Recognition not supported in this browser.");
            return;
        }
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';
        recognitionRef.current = rec;

        return () => {
            rec.stop();
        };
    }, []);
    
    // Initialize Text-to-Speech Voices
    useEffect(() => {
        const loadVoices = () => {
            setVoices(speechSynthesis.getVoices());
        };
        speechSynthesis.addEventListener('voiceschanged', loadVoices);
        loadVoices();
        return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    }, []);


    // Text-to-Speech Effect
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (isTtsEnabled && lastMessage?.sender === 'soul' && lastMessage.text) {
            const textToSpeak = stripEmojis(lastMessage.text);
            if (textToSpeak) { 
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                const femaleVoice = voices.find(v => (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Karen')) && v.lang.startsWith('en'));
                if(femaleVoice) {
                    utterance.voice = femaleVoice;
                }
                speechSynthesis.cancel();
                speechSynthesis.speak(utterance);
            }
        }
    }, [messages, isTtsEnabled, voices]);
    
    // Camera & Emotion Detection Effect
    useEffect(() => {
        const startVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access denied:", err);
                alert("Camera access was denied. Please enable it in your browser settings to use this feature.");
                setIsCameraEnabled(false);
            }
        };

        const stopVideo = () => {
             if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
        
        const startDetection = () => {
            if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = window.setInterval(async () => {
                if (videoRef.current && !videoRef.current.paused && faceapi) {
                    const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
                    if (detections.length > 0) {
                        const expressions = detections[0].expressions;
                        const dominantEmotion = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
                        setDetectedEmotion(dominantEmotion);
                    } else {
                        setDetectedEmotion(null);
                    }
                }
            }, 700);
        }

        const stopDetection = () => {
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
                detectionIntervalRef.current = null;
            }
            setDetectedEmotion(null);
        }

        if (isCameraEnabled && modelsLoaded) {
            startVideo();
        } else {
            stopVideo();
            stopDetection();
        }

        if (isCameraEnabled && modelsLoaded && videoRef.current) {
            videoRef.current.addEventListener('play', startDetection);
        }

        return () => { 
            stopVideo();
            stopDetection();
             if (videoRef.current) {
                videoRef.current.removeEventListener('play', startDetection);
            }
        };
    }, [isCameraEnabled, modelsLoaded]);

    // --- Handlers ---
    const handleListen = () => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
            };
            recognition.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };
            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
            setIsListening(true);
        }
    };

    const handleSend = async () => {
        if (input.trim() === '' || !user || isSoulTyping) return;

        let imageFrameData: string | undefined = undefined;
        if (isCameraEnabled && videoRef.current && videoRef.current.readyState >= 3) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Flip the canvas context to match the mirrored video feed
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                // Get base64 data and strip the data URL prefix
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                imageFrameData = dataUrl.split(',')[1];
            }
        }

        const userMessage: ChatMessage = {
            id: Date.now(),
            text: input,
            sender: 'user',
            facialEmotion: detectedEmotion ?? undefined,
            imageFrame: imageFrameData,
        };
        
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        saveChatMessage(user.id, userMessage);

        const emotionFromText = detectEmotion(input);
        if (emotionFromText !== Emotion.Neutral) {
            logEmotion(user.id, emotionFromText);
        }
        
        const currentInput = input;
        setInput('');
        setIsSoulTyping(true);

        const soulResponse = await getSoulResponse(user.id, currentInput, detectedEmotion ?? undefined, imageFrameData);
        const soulMessage: ChatMessage = { id: Date.now() + 1, ...soulResponse };
        
        setMessages(prev => [...prev, soulMessage]);
        const updatedUser = await saveChatMessage(user.id, soulMessage);
        setUser(updatedUser);
        setIsSoulTyping(false);
    };
    
    const handleBoosterComplete = async (boosterId: string, points: number) => {
        if (!user) return;
        
        const updatedMessages = messages.map(msg => 
            msg.moodBooster?.id === boosterId 
            ? { ...msg, moodBooster: { ...msg.moodBooster, completed: true } } 
            : msg
        );
        setMessages(updatedMessages);

        if (user) {
            user.chatHistory = updatedMessages;
            const updatedUserWithPoints = await updateUserPoints(user.id, user.userPoints + points);
            setUser(updatedUserWithPoints);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 rounded-lg shadow-xl relative">
            {isCameraEnabled && (
                <div className="absolute top-4 right-4 w-36 h-36 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg z-10 animate-fade-in text-center">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]"></video>
                    {detectedEmotion && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full capitalize">
                           {detectedEmotion}
                        </div>
                    )}
                </div>
            )}

            <div className="flex-1 p-4 overflow-y-auto bg-calm-blue-50 dark:bg-gray-900">
                 {messages.map((msg) => <MessageBubble key={msg.id} message={msg} onBoosterComplete={handleBoosterComplete}/>)}
                 {isSoulTyping && (
                    <div className="flex items-end gap-3 my-2 justify-start">
                        <SoulAvatar currentEmotion={Emotion.Neutral} />
                        <div className="max-w-xs md:max-w-md p-3 rounded-r-2xl rounded-tl-lg bg-white dark:bg-gray-700 shadow">
                            <Spinner />
                        </div>
                    </div>
                 )}
                 <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                    <button onClick={() => setIsTtsEnabled(p => !p)} title={isTtsEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"} className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isTtsEnabled ? 'text-warm-purple-600' : 'text-gray-500 dark:text-gray-400'}`}>
                        {isTtsEnabled ? <Volume2 /> : <VolumeX />}
                    </button>
                    {SpeechRecognition && (
                        <button onClick={handleListen} title={isListening ? "Stop Listening" : "Start Listening"} className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-500 dark:text-gray-400'}`}>
                            {isListening ? <MicOff /> : <Mic />}
                        </button>
                    )}
                    <button 
                        onClick={() => setIsCameraEnabled(p => !p)} 
                        title={isCameraEnabled ? "Disable Camera" : "Enable Camera"} 
                        className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isCameraEnabled ? 'text-warm-purple-600' : 'text-gray-500 dark:text-gray-400'} disabled:cursor-not-allowed disabled:opacity-50`}
                        disabled={!modelsLoaded}
                    >
                        {!modelsLoaded && !isCameraEnabled ? <Loader2 className="animate-spin" /> : (isCameraEnabled ? <Video /> : <VideoOff />)}
                    </button>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Tell me what's on your mind..."
                        className="w-full p-3 pr-12 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-warm-purple-400"
                        disabled={isSoulTyping}
                    />
                    <button onClick={handleSend} disabled={isSoulTyping || input.trim() === ''} className="absolute inset-y-0 right-0 flex items-center justify-center w-10 h-10 my-auto mr-1 rounded-full bg-warm-purple-500 hover:bg-warm-purple-600 text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;