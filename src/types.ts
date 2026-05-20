/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Archetype {
  name: string;
  description: string;
  meaning: string;
}

export interface DreamSymbol {
  name: string;
  meaning: string;
  association: string;
}

export interface PsychologicalInterpretation {
  summary: string;
  archetypes: Archetype[];
  symbols: DreamSymbol[];
  dynamics: string; // Psychological dynamics (tension, shadow conflict)
  guidance: string; // Actionable growth advice for integration
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface DreamEntry {
  id: string;
  date: string;
  title: string;
  transcript: string;
  emotionalTheme: string;
  imageUrl?: string;
  imagePrompt?: string;
  status: 'idle' | 'recording' | 'transcribing' | 'interpreting' | 'ready' | 'error';
  errorMessage?: string;
  interpretation?: PsychologicalInterpretation;
  chatHistory: ChatMessage[];
  audioBlobUrl?: string; // local client-side playback
}
