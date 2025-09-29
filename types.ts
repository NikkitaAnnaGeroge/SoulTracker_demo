export enum Emotion {
  Joy = "Joy",
  Calm = "Calm",
  Anxiety = "Anxiety",
  Frustration = "Frustration",
  Sadness = "Sadness",
  Neutral = "Neutral"
}

export interface EmotionLog {
  emotion: Emotion;
  date: string;
}

export interface User {
  id: string;
  email: string;
  userPoints: number;
  currentStreak: number;
  lastLoginDate: string | null;
  emotionalHistory: EmotionLog[];
  chatHistory: ChatMessage[];
}

export interface LeaderboardEntry {
  rank: number;
  email: string;
  userPoints: number;
  isCurrentUser: boolean;
}

export interface ChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'soul';
    emotion?: Emotion;
    facialEmotion?: string; // Emotion detected from camera
    imageFrame?: string; // base64 encoded image frame from camera
    moodBooster?: {
        id: string;
        text: string;
        completed: boolean;
    };
}