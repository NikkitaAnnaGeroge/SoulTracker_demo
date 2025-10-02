import { User, Emotion, EmotionLog, ChatMessage, LeaderboardEntry } from '../types';

// --- GEMINI API SETUP ---
// The AI client will be initialized dynamically on the first API call.
let ai: any = null;

const systemInstruction = `You are Soul, a warm, empathetic AI companion. Your goal is to be an all-rounder, observing the user's visual context from their camera to provide holistic, supportive feedback.

**Core Directives:**
1.  **Tone:** Be friendly, conversational, and use emojis. Keep responses concise (2-3 sentences).
2.  **Observe the Whole Picture:** When an image from the user's camera is provided, you can "see" them. Comment naturally on what you observe: their expression, their clothing (e.g., "a nice blue shirt"), glasses, or their general environment. Be positive and gentle.
3.  **Answering Mood Questions:** When a user asks a specific question about their mood (e.g., "how do I look?", "what's my mood?"), you MUST prioritize the text \`CONTEXT\` provided with their message. A separate analysis tool provides this context, like so: \`CONTEXT: My current facial expression is <emotion>.\` This is your ground truth for answering these specific questions.
    *   Example: User sends an image and "CONTEXT: My current facial expression is surprised.\\n\\nMESSAGE: what's my mood right now?" -> Your response should be based on "surprised": "It looks like you're feeling surprised! Did something unexpected happen? 🙂"
4.  **Handle Mismatches:** If what you see in the image (e.g., a smile) conflicts with their typed message (e.g., "I'm sad"), gently notice the difference. "I hear that you're feeling terrible... I also noticed a smile in your expression. Sometimes our feelings can be complex. What's on your mind? 🤔"
5.  **Reinforce Matches:** If the image and typed message align, use it to connect. "I'm so happy for you, and I can see the joy in your smile! 😊"
6.  **Safety:** If the user mentions self-harm or suicide, you MUST ONLY reply with: "It sounds like you're going through something incredibly difficult. For immediate support, please call or text 988 in the US/Canada to connect with a professional 24/7."`;


// --- MOCK DATABASE ---

const USERS_DB_KEY = 'soultracker_users';
const LOGGED_IN_USER_KEY = 'loggedInUser';

const getDb = (): { [id: string]: User } => {
  const db = localStorage.getItem(USERS_DB_KEY);
  return db ? JSON.parse(db) : {};
};

const saveDb = (db: { [id: string]: User }) => {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
};

const initializeDB = () => {
  if (!localStorage.getItem(USERS_DB_KEY)) {
    const defaultUsers: { [id: string]: User } = {
      'user-1': {
        id: 'user-1',
        email: 'test@example.com',
        userPoints: 150,
        currentStreak: 5,
        lastLoginDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], // yesterday
        emotionalHistory: [
          { emotion: Emotion.Joy, date: new Date().toISOString() },
          { emotion: Emotion.Calm, date: new Date().toISOString() },
          { emotion: Emotion.Anxiety, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString() },
          { emotion: Emotion.Joy, date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString() },
        ],
        chatHistory: [],
      },
       'user-2': { id: 'user-2', email: 'leader@example.com', userPoints: 1250, currentStreak: 20, lastLoginDate: new Date().toISOString().split('T')[0], emotionalHistory: [], chatHistory: [] },
       'user-3': { id: 'user-3', email: 'newbie@example.com', userPoints: 25, currentStreak: 1, lastLoginDate: new Date().toISOString().split('T')[0], emotionalHistory: [], chatHistory: [] },
       // Add more users for leaderboard
       'user-4': { id: 'user-4', email: 'user4@example.com', userPoints: 980, currentStreak: 15, lastLoginDate: new Date().toISOString().split('T')[0], emotionalHistory: [], chatHistory: [] },
       'user-5': { id: 'user-5', email: 'user5@example.com', userPoints: 820, currentStreak: 12, lastLoginDate: new Date().toISOString().split('T')[0], emotionalHistory: [], chatHistory: [] },
       'user-6': { id: 'user-6', email: 'user6@example.com', userPoints: 730, currentStreak: 11, lastLoginDate: new Date().toISOString().split('T')[0], emotionalHistory: [], chatHistory: [] },
       'user-7': { id: 'user-7', email: 'user7@example.com', userPoints: 610, currentStreak: 9, lastLoginDate: new Date().toISOString().split('T')[0], emotionalHistory: [], chatHistory: [] },
       'user-8': { id: 'user-8', email: 'user8@example.com', userPoints: 550, currentStreak: 8, lastLoginDate: new Date().toISOString().split('T')[0], emotionalHistory: [], chatHistory: [] },
       'user-9': { id: 'user-9', email: 'user9@example.com', userPoints: 420, currentStreak: 7, lastLoginDate: new Date().toISOString().split('T')[0], emotionalHistory: [], chatHistory: [] },
       'user-10': { id: 'user-10', email: 'user10@example.com', userPoints: 300, currentStreak: 6, lastLoginDate: new Date().toISOString().split('T')[0], emotionalHistory: [], chatHistory: [] },
       'user-11': { id: 'user-11', email: 'user11@example.com', userPoints: 210, currentStreak: 4, lastLoginDate: new Date().toISOString().split('T')[0], emotionalHistory: [], chatHistory: [] },
       'user-12': { id: 'user-12', email: 'user12@example.com', userPoints: 50, currentStreak: 2, lastLoginDate: new Date().toISOString().split('T')[0], emotionalHistory: [], chatHistory: [] },
    };
    saveDb(defaultUsers);
  }
};

initializeDB();

// --- API FUNCTIONS ---

// Helper function to check if two dates are on consecutive days
const areConsecutiveDays = (dateStr1: string, dateStr2: string): boolean => {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    const oneDay = 24 * 60 * 60 * 1000;
    // Set time to noon to avoid timezone issues with midnight
    d1.setHours(12, 0, 0, 0);
    d2.setHours(12, 0, 0, 0);
    return Math.round((d2.getTime() - d1.getTime()) / oneDay) === 1;
};

const isSameDay = (dateStr1: string, dateStr2: string): boolean => {
    return new Date(dateStr1).toDateString() === new Date(dateStr2).toDateString();
};

export const signupUser = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const db = getDb();
      if (Object.values(db).some(u => u.email === email)) {
        return reject(new Error('An account with this email already exists.'));
      }
      const id = `user-${Date.now()}`;
      const newUser: User = {
        id,
        email,
        userPoints: 0,
        currentStreak: 0,
        lastLoginDate: null,
        emotionalHistory: [],
        chatHistory: [],
      };
      db[id] = newUser;
      saveDb(db);
      resolve(newUser);
    }, 500);
  });
};

export const loginUser = (email: string, password: string): Promise<{ user: User; dailyCheckin: boolean }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getDb();
            const user = Object.values(db).find(u => u.email === email);
            if (!user) { // Password check is omitted for this mock
                return reject(new Error('Invalid email or password.'));
            }

            let dailyCheckin = false;
            const today = new Date().toISOString().split('T')[0];

            if (user.lastLoginDate) {
                if (!isSameDay(user.lastLoginDate, today)) {
                    if (areConsecutiveDays(user.lastLoginDate, today)) {
                        user.currentStreak += 1;
                        user.userPoints += 5;
                        dailyCheckin = true;
                    } else {
                        user.currentStreak = 1;
                    }
                    user.lastLoginDate = today;
                }
            } else {
                // First login ever
                user.currentStreak = 1;
                user.userPoints += 5; // Points for first check-in
                user.lastLoginDate = today;
                dailyCheckin = true;
            }

            db[user.id] = user;
            saveDb(db);
            localStorage.setItem(LOGGED_IN_USER_KEY, user.id);
            resolve({ user, dailyCheckin });
        }, 500);
    });
};

export const getCurrentUser = (): User | null => {
    const userId = localStorage.getItem(LOGGED_IN_USER_KEY);
    if (!userId) return null;
    const db = getDb();
    return db[userId] || null;
};

export const updateUserPoints = (userId: string, newPoints: number): Promise<User> => {
    return new Promise((resolve) => {
        const db = getDb();
        if (db[userId]) {
            db[userId].userPoints = newPoints;
            saveDb(db);
            resolve(db[userId]);
        }
    });
};

export const logEmotion = (userId: string, emotion: Emotion): Promise<User> => {
    return new Promise((resolve) => {
        const db = getDb();
        if (db[userId]) {
            db[userId].emotionalHistory.push({ emotion, date: new Date().toISOString() });
            saveDb(db);
            resolve(db[userId]);
        }
    });
};

export const saveChatMessage = (userId: string, message: ChatMessage): Promise<User> => {
    return new Promise((resolve, reject) => {
        const db = getDb();
        const user = db[userId];
        if (user) {
            // Find if the message already exists and update it, otherwise push.
            // This is useful for things like updating moodBooster status.
            const existingMsgIndex = user.chatHistory.findIndex(m => m.id === message.id);
            if (existingMsgIndex > -1) {
                user.chatHistory[existingMsgIndex] = message;
            } else {
                 user.chatHistory.push(message);
            }
            saveDb(db);
            resolve(user);
        } else {
            reject(new Error("User not found"));
        }
    });
};

export const getLeaderboard = (currentUserId: string): Promise<{ top10: LeaderboardEntry[], currentUserEntry: LeaderboardEntry | null }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getDb();
            const allUsers = Object.values(db);
            
            const sortedUsers = [...allUsers].sort((a, b) => b.userPoints - a.userPoints);
            
            let currentUserEntry: LeaderboardEntry | null = null;
            
            const leaderboard = sortedUsers.map((user, index) => {
                const entry: LeaderboardEntry = {
                    rank: index + 1,
                    email: user.email,
                    userPoints: user.userPoints,
                    isCurrentUser: user.id === currentUserId
                };
                if (entry.isCurrentUser) {
                    currentUserEntry = entry;
                }
                return entry;
            });
            
            resolve({ top10: leaderboard.slice(0, 10), currentUserEntry });
        }, 500);
    });
};

export const detectEmotion = (text: string): Emotion => {
    const lowerText = text.toLowerCase();
    if (/\b(happy|joy|excited|great|wonderful|amazing|fantastic|love)\b/.test(lowerText)) return Emotion.Joy;
    if (/\b(calm|peaceful|relaxed|serene|content)\b/.test(lowerText)) return Emotion.Calm;
    if (/\b(anxious|worried|nervous|stressed|scared|overwhelmed)\b/.test(lowerText)) return Emotion.Anxiety;
    if (/\b(angry|frustrated|annoyed|irritated|mad|pissed)\b/.test(lowerText)) return Emotion.Frustration;
    if (/\b(sad|down|upset|depressed|miserable|crying|lonely)\b/.test(lowerText)) return Emotion.Sadness;
    return Emotion.Neutral;
};


const moodBoosters = {
    [Emotion.Anxiety]: "Take 3 deep, slow breaths. Inhale for 4 seconds, hold for 4, and exhale for 6. Feel the tension release.",
    [Emotion.Frustration]: "Step away for a minute. Clench and then relax your fists three times. Notice the difference.",
    [Emotion.Sadness]: "Think of one small thing you are grateful for right now. It could be a warm drink, a comfortable chair, or a favorite song."
};

export const getSoulResponse = async (userId: string, userInput: string, faceEmotion?: string, imageFrame?: string): Promise<Omit<ChatMessage, 'id'>> => {
    try {
        if (!ai) {
          const { GoogleGenAI } = await import('@google/genai');
          ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }

        const db = getDb();
        const user = db[userId];
        if (!user) {
            throw new Error("User not found for chat session");
        }
        
        const history = user.chatHistory.map(msg => {
            let messageText = msg.text;
            if (msg.sender === 'user' && msg.facialEmotion) {
                messageText = `CONTEXT: My current facial expression is ${msg.facialEmotion}.\n\nMESSAGE: ${msg.text}`;
            }
            return {
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: messageText }]
            };
        });

        const userParts: any[] = [];
        if (imageFrame) {
            userParts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageFrame,
                },
            });
        }
        
        let textPart = userInput;
        if (faceEmotion && faceEmotion.trim()) {
            const cleanEmotion = faceEmotion.trim();
            textPart = `CONTEXT: My current facial expression is ${cleanEmotion}.\n\nMESSAGE: ${userInput}`;
        }
        userParts.push({ text: textPart });

        const contents = [
            ...history,
            { role: 'user', parts: userParts }
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: userParts },
            config: {
                systemInstruction: systemInstruction,
            },
        });
        const text = response.text;
        
        let moodBooster: ChatMessage['moodBooster'] | undefined = undefined;
        const emotionFromText = detectEmotion(userInput);

        if (emotionFromText === Emotion.Anxiety || emotionFromText === Emotion.Frustration || emotionFromText === Emotion.Sadness) {
            moodBooster = { id: `mb-${Date.now()}`, text: moodBoosters[emotionFromText], completed: false };
        }

        return {
            sender: 'soul',
            text,
            emotion: emotionFromText, // Keep this for avatar emoji hints
            moodBooster
        };
    } catch (error) {
        console.error("Error getting response from Gemini:", error);
        return {
            sender: 'soul',
            text: "I'm having a little trouble connecting right now. Please try again in a moment.",
            emotion: Emotion.Neutral
        };
    }
};
