/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DreamEntry } from "../types";
import { BookOpen, Plus, Trash2, Calendar, Smile, AlertCircle } from "lucide-react";

interface DreamHistoryProps {
  entries: DreamEntry[];
  activeId: string | null;
  onSelectEntry: (id: string) => void;
  onNewEntry: () => void;
  onDeleteEntry: (id: string) => void;
}

export default function DreamHistory({
  entries,
  activeId,
  onSelectEntry,
  onNewEntry,
  onDeleteEntry,
}: DreamHistoryProps) {
  
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Dawn of Awakening";
    }
  };

  return (
    <div className="flex flex-col h-full font-sans border border-[#eceae4] bg-[#f7f4ed] rounded-xl overflow-hidden shadow-sm">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#eceae4]/30 border-b border-[#eceae4]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#1c1c1c]/80" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1c1c1c]/90">
            Dream Archives
          </h2>
        </div>
        <button
          type="button"
          onClick={onNewEntry}
          className="p-1.5 rounded-full bg-[#1c1c1c] text-[#fcfbf8] hover:bg-[#1c1c1c]/80 transition-all font-sans inline-flex items-center justify-center shadow-sm hover:scale-105 active:scale-95"
          title="Log standard new dream"
          id="new-dream-cta-button"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[400px] md:max-h-[600px] lg:max-h-none no-scrollbar">
        {entries.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-[#5f5f5d]/35" />
            <p className="text-xs text-[#5f5f5d]/85 max-w-[180px] mx-auto font-sans leading-relaxed">
              Subconscious annals are currently vacant. Capture your first dream.
            </p>
          </div>
        ) : (
          entries.map((entry) => {
            const isActive = entry.id === activeId;
            return (
              <div
                key={entry.id}
                className={`group relative p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isActive
                    ? "bg-[#eceae4]/80 border-[#1c1c1c]/60"
                    : "bg-[#fcfbf8] border-[#eceae4] hover:bg-[#eceae4]/30"
                }`}
                onClick={() => onSelectEntry(entry.id)}
              >
                {/* Header info */}
                <div className="flex justify-between items-start gap-1 pr-[22px]">
                  <h4 className="text-[13px] font-semibold text-[#1c1c1c] line-clamp-1 font-sans">
                    {entry.title || "Untitled Vision"}
                  </h4>
                  <span className="text-[9px] text-[#5f5f5d] shrink-0 font-mono flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    {formatDate(entry.date)}
                  </span>
                </div>

                {/* Subtext preview */}
                <p className="text-xs text-[#5f5f5d] line-clamp-2 leading-relaxed">
                  {entry.transcript || "Narration pending..."}
                </p>

                {/* Badges / footer icons */}
                <div className="flex items-center justify-between pt-1 text-[9px] font-mono border-t border-[#eceae4]/50">
                  <span className="inline-flex items-center gap-1 text-[#1c1c1c]/70 font-semibold italic">
                    <Smile className="w-2.5 h-2.5" />
                    {entry.emotionalTheme || "Explorative"}
                  </span>
                  
                  {/* Status Indicator */}
                  {entry.status === "recording" && (
                    <span className="text-red-600 animate-pulse font-bold">● Rec</span>
                  )}
                  {entry.status === "transcribing" && (
                    <span className="text-amber-700 animate-pulse">Transcribing...</span>
                  )}
                  {entry.status === "interpreting" && (
                    <span className="text-sky-700 animate-pulse">Interpreting...</span>
                  )}
                  {entry.status === "ready" && (
                    <span className="text-emerald-700 font-medium">Analyzed</span>
                  )}
                  {entry.status === "error" && (
                    <span className="text-red-700 inline-flex items-center gap-1">
                      <AlertCircle className="w-2 h-2" /> Error
                    </span>
                  )}
                </div>

                {/* Trash delete button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Are you sure you wish to delete this dream log?")) {
                      onDeleteEntry(entry.id);
                    }
                  }}
                  className="absolute right-2 top-2 bg-transparent hover:bg-red-50 text-[#5f5f5d]/70 hover:text-red-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete log entry"
                  id={`delete-dream-${entry.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
