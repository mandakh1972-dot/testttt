/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Trash2, 
  Moon, 
  Compass, 
  History, 
  Plus, 
  ChevronRight, 
  BookOpen, 
  Feather, 
  AlertCircle, 
  Activity, 
  Sun,
  User,
  Coffee
} from "lucide-react";
import { DreamEntry, PsychologicalInterpretation, ChatMessage } from "./types";
import VoiceRecorder from "./components/VoiceRecorder";
import SurrealVisualizer from "./components/SurrealVisualizer";
import DreamInterpretation from "./components/DreamInterpretation";
import SymbolChat from "./components/SymbolChat";

// Sample helper to create empty initial dream states
const LOCAL_STORAGE_KEY = "dream_journal_entries_v1";

export default function App() {
  const [entries, setEntries] = useState<DreamEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [chatSending, setChatSending] = useState(false);

  // Sync with LocalStorage on init
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEntries(parsed);
          setActiveEntryId(parsed[0].id);
          return;
        }
      }
    } catch (e) {
      console.error("Failed loading local dreams storage:", e);
    }
  }, []);

  // Save to LocalStorage on changes
  const saveEntries = (newEntries: DreamEntry[]) => {
    setEntries(newEntries);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newEntries));
    } catch (e) {
      console.error("Failed writing dream storage update:", e);
    }
  };

  const activeEntry = entries.find((e) => e.id === activeEntryId) || null;

  // Handles adding a new dream narrative (either audio transcription or written freehand text)
  const handleDreamNarrativeRecorded = async (
    text: string, 
    audioUrl?: string, 
    audioBase64?: string
  ) => {
    setIsTranscribing(true);

    // 1. Create client-side dream item
    const newEntryId = "dream_" + Date.now();
    const newEntry: DreamEntry = {
      id: newEntryId,
      date: new Date().toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      title: text.split(" ").slice(0, 5).join(" ") + "...",
      transcript: text,
      emotionalTheme: "Analyzing psychological wavelength...",
      status: "interpreting",
      chatHistory: [],
      audioBlobUrl: audioUrl,
    };

    const updatedEntries = [newEntry, ...entries];
    saveEntries(updatedEntries);
    setActiveEntryId(newEntryId);

    try {
      // 2. Query Jungian Interpretation Engine
      const interpretRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });

      if (!interpretRes.ok) {
        throw new Error("Depth psychology interpretation engine was temporarily unavailable.");
      }

      const interpretationData = await interpretRes.json();

      // Update entry with interpretation metadata
      newEntry.status = "interpreting";
      newEntry.emotionalTheme = interpretationData.emotionalTheme || "Shadow Realm Transit";
      newEntry.interpretation = {
        summary: interpretationData.summary,
        archetypes: interpretationData.archetypes || [],
        symbols: interpretationData.symbols || [],
        dynamics: interpretationData.dynamics || "Interpersonal ego tensions manifesting from the anima connection.",
        guidance: interpretationData.guidance || "Perform active meditation by visualizing the light item.",
      };
      
      // Auto-name title based on emotional theme
      newEntry.title = (interpretationData.emotionalTheme || "Surreal Vision").split(",")[0];

      // Update state so user immediately sees structured outputs
      saveEntries([...updatedEntries]);

      // 3. Initiate Image Generation Pipeline (Asynchronous, doesn't block reading text)
      try {
        const imageRes = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: text,
            emotionalTheme: interpretationData.emotionalTheme,
          }),
        });

        if (imageRes.ok) {
          const imageData = await imageRes.json();
          newEntry.imageUrl = imageData.imageUrl;
          newEntry.imagePrompt = imageData.prompt;
        }
      } catch (imgError) {
        console.warn("Surrealist Image Generation API failed/throttled. Fallback visualizer configured:", imgError);
      }

      newEntry.status = "ready";
      saveEntries([...updatedEntries]);

    } catch (err: any) {
      console.error("Dream Narrative Execution Pipeline failed:", err);
      newEntry.status = "error";
      newEntry.errorMessage = err.message || "Failed analyzing dream core. Please retry.";
      saveEntries([...updatedEntries]);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Handles active symbol chatting follow-up query
  const handleSendChatMessage = async (text: string) => {
    if (!activeEntry || !activeEntry.transcript || chatSending) return;

    const userMsgId = "msg_user_" + Date.now();
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Append user message immediately
    const updatedHistory = [...activeEntry.chatHistory, userMessage];
    activeEntry.chatHistory = updatedHistory;
    saveEntries([...entries]);

    setChatSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dreamTranscript: activeEntry.transcript,
          chatHistory: updatedHistory,
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error("Inner analyst is currently silent. Please retry.");
      }

      const data = await response.json();
      
      const modelMsgId = "msg_model_" + Date.now();
      const modelMessage: ChatMessage = {
        id: modelMsgId,
        role: "model",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      activeEntry.chatHistory = [...updatedHistory, modelMessage];
      saveEntries([...entries]);
    } catch (err: any) {
      const errorMsgId = "msg_error_" + Date.now();
      const errorMessage: ChatMessage = {
        id: errorMsgId,
        role: "model",
        text: "⚠️ [Analyst Connection Lost]: " + (err.message || "Unable to retrieve subconscious reply. Ensure API secrets are configured correctly in settings."),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      activeEntry.chatHistory = [...updatedHistory, errorMessage];
      saveEntries([...entries]);
    } finally {
      setChatSending(false);
    }
  };

  // Handle auto-focus chat on symbol click
  const handleSelectSymbolForChat = (symbolName: string) => {
    handleSendChatMessage(`Can you explain what the symbol of the "${symbolName}" represents in my dream, and how it relates to my daily waking consciousness?`);
  };

  const handleDeleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = entries.filter((item) => item.id !== id);
    saveEntries(filtered);
    if (activeEntryId === id) {
      setActiveEntryId(filtered.length > 0 ? filtered[0].id : null);
    }
  };

  const handleCreateNewBlank = () => {
    // Reset active item to null to display empty launcher card state
    setActiveEntryId(null);
  };

  // Stats calculation
  const totalAnalyzed = entries.length;
  // Unique archetypes discovered
  const totalArchetypes = entries.reduce((sum, item) => {
    return sum + (item.interpretation?.archetypes?.length || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#1c1c1c] selection:bg-[#1c1c1c]/10 selection:text-[#1c1c1c] flex flex-col font-sans">
      {/* Sticky top-bar menu */}
      <header className="sticky top-0 z-30 bg-[#f7f4ed]/90 backdrop-blur-md border-b border-[#eceae4] px-4 md:px-8 py-3.5 flex justify-between items-center transition-all">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1c1c1c] text-[#fcfbf8] flex items-center justify-center shadow-inner">
            <Moon className="w-4 h-4 text-amber-200 fill-amber-200" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight uppercase text-[#1c1c1c] font-sans">
              Dream Journal
            </h1>
            <p className="text-[10px] text-[#5f5f5d] font-mono uppercase tracking-widest">
              Jungian Analytical Core
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-sans">
          {/* Subtle Stats indicator bar */}
          <div className="hidden sm:flex items-center gap-4 border-l border-[#eceae4] pl-4">
            <div className="flex items-center gap-1">
              <span className="font-mono text-[#1c1c1c] font-bold">{totalAnalyzed}</span>
              <span className="text-[#5f5f5d]">Dreams Logged</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-[#1c1c1c] font-bold">{totalArchetypes}</span>
              <span className="text-[#5f5f5d]">Archetypes Found</span>
            </div>
          </div>

          <button
            onClick={handleCreateNewBlank}
            type="button"
            className="inline-flex items-center gap-1.5 bg-[#1c1c1c] text-[#fcfbf8] text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-[#1c1c1c]/90 transition-all font-sans"
            id="hdr-record-dream-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            New Dream
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Recording Portal, Written Manual Trigger & Historical Log list */}
        <section className="lg:col-span-5 space-y-6">
          
          {/* Brand Introduction Card if first usage */}
          {entries.length === 0 && (
            <div className="bg-[#eceae4]/30 border border-[#eceae4] rounded-xl p-5 mb-2 font-sans space-y-3">
              <div className="flex items-center gap-1.5 text-amber-800">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider font-sans">The Subconscious Mirror</span>
              </div>
              <h2 className="text-xl font-serif font-black italic tracking-tight text-[#1c1c1c]">
                "Until you make the unconscious conscious, it will direct your life and you will call it fate."
              </h2>
              <p className="text-xs text-[#5f5f5d] leading-relaxed">
                Unlock the surrealist imagery and archetypal lessons hidden within your sleeping mind. Work is entirely stored in client local state with server proxies keeping your Gemini API key strictly hidden and secure.
              </p>
            </div>
          )}

          {/* Trigger Portal */}
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1c1c]/60 px-1 font-sans">
              Narrative Portal
            </h2>
            <VoiceRecorder 
              onDreamRecorded={handleDreamNarrativeRecorded} 
              isTranscribing={isTranscribing} 
            />
          </div>

          {/* Past logs navigation sidebar widget */}
          <div className="bg-transparent space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#1c1c1c]/60" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c1c1c]/60 font-sans">
                  Historical Dream Log
                </h3>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">
                {entries.length} items
              </span>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-8 rounded-lg border border-dashed border-[#eceae4] bg-[#f7f4ed]/40">
                <p className="text-xs text-[#5f5f5d] italic font-sans">
                  Your subconscious journal is empty. Write or record a dream to prompt visualization!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {entries.map((item) => {
                  const isActive = item.id === activeEntryId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveEntryId(item.id)}
                      className={`group flex items-center justify-between p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                        isActive
                          ? "bg-[#eceae4]/60 border-[#1c1c1c]/30 shadow-none"
                          : "bg-[#fcfbf8] border-[#eceae4] hover:bg-[#eceae4]/20 hover:border-[#1c1c1c]/20"
                      }`}
                      id={`dream-log-item-${item.id}`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center justify-between pr-3">
                          <span className="text-[10px] text-[#5f5f5d] font-mono leading-none">
                            {item.date}
                          </span>
                          {item.status === "interpreting" && (
                            <span className="text-[9px] text-amber-700 bg-amber-100 rounded px-1 animate-pulse">
                              Decoding...
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-[#1c1c1c] font-sans truncate pr-2">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-[#5f5f5d] truncate">
                          {item.transcript}
                        </p>
                      </div>

                      <div className="flex items-center shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteEntry(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-zinc-400 hover:text-red-700 hover:bg-red-50 transition-all mr-1.5"
                          title="Delete dream entry"
                          id={`del-dream-btn-${item.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className={`w-4 h-4 text-[#1c1c1c]/40 shrink-0 ${isActive ? "text-[#1c1c1c]/80" : ""}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Active content visualization, analysis and follow-up interactive dialog */}
        <section className="lg:col-span-7 space-y-8">
          {activeEntry ? (
            <div className="space-y-8">
              
              {/* Active Dream Info Title card */}
              <div className="bg-[#fcfbf8] border border-[#eceae4] rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-[#5f5f5d] font-mono uppercase tracking-widest">{activeEntry.date}</span>
                  <span className="px-2.5 py-0.5 bg-zinc-100 text-[#1c1c1c]/80 border border-zinc-200/40 rounded-full text-[10px] font-sans font-medium uppercase tracking-tight">
                    Active Dream Record
                  </span>
                </div>
                
                <h2 className="text-xl md:text-2xl font-serif font-black tracking-tight text-[#1c1c1c]">
                  {activeEntry.title}
                </h2>

                <div className="space-y-1 bg-[#f7f4ed]/70 p-3 rounded-lg border border-[#eceae4]/60">
                  <div className="flex gap-1 items-center font-semibold text-xs text-[#1c1c1c]/80 uppercase tracking-wide">
                    <Feather className="w-3.5 h-3.5 text-[#5f5f5d]" />
                    <span>Transcribed Recollection:</span>
                  </div>
                  <p className="text-xs text-gray-800 leading-relaxed italic select-all">
                    "{activeEntry.transcript}"
                  </p>
                </div>

                {activeEntry.audioBlobUrl && (
                  <div className="pt-2 flex items-center gap-3">
                    <span className="text-[10px] uppercase font-mono text-[#5f5f5d]">Recorded Audio:</span>
                    <audio src={activeEntry.audioBlobUrl} controls className="h-6 max-w-full text-xs" />
                  </div>
                )}
              </div>

              {/* Surreal Image Render Visualizer Frame */}
              <SurrealVisualizer
                imageUrl={activeEntry.imageUrl}
                imagePrompt={activeEntry.imagePrompt}
                emotionalTheme={activeEntry.emotionalTheme}
                transcript={activeEntry.transcript}
                isGenerating={activeEntry.status === "interpreting"}
              />

              {/* Structured Psychological Analyser (Archetypes, symbols, dynamics) */}
              {activeEntry.interpretation ? (
                <div className="space-y-6">
                  <div className="border-b border-[#eceae4] pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c1c1c]/60 font-sans">
                      Depth Psychological Analysis
                    </h3>
                  </div>

                  <DreamInterpretation
                    interpretation={activeEntry.interpretation}
                    emotionalTheme={activeEntry.emotionalTheme}
                    onSelectSymbol={handleSelectSymbolForChat}
                  />

                  {/* Archetype Symbol explore chat interface */}
                  <div className="space-y-3 pt-4">
                    <div className="border-b border-[#eceae4] pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c1c1c]/60 font-sans">
                        Follow-Up Psyche Chat
                      </h3>
                    </div>
                    <SymbolChat
                      dreamTranscript={activeEntry.transcript}
                      chatHistory={activeEntry.chatHistory}
                      onSendMessage={handleSendChatMessage}
                      isSending={chatSending}
                    />
                  </div>
                </div>
              ) : activeEntry.status === "interpreting" ? (
                <div className="rounded-xl border border-[#eceae4] bg-[#eceae4]/10 p-12 text-center space-y-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#1c1c1c]/30 border-t-[#1c1c1c] animate-spin mx-auto" />
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-semibold text-[#1c1c1c] font-sans">
                      Aligning subconscious structures...
                    </h4>
                    <p className="text-xs text-[#5f5f5d] max-w-md mx-auto leading-relaxed">
                      Please hold on while our depth psychological model extracts Jungian archetypes, uncovers symbolic meaning, and maps dynamic emotional frictions.
                    </p>
                  </div>
                </div>
              ) : activeEntry.status === "error" ? (
                <div className="bg-red-50 text-red-900 border border-red-200 rounded-xl p-6 text-center space-y-4">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold font-sans">Psychological analysis failure</h4>
                    <p className="text-xs text-red-800 font-sans leading-relaxed">
                      {activeEntry.errorMessage || "The transcription or analytical pipeline failed. This is usually due to a missing or unauthorized server API key."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDreamNarrativeRecorded(activeEntry.transcript)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-950 text-white rounded text-xs font-bold font-sans transition-all"
                  >
                    Retry Archetypal Extraction
                  </button>
                </div>
              ) : null}

            </div>
          ) : (
            // App empty state card
            <div className="h-full min-h-[450px] border border-dashed border-[#eceae4] bg-[#eceae4]/10 rounded-xl flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#eceae4]/45 flex items-center justify-center text-[#1c1c1c]/60">
                <BookOpen className="w-8 h-8" />
              </div>
              
              <div className="space-y-2 max-w-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1c1c1c] font-sans">
                  The Mirror of Psyche is Ready
                </h3>
                <p className="text-xs text-[#5f5f5d] leading-relaxed">
                  Voice-record immediately upon waking or input your freehand narrative using the panel on the left to activate your surrealist imagery canvas, archetypal symbols glossary, and depth exploring chat bot.
                </p>
              </div>

              {/* Guide steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-4 max-w-lg">
                <div className="bg-[#fcfbf8] p-3.5 border border-[#eceae4] rounded-lg text-left space-y-1">
                  <div className="text-xs font-mono font-bold text-[#1c1c1c]/40">01 / LOG</div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#1c1c1c]">Speak fresh thoughts</h4>
                  <p className="text-[10px] text-[#5f5f5d] leading-relaxed">Record your raw, unaltered visual memories.</p>
                </div>
                <div className="bg-[#fcfbf8] p-3.5 border border-[#eceae4] rounded-lg text-left space-y-1">
                  <div className="text-xs font-mono font-bold text-[#1c1c1c]/40">02 / LOOK</div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#1c1c1c]">Surreal Vision</h4>
                  <p className="text-[10px] text-[#5f5f5d] leading-relaxed">View generated surrealist oil-paint themes.</p>
                </div>
                <div className="bg-[#fcfbf8] p-3.5 border border-[#eceae4] rounded-lg text-left space-y-1">
                  <div className="text-xs font-mono font-bold text-[#1c1c1c]/40">03 / GROW</div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#1c1c1c]">Jungian Analyst</h4>
                  <p className="text-[10px] text-[#5f5f5d] leading-relaxed">Chat to explore symbols with expert depth guides.</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Humble Footer */}
      <footer className="mt-auto border-t border-[#eceae4] bg-[#eceae4]/20 py-6 px-4 text-center text-[10px] text-[#5f5f5d] font-mono leading-relaxed">
        <p className="uppercase tracking-wider">Dream Journal &copy; 2026 — Depth Psychology & Surrealist Imagery Synthesis Core</p>
        <p className="text-[#1c1c1c]/40 mt-1 uppercase">Cream Canvas Theme — Crafted with human-focused design restrains</p>
      </footer>
    </div>
  );
}
