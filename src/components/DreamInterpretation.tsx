/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Archetype, DreamSymbol, PsychologicalInterpretation } from "../types";
import { Sparkles, MessageCircle, HelpCircle, Compass, Shield, Activity } from "lucide-react";

interface DreamInterpretationProps {
  interpretation: PsychologicalInterpretation;
  emotionalTheme: string;
  onSelectSymbol: (symbolName: string) => void;
}

export default function DreamInterpretation({
  interpretation,
  emotionalTheme,
  onSelectSymbol,
}: DreamInterpretationProps) {
  const { summary, archetypes, symbols, dynamics, guidance } = interpretation;

  return (
    <div className="space-y-6 font-sans">
      {/* Narrative Summary Header */}
      <div className="bg-[#eceae4]/20 border border-[#eceae4] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <h4 className="text-sm font-semibold uppercase tracking-wider text-[#1c1c1c]/80 font-sans">
            Subconscious Overview
          </h4>
        </div>
        <p className="text-sm font-sans text-gray-800 leading-relaxed leading-6 mb-4">
          {summary}
        </p>
        <div className="flex border-t border-[#eceae4] pt-4 items-center justify-between">
          <span className="text-[11px] font-mono text-[#5f5f5d]">EMOTIONAL WAVELENGTH:</span>
          <span className="text-xs px-2.5 py-1 bg-[#1c1c1c]/5 border border-[#1c1c1c]/10 rounded-full font-serif font-semibold italic text-[#1c1c1c]/80">
            {emotionalTheme || "Vague surrealism"}
          </span>
        </div>
      </div>

      {/* Manifesting Archetypes Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 px-1">
          <Shield className="w-4 h-4 text-[#1c1c1c]/60" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1c1c1c]/60 font-sans">
            Manifesting Jungian Archetypes
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {archetypes && archetypes.length > 0 ? (
            archetypes.map((arch: Archetype, idx: number) => (
              <div
                key={idx}
                className="bg-[#f7f4ed] border border-[#eceae4] hover:border-[#1c1c1c]/30 rounded-lg p-4 transition-all"
              >
                <div className="flex justify-between items-start gap-1 mb-2">
                  <h5 className="text-xs font-semibold text-[#1c1c1c] font-sans font-mono tracking-tight bg-[#1c1c1c]/5 px-2 py-0.5 rounded">
                    {arch.name}
                  </h5>
                  <span className="text-[10px] text-[#5f5f5d] italic font-sans">Archetype</span>
                </div>
                <p className="text-xs text-[#5f5f5d] mb-2 leading-relaxed">
                  {arch.description}
                </p>
                <div className="border-t border-[#eceae4]/60 pt-2 text-xs text-gray-800 leading-relaxed">
                  <span className="font-semibold block text-[10px] text-[#1c1c1c]/70 uppercase tracking-wide mb-0.5">Manifestation:</span>
                  {arch.meaning}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center text-xs text-zinc-400 py-3 italic">
              No prominent archetypal forces detected in current dream structure.
            </div>
          )}
        </div>
      </div>

      {/* Symbol Glossaries (Interactive Trigger) */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 px-1 justify-between">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-[#1c1c1c]/60" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1c1c1c]/60 font-sans">
              Dream Symbol Definitions
            </h4>
          </div>
          <span className="text-[10px] text-[#5f5f5d]/70 font-sans italic">
            Tap message to invoke Chat exploring symbol
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {symbols && symbols.length > 0 ? (
            symbols.map((sym: DreamSymbol, idx: number) => (
              <div
                key={idx}
                className="group relative bg-[#fcfbf8] border border-[#eceae4] rounded-lg p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all hover:bg-[#eceae4]/20"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono tracking-wider text-[#1c1c1c] border-b border-[#1c1c1c] pb-0.5">
                      {sym.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-800 leading-relaxed">
                    <span className="font-medium text-[#1c1c1c]/70">Archetypal Meaning:</span> {sym.meaning}
                  </p>
                  <p className="text-xs text-[#5f5f5d] italic leading-relaxed">
                    <span className="font-semibold font-sans text-[10px] text-[#1c1c1c]/60 uppercase tracking-tight not-italic block mb-0.5">Self-Reflection prompt:</span>
                    "{sym.association}"
                  </p>
                </div>

                {/* Question Trigger Button */}
                <button
                  type="button"
                  onClick={() => onSelectSymbol(sym.name)}
                  className="self-end md:self-center inline-flex items-center gap-1 text-[11px] font-sans font-medium hover:text-[#fcfbf8] hover:bg-[#1c1c1c] text-[#1c1c1c] bg-[#1c1c1c]/5 px-2.5 py-1 rounded border border-[#eceae4] transition-all"
                  title="Ask AI follow-up chat about this dream symbol"
                  id={`ask-symbol-btn-${sym.name.replace(/\s+/g, '-')}`}
                >
                  <MessageCircle className="w-3 h-3" />
                  Explore Symbol
                </button>
              </div>
            ))
          ) : (
            <div className="text-center text-xs text-zinc-400 py-3 italic">
              No distinct archetypal symbols found in the dream narrative.
            </div>
          )}
        </div>
      </div>

      {/* Psychological Dynamics & Guidances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Psychological Dynamics */}
        <div className="bg-[#f7f4ed] border border-[#eceae4] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-purple-700" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#1c1c1c] font-sans">
              Dream Dynamics & Stance
            </h5>
          </div>
          <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line">
            {dynamics}
          </p>
        </div>

        {/* Actionable Integration Exercises */}
        <div className="bg-[#f0ece3] border border-[#eceae4] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="w-4 h-4 text-emerald-800" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#1c1c1c] font-sans">
              Active Growth & Integration
            </h5>
          </div>
          <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line">
            {guidance}
          </p>
        </div>
      </div>
    </div>
  );
}
