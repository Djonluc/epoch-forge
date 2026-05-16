import React from 'react';
import { audioService } from '../services/audio';

export const DjonStNixLogo: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <a
            href="https://www.youtube.com/@Djonluc"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => audioService.playInteraction()}
            className={`relative inline-block hover:scale-105 transition-transform duration-300 ${className}`}
        >
            <svg
                width="240"
                height="60"
                viewBox="0 0 240 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="filter drop-shadow-[0_0_8px_rgba(91,140,255,0.8)]"
            >
                {/* ... existing SVG content ... */}
                {/* Animated Background Path */}
                <path
                    d="M10 10H230V50H10V10Z"
                    stroke="#5B8CFF"
                    strokeWidth="1"
                    strokeDasharray="600"
                    strokeDashoffset="600"
                    className="animate-[draw_2s_ease-in-out_forwards] opacity-20"
                />

                {/* Corner Accents */}
                <path d="M5 15V5H15" stroke="#5B8CFF" strokeWidth="2" className="animate-pulse" />
                <path d="M225 5H235V15" stroke="#5B8CFF" strokeWidth="2" className="animate-pulse" />
                <path d="M235 45V55H225" stroke="#5B8CFF" strokeWidth="2" className="animate-pulse" />
                <path d="M15 55H5V45" stroke="#5B8CFF" strokeWidth="2" className="animate-pulse" />

                {/* Binary Stream Decoration (Faint) */}
                <text x="20" y="20" fill="#5B8CFF" fontSize="6" fontFamily="monospace" className="opacity-10 animate-pulse">10110</text>
                <text x="200" y="50" fill="#5B8CFF" fontSize="6" fontFamily="monospace" className="opacity-10 animate-pulse">01001</text>

                {/* The Text */}
                <text
                    x="50%"
                    y="50%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fill="white"
                    fontSize="28"
                    fontWeight="900"
                    letterSpacing="2"
                    fontFamily="'Inter', sans-serif"
                    className="tracking-tighter"
                >
                    Djon
                    <tspan fill="#5B8CFF" className="animate-pulse">St</tspan>
                    Nix
                </text>

                {/* Glitch Overlay Text (Slightly Offset) */}
                <text
                    x="50.5%"
                    y="50.5%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fill="#FF00FF"
                    fontSize="28"
                    fontWeight="900"
                    letterSpacing="2"
                    fontFamily="'Inter', sans-serif"
                    className="opacity-0 animate-[glitch_4s_infinite] pointer-events-none"
                    style={{ mixBlendMode: 'screen' }}
                >
                    DjonStNix
                </text>
            </svg>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes glitch {
          0%, 90%, 100% { opacity: 0; transform: translate(0); }
          91% { opacity: 0.5; transform: translate(-2px, 1px); }
          92% { opacity: 0.5; transform: translate(2px, -1px); }
          93% { opacity: 0; transform: translate(0); }
        }
      `}} />
        </a>
    );
};
