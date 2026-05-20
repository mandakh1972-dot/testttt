/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Send, Sparkles, User, HelpCircle, Loader, MessageSquare } from "lucide-react";

interface SymbolChatProps {
  dreamTranscript: string;
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => void;
  isSending: boolean;
}

const TEMPLATE_SUGGESTIONS = [
  "How can I integrate the Shadow element in this dream?",
  "What is the deeper message behind the environment?",
  "Are these symbols predicting future outcomes?",
  "How do I practice active imagination with these elements?",
];

export default function SymbolChat({
  dreamTranscript,
  chatHistory,
  onSendMessage,
  isSending,
}: SymbolChatProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever history updates or isSending triggers
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleSuggestionClick = (phrase: string) => {
    if (isSending) return;
    onSendMessage(phrase);
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#f7f4ed] border border-[#eceae4] rounded-xl overflow-hidden shadow-sm font-sans">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#eceae4]/30 border-b border-[#eceae4]/80">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#1c1c1c]/70" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1c1c1c]/70 font-sans">
            Symbolic Dream Interpretation Coach
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] bg-[#1c1c1c]/5 text-[#1c1c1c]/70 px-2 py-0.5 rounded font-medium">
          <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" />
          Depth Psychology Core
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <HelpCircle className="w-8 h-8 text-[#5f5f5d]/50" />
            <div className="space-y-1 max-w-sm">
              <h5 className="text-xs font-semibold text-[#1c1c1c]">Ask about your subconsious symbols</h5>
              <p className="text-xs text-[#5f5f5d] leading-relaxed">
                Click symbol buttons above or select a preset prompt below to launch a psychological deep dive dialog into this dream.
              </p>
            </div>
            
            {/* Quick action buttons / suggestions */}
            <div className="w-full pt-4 max-w-sm grid grid-cols-1 gap-2">
              {TEMPLATE_SUGGESTIONS.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(phrase)}
                  className="w-full text-left text-xs bg-[#1c1c1c]/5 border border-[#eceae4] hover:bg-[#1c1c1c]/10 hover:border-[#1c1c1c]/20 rounded-lg p-2.5 transition-all text-[#1c1c1c]/80"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-[#eceae4] ${
                    msg.role === "user"
                      ? "bg-[#1c1c1c] text-white"
                      : "bg-[#e8dec9] text-[#1c1c1c]/80"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Message body */}
                <div className="space-y-1 text-xs">
                  <div
                    className={`rounded-lg p-3 leading-relaxed whitespace-pre-wrap select-text ${
                      msg.role === "user"
                        ? "bg-[#1c1c1c] text-[#fcfbf8] rounded-tr-none"
                        : "bg-[#eceae4]/50 text-gray-800 border border-[#eceae4]/70 rounded-tl-none font-sans"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div
                    className={`text-[9px] text-[#5f5f5d]/50 ${
                      msg.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex gap-3 max-w-[85%] justify-start">
                <div className="w-7 h-7 rounded-full bg-[#e8dec9] border border-[#eceae4] flex items-center justify-center shrink-0">
                  <Loader className="w-3.5 h-3.5 animate-spin text-[#1c1c1c]" />
                </div>
                <div className="bg-[#eceae4]/30 rounded-lg p-3 text-xs text-[#5f5f5d]/70 rounded-tl-none animate-pulse">
                  Exploring inner realms...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Suggested Pill Prompts directly above typing input for user convenience */}
      {chatHistory.length > 0 && (
        <div className="px-4 py-2 border-t border-[#eceae4]/70 bg-[#f7f4ed]/60 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {TEMPLATE_SUGGESTIONS.slice(0, 3).map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isSending}
              onClick={() => handleSuggestionClick(phrase)}
              className="shrink-0 text-[10px] bg-[#1c1c1c]/5 hover:bg-[#1c1c1c]/10 text-gray-700 px-3 py-1.5 rounded-full border border-[#eceae4] transition-all disabled:opacity-40"
            >
              {phrase}
            </button>
          ))}
        </div>
      )}

      {/* Input container */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-[#eceae4]/45 border-t border-[#eceae4] flex gap-2 items-center"
      >
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isSending || !dreamTranscript}
          type="text"
          placeholder={
            dreamTranscript
              ? "Ask about a figure, symbol, or sensation..."
              : "Analyze a dream first to unlock exploration chat"
          }
          className="flex-1 bg-transparent text-[#1c1c1c] placeholder-[#5f5f5d]/70 text-xs p-2.5 border border-[#eceae4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]/30 font-sans"
          id="symbol-chat-input"
        />
        <button
          type="submit"
          disabled={isSending || !inputText.trim() || !dreamTranscript}
          className="p-2.5 rounded-lg bg-[#1c1c1c] text-[#fcfbf8] hover:bg-[#1c1c1c]/90 disabled:opacity-35 transition-all shadow-sm flex items-center justify-center"
          id="symbol-chat-submit"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
