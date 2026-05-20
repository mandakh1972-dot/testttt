/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";
import { Sparkles, Image as ImageIcon, HelpCircle } from "lucide-react";

interface SurrealVisualizerProps {
  imageUrl?: string;
  imagePrompt?: string;
  emotionalTheme: string;
  transcript: string;
  isGenerating: boolean;
}

export default function SurrealVisualizer({
  imageUrl,
  imagePrompt,
  emotionalTheme,
  transcript,
  isGenerating,
}: SurrealVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useCanvas, setUseCanvas] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setUseCanvas(true);
    } else {
      setUseCanvas(false);
    }
  }, [imageUrl]);

  // Procedural canvas rendering on fallback
  useEffect(() => {
    if (!useCanvas || isGenerating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = 600);
    let height = (canvas.height = 600);

    // Parse emotional colors based on theme words
    const theme = (emotionalTheme + " " + transcript).toLowerCase();
    let primaryColor = "rgba(40, 30, 70, 0.8)"; // deep indigo/purple
    let secondaryColor = "rgba(180, 120, 80, 0.6)"; // sand/dali gold
    let accentColor = "rgba(230, 100, 100, 0.7)"; // anxious red/orange

    if (theme.includes("anxious") || theme.includes("fear") || theme.includes("scared") || theme.includes("chase") || theme.includes("run")) {
      primaryColor = "rgba(28, 10, 10, 0.95)"; // dark void
      secondaryColor = "rgba(220, 60, 60, 0.7)"; // crimson
      accentColor = "rgba(255, 140, 0, 0.6)"; // anxiety orange
    } else if (theme.includes("fly") || theme.includes("high") || theme.includes("sky") || theme.includes("peace") || theme.includes("calm")) {
      primaryColor = "rgba(10, 40, 80, 0.8)"; // celestial blue
      secondaryColor = "rgba(240, 244, 210, 0.7)"; // moon cream
      accentColor = "rgba(130, 200, 240, 0.6)"; // airy cyan
    } else if (theme.includes("forest") || theme.includes("tree") || theme.includes("nature") || theme.includes("water") || theme.includes("sea")) {
      primaryColor = "rgba(10, 50, 40, 0.9)"; // deep emerald
      secondaryColor = "rgba(40, 110, 90, 0.6)"; // mist green
      accentColor = "rgba(212, 175, 55, 0.6)"; // gold reflections
    }

    // Creating procedural surreal elements
    // Particle class for surreal floating debris (Dali-style clocks, eyes, roots)
    class SurrealElement {
      x: number;
      y: number;
      size: number;
      angle: number;
      speedY: number;
      speedRot: number;
      type: "eye" | "clock" | "droplet" | "float";

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 25 + 10;
        this.angle = Math.random() * Math.PI * 2;
        this.speedY = -(Math.random() * 0.4 + 0.1);
        this.speedRot = (Math.random() - 0.5) * 0.01;
        const types: Array<"eye" | "clock" | "droplet" | "float"> = ["eye", "clock", "droplet", "float"];
        this.type = types[Math.floor(Math.random() * types.length)];
      }

      update() {
        this.y += this.speedY;
        this.angle += this.speedRot;
        if (this.y < -50) {
          this.y = height + 50;
          this.x = Math.random() * width;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.angle);
        c.strokeStyle = secondaryColor;
        c.lineWidth = 1.5;

        if (this.type === "clock") {
          // Melted clock silhouette
          c.beginPath();
          c.ellipse(0, 0, this.size, this.size * 1.5, Math.PI / 6, 0, Math.PI * 2);
          c.fillStyle = "rgba(247, 244, 237, 0.85)";
          c.fill();
          c.stroke();
          // hands
          c.beginPath();
          c.moveTo(0, 0);
          c.lineTo(0, -this.size * 0.8);
          c.moveTo(0, 0);
          c.lineTo(this.size * 0.5, this.size * 0.3);
          c.stroke();
        } else if (this.type === "eye") {
          // Surreal eye of Horus/Subconscious
          c.beginPath();
          c.moveTo(-this.size, 0);
          c.quadraticCurveTo(0, -this.size * 0.6, this.size, 0);
          c.quadraticCurveTo(0, this.size * 0.6, -this.size, 0);
          c.stroke();
          // Iris
          c.beginPath();
          c.arc(0, 0, this.size * 0.35, 0, Math.PI * 2);
          c.fillStyle = accentColor;
          c.fill();
          c.stroke();
          // Pupil
          c.beginPath();
          c.arc(0, 0, this.size * 0.15, 0, Math.PI * 2);
          c.fillStyle = "#1c1c1c";
          c.fill();
        } else if (this.type === "droplet") {
          // Tear or dimensional mercury droplet
          c.beginPath();
          c.moveTo(0, -this.size);
          c.quadraticCurveTo(this.size * 0.6, 0, 0, this.size);
          c.quadraticCurveTo(-this.size * 0.6, 0, 0, -this.size);
          c.fillStyle = "rgba(255, 255, 255, 0.45)";
          c.fill();
          c.stroke();
        } else {
          // Ethereal circular frame
          c.beginPath();
          c.arc(0, 0, this.size * 0.8, 0, Math.PI * 2);
          c.fillStyle = "rgba(28, 28, 28, 0.05)";
          c.fill();
          c.stroke();
        }
        c.restore();
      }
    }

    const elements: SurrealElement[] = Array.from({ length: 15 }, () => new SurrealElement());

    const drawThemeBackground = () => {
      // Cosmic gradient base
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        width * 0.8
      );
      grad.addColorStop(0, primaryColor);
      grad.addColorStop(0.5, "rgba(28, 28, 28, 0.95)");
      grad.addColorStop(1, "#1c1c1c");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw a giant mystical eye of subconscious in background center
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.strokeStyle = "rgba(247, 244, 237, 0.13)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 180, 0, Math.PI * 2);
      ctx.stroke();

      // Soft surreal eclipse
      ctx.beginPath();
      ctx.arc(-20, -10, 110, 0, Math.PI * 2);
      ctx.fillStyle = secondaryColor;
      ctx.filter = "blur(18px)";
      ctx.fill();
      ctx.restore();
      ctx.filter = "none";
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      drawThemeBackground();

      // Render elements
      elements.forEach((elem) => {
        elem.update();
        elem.draw(ctx);
      });

      // Overlay text title procedurally, very elegantly
      ctx.fillStyle = "rgba(247, 244, 237, 0.85)";
      ctx.font = "italic 400 16px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`“${emotionalTheme}”`, width / 2, height - 35);

      ctx.fillStyle = "rgba(247, 244, 237, 0.35)";
      ctx.font = "11px ui-monospace, SFMono-Regular, monospace";
      ctx.fillText("PROCEDURAL SUBCONSCIOUS PROTOTYPE", width / 2, height - 15);

      animationId = requestAnimationFrame(render);
    };

    render();

    // Responsive resize handler
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = canvas.width = entry.contentRect.width || 600;
        height = canvas.height = entry.contentRect.height || 600;
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [useCanvas, emotionalTheme, transcript, isGenerating]);

  return (
    <div className="flex flex-col h-full bg-[#f7f4ed] border border-[#eceae4] rounded-xl overflow-hidden shadow-sm">
      {/* Visual Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#eceae4]/30 border-b border-[#eceae4]">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#1c1c1c]/70" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1c1c1c]/70 font-sans">
            Core Emotional Vision
          </span>
        </div>
        {!imageUrl && !isGenerating && (
          <span className="inline-flex items-center gap-1 text-[10px] bg-[#1c1c1c]/5 text-[#1c1c1c]/60 px-2 py-0.5 rounded font-mono">
            Procedural Canvas
          </span>
        )}
      </div>

      <div className="relative flex-1 flex items-center justify-center bg-zinc-900 overflow-hidden aspect-square w-full">
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#1c1c1c]/95 z-20 px-6 text-center">
            {/* Spinning/pulsating dream visualizer placeholder */}
            <div className="relative w-16 h-16 rounded-full border border-orange-200/25 flex items-center justify-center animate-spin duration-3000">
              <div className="absolute w-8 h-8 rounded-full border border-dashed border-sky-400 animate-pulse" />
              <Sparkles className="w-4 h-4 text-orange-200 animate-bounce" />
            </div>
            <div className="space-y-1">
              <p className="text-[#f7f4ed] text-sm font-sans tracking-tight animate-pulse font-medium">
                Drafting your surreal subconscious imagery...
              </p>
              <p className="text-zinc-400 text-[11px] max-w-xs leading-relaxed font-sans">
                Formulating symbols, casting archetypal palettes, and invoking surrealist art elements.
              </p>
            </div>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={emotionalTheme || "Subconscious Dream Illustration"}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            referrerPolicy="no-referrer"
            id="dream-surreal-image"
          />
        ) : (
          <canvas
            ref={canvasRef}
            className="w-full h-full block bg-[#1c1c1c] cursor-pointer"
            id="dream-procedural-canvas"
          />
        )}
      </div>

      {imagePrompt && (
        <div className="p-3 bg-[#eceae4]/20 border-t border-[#eceae4] text-xs text-[#5f5f5d] font-sans leading-relaxed">
          <div className="flex items-center gap-1.5 font-medium text-[#1c1c1c]/80 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Surrealist Prompt:</span>
          </div>
          <p className="italic font-sans text-[11px] leading-relaxed">
            "{imagePrompt}"
          </p>
        </div>
      )}
    </div>
  );
}
