/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, AlertCircle, Sparkles, Send, Keyboard } from "lucide-react";

interface VoiceRecorderProps {
  onDreamRecorded: (transcriptText: string, audioUrl?: string, audioBase64?: string) => void;
  isTranscribing: boolean;
}

export default function VoiceRecorder({ onDreamRecorded, isTranscribing }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [manualText, setManualText] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Timer logic
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Procedural voice waves anim
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth || 300);
    let height = (canvas.height = 40);

    let phase = 0;

    const drawWave = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(28, 28, 28, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      let amp = isRecording ? 18 : 3;
      phase += isRecording ? 0.15 : 0.05;

      for (let x = 0; x < width; x++) {
        // Simple trigonometric wave simulation
        const y = height / 2 + Math.sin(x * 0.05 + phase) * amp * Math.cos(x * 0.01);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Additional secondary wave for depth effect
      ctx.strokeStyle = "rgba(180, 120, 80, 0.25)";
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * 0.04 - phase * 0.8) * (amp * 0.7) * Math.sin(x * 0.015);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      animationRef.current = requestAnimationFrame(drawWave);
    };

    drawWave();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    audioChunksRef.current = [];
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Voice recording is not fully supported in this browser environment. Please use Text manual fallback.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const localUrl = URL.createObjectURL(audioBlob);

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          // Extract plain base64 without headers (e.g. data:audio/webm;base64,xxxx)
          const rawBase64 = base64data.split(",")[1];
          
          await transcribeAudio(rawBase64, localUrl);
        };

        // Stop all stream tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Could not access microphone. Ensure permissions are allowed.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (base64Audio: string, localUrl: string) => {
    try {
      // Call standard server transcription API
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio: base64Audio,
          mimeType: "audio/webm"
        })
      });

      if (!response.ok) {
        throw new Error("Server failed to transcribe this dream audio.");
      }

      const data = await response.json();
      if (data.transcript && data.transcript.length > 5 && !data.transcript.includes("[Noise")) {
        onDreamRecorded(data.transcript, localUrl, base64Audio);
      } else {
        throw new Error("Transcription resulted in empty text. Please try speaking closer or use Manual writing.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed transcribing the recording. Please write manually.");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualText.trim().length < 10) {
      setErrorMessage("Please enter a more descriptive narrative of your dream (at least 10 characters).");
      return;
    }
    onDreamRecorded(manualText, undefined, undefined);
    setManualText("");
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  return (
    <div className="bg-[#f7f4ed] border border-[#eceae4] rounded-xl p-5 shadow-sm font-sans flex flex-col">
      {/* Modes Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1c1c1c]/70 font-sans">
          Record Dream Narrative
        </h3>
        <div className="flex gap-1.5 bg-[#eceae4]/40 p-1 rounded-md">
          <button
            type="button"
            onClick={() => { setMode("voice"); setErrorMessage(null); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium font-sans border transition-all ${
              mode === "voice"
                ? "bg-[#1c1c1c] text-[#fcfbf8] border-[#1c1c1c]"
                : "text-[#5f5f5d] border-transparent hover:text-[#1c1c1c]"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Voice Recorder
          </button>
          <button
            type="button"
            onClick={() => { setMode("text"); setErrorMessage(null); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium font-sans border transition-all ${
              mode === "text"
                ? "bg-[#1c1c1c] text-[#fcfbf8] border-[#1c1c1c]"
                : "text-[#5f5f5d] border-transparent hover:text-[#1c1c1c]"
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            Write Freehand
          </button>
        </div>
      </div>

      {mode === "voice" ? (
        <div className="flex flex-col items-center justify-center py-6 gap-5">
          {/* Wave visualizer */}
          <canvas ref={canvasRef} className="w-full max-w-sm h-10 block opacity-80" />

          {/* Recording Timer */}
          <div className="text-2xl font-mono tracking-wider font-light text-[#1c1c1c]/80">
            {formatTimer(recordTime)}
          </div>

          {/* Core Recording Trigger */}
          <div className="relative">
            {isRecording && (
              <span className="absolute -inset-2 rounded-full bg-red-400/20 animate-ping" />
            )}
            <button
              id="voice-recorder-toggle"
              type="button"
              disabled={isTranscribing}
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-sm ${
                isRecording 
                  ? "bg-red-600 text-white hover:bg-red-700 animate-pulse" 
                  : "bg-[#1c1c1c] text-[#fcfbf8] hover:bg-[#1c1c1c]/90 active:scale-95 disabled:opacity-40"
              }`}
            >
              {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs text-[#5f5f5d] font-sans">
              {isRecording
                ? "Tap the red square to stop recording and begin Jungian transcribing"
                : isTranscribing
                ? "Sending subconscious frequency to transcription core..."
                : "Tap microphone to record dream thoughts immediately upon waking"}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            disabled={isTranscribing}
            placeholder="Type your dream details, symbols, atmosphere, and sequences here..."
            className="w-full min-h-[140px] bg-transparent text-[#1c1c1c] placeholder-[#5f5f5d]/70 text-sm p-3 border border-[#eceae4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]/40 font-sans leading-relaxed resize-none"
            id="dream-freehand-textarea"
          />
          <button
            type="submit"
            disabled={isTranscribing || manualText.trim().length === 0}
            className="self-end inline-flex items-center gap-2 px-4 py-2 bg-[#1c1c1c] hover:bg-[#1c1c1c]/90 text-[#fcfbf8] text-xs font-semibold rounded-md shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1c1c1c]/40 disabled:opacity-45"
            id="dream-freehand-submit"
          >
            <Send className="w-3.5 h-3.5" />
            Analyze Written Dream
          </button>
        </form>
      )}

      {/* Error state warnings */}
      {errorMessage && (
        <div className="mt-4 flex gap-2 items-start bg-red-50 text-red-800 p-3 rounded-lg text-xs leading-relaxed border border-red-200">
          <AlertCircle className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
          <div className="space-y-1 font-sans">
            <p className="font-semibold text-red-900">Issue detected</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {isTranscribing && (
        <div className="mt-4 flex gap-2 items-center bg-[#eceae4]/30 p-3 rounded-lg text-xs font-sans text-[#1c1c1c]/80 animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Synchronizing narration with deep psyche networks...</span>
        </div>
      )}
    </div>
  );
}
