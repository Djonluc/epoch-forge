import React, { useState } from 'react';
import { PlayerCiv, GeneratedItem, Difficulty } from '../types';
import { HEADINGS } from '../constants';
import { StrengthBar } from './StrengthBar';
import {
    RefreshCw,
    ChevronDown,
    ChevronRight,
    Copy,
    Check,
    Eye,
    HelpCircle,
    AlertTriangle,
    ListChecks
} from 'lucide-react';

interface Props {
    civ: PlayerCiv;
    onReroll: () => void;
    index: number; // For layout staggering
    isCompact?: boolean;
    isTournament?: boolean;
}

export const CivCard: React.FC<Props> = ({ civ, onReroll, index, isCompact = false, isTournament = false }) => {
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showReasoning, setShowReasoning] = useState(false);

    // Group items
    const groupedItems: Record<string, GeneratedItem[]> = {};
    civ.items.forEach(item => {
        const key = item.category || "Civilization Powers";
        if (!groupedItems[key]) groupedItems[key] = [];
        groupedItems[key].push(item);
    });

    // In-Game Checklist Format
    const handleCopy = () => {
        let text = `CIV BUILDER CHECKLIST - ${civ.playerName}\n`;
        text += `Archetype: ${civ.summary} (Power: ${civ.powerScore})\n`;
        text += `----------------------------------------\n`;

        // Flatten list
        civ.items.forEach((item, i) => {
            text += `${i + 1}. [ ] ${item.name} (${item.cost})\n`;
        });

        text += `\nRemaining Points: ${100 - civ.pointsSpent}\n`;

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Determine Accent Color based on Primary Category
    const getAccentColor = (category: string) => {
        if (category.includes("Economy") || category.includes("Citizens")) return "border-emerald-500/40 shadow-[0_8px_30px_rgb(16,185,129,0.1)]";
        if (category.includes("Buildings") || category.includes("General") || category.includes("Religion")) return "border-indigo-500/40 shadow-[0_8px_30px_rgb(99,102,241,0.1)]";
        // Default Military
        return "border-rose-500/40 shadow-[0_8px_30px_rgb(244,63,94,0.1)]";
    };

    // Emoji Archetype
    const getArchetypeEmoji = (category: string) => {
        if (category.includes("Economy")) return "🌾";
        if (category.includes("Citizens")) return "🛖";
        if (category.includes("Buildings")) return "🧱";
        if (category.includes("Infantry")) return "⚔️";
        if (category.includes("Cavalry")) return "🐎";
        if (category.includes("Siege")) return "☄️";
        if (category.includes("Tanks")) return "🚜"; // or tank icon if available
        if (category.includes("Aircraft")) return "✈️";
        if (category.includes("Ships")) return "⚓";
        if (category.includes("Cyber")) return "🤖";
        if (category.includes("Religion")) return "🕌";
        return "🏛️";
    };

    const accentClass = getAccentColor(civ.primaryCategory);
    const archetypeEmoji = getArchetypeEmoji(civ.primaryCategory);

    // Formatting helper
    const getIdentityTag = (cat: string) => {
        const base = cat.split('–')[0].trim();
        return `${archetypeEmoji} ${base}-Focused`;
    };

    // Score Color Logic
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
        if (score >= 50) return "text-amber-400 bg-amber-400/10 border-amber-400/20";
        return "text-rose-400 bg-rose-400/10 border-rose-400/20";
    };

    // Difficulty Dot
    const getDifficultyColor = (diff: Difficulty) => {
        if (diff === 'Beginner') return 'bg-emerald-500';
        if (diff === 'Intermediate') return 'bg-amber-500';
        return 'bg-rose-500';
    };

    // Helper for cost tooltip
    const getCostExplanation = (item: GeneratedItem) => {
        if (!item.inflationApplied || item.inflationApplied <= 0) return undefined;
        if (!item.category) return undefined;

        const heading = HEADINGS.find(h => h.name === item.category);
        if (!heading || heading.bonusCost === 0) return undefined;

        const count = item.inflationApplied / heading.bonusCost;
        return `Cost increased by +${item.inflationApplied} because ${count} ${item.category.split('–')[0].trim()} bonuses were already selected.`;
    };

    // Stagger / Hand-dealt feel (disable in compact mode for cleaner grid)
    const tiltClass = isCompact ? '' : (index % 2 === 0 ? "hand-dealt-0" : "hand-dealt-1");

    return (
        <div className={`bg-[#171A21] rounded-3xl p-6 md:p-7 w-full relative overflow-hidden transition-all hover:scale-[1.01] hover:shadow-2xl hover:z-10 border-l-4 ${accentClass} ${tiltClass} ${isCompact ? 'flex flex-col h-full' : ''}`}>

            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5">
                        {archetypeEmoji}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight leading-none">{civ.playerName}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest opacity-80">
                                {getIdentityTag(civ.primaryCategory)}
                            </div>
                            <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                            {/* Difficulty Indicator */}
                            <div className="flex items-center gap-1.5" title={`${civ.difficulty} Difficulty`}>
                                <div className={`w-2 h-2 rounded-full ${getDifficultyColor(civ.difficulty)} shadow-sm`}></div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:block">{civ.difficulty}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${getScoreColor(civ.powerScore)}`}>
                    <span>Power</span>
                    <span className="text-sm">{civ.powerScore}</span>
                </div>
            </div>

            {/* Warnings Display (Map Aware) */}
            {civ.warnings && civ.warnings.length > 0 && !isCompact && (
                <div className="mb-4 pl-[52px]">
                    {civ.warnings.map((warn, i) => (
                        <div key={i} className="flex items-start gap-2 text-amber-500/80 text-xs bg-amber-900/10 p-2 rounded border border-amber-500/20">
                            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                            <span>{warn}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary - Hide in Compact Mode */}
            <div className={`pl-[52px] ${isCompact ? 'mb-4' : ''}`}>
                {!isCompact && (
                    <>
                        <p className="text-base text-slate-300 leading-relaxed font-medium opacity-90 mb-6">
                            {civ.summary}
                            <button
                                onClick={() => setShowReasoning(!showReasoning)}
                                className="inline-flex items-center ml-2 text-slate-600 hover:text-[#5B8CFF] transition-colors"
                                title="Why this generation?"
                            >
                                <HelpCircle size={14} />
                            </button>
                        </p>
                        {showReasoning && (
                            <div className="mb-6 p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-slate-400 italic">
                                "{civ.reasoning}"
                            </div>
                        )}
                    </>
                )}

                {/* Strength Bars - Simplified */}
                <div className={`space-y-2 ${isCompact ? 'w-full' : 'max-w-sm mb-6'}`}>
                    <StrengthBar label="Early" value={civ.ratings.early} color="bg-[#5B8CFF]" />
                    <StrengthBar label="Mid" value={civ.ratings.mid} color="bg-[#7AE3B1]" />
                    <StrengthBar label="Late" value={civ.ratings.late} color="bg-[#F4C76F]" />
                </div>
            </div>

            {/* Expandable Details - Hide in Compact Mode */}
            {!isCompact && (
                <div className="pl-[52px]">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 group"
                    >
                        <span className="flex items-center gap-2 group-hover:text-slate-300 transition-colors">
                            Build Order
                            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </span>
                        <span className="opacity-50 group-hover:opacity-100">{civ.items.length} Items</span>
                    </button>

                    {expanded && (
                        <div className="mt-2 space-y-5 animate-fade-in pb-4">
                            {Object.entries(groupedItems).map(([category, items]) => (
                                <div key={category}>
                                    <h4 className="text-[10px] font-bold text-[#5B8CFF] uppercase tracking-widest mb-2 opacity-80 border-b border-[#5B8CFF]/20 pb-1 inline-block">
                                        {category}
                                    </h4>
                                    <ul className="space-y-2">
                                        {items.map((item, idx) => {
                                            const isInflated = (item.inflationApplied || 0) > 0;
                                            const explanation = getCostExplanation(item);

                                            return (
                                                <li key={idx} className="text-sm flex justify-between items-start group">
                                                    <span className="text-slate-300 group-hover:text-white transition-colors">{item.name}</span>
                                                    <div
                                                        className="flex items-center font-mono text-xs cursor-help ml-4"
                                                        title={explanation}
                                                    >
                                                        {isInflated && (
                                                            <span className="text-slate-600 mr-2 line-through decoration-slate-600 opacity-50">
                                                                {item.originalCost}
                                                            </span>
                                                        )}
                                                        <span className={isInflated ? "text-amber-400 font-bold" : "text-slate-500 group-hover:text-slate-300"}>
                                                            {item.cost}
                                                        </span>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Actions - Pushed to bottom in Compact Mode */}
            <div className={`mt-6 pt-4 border-t border-white/5 flex justify-between items-center pl-[52px] ${isCompact ? 'mt-auto' : ''}`}>
                <button
                    onClick={onReroll}
                    disabled={civ.rerollUsed || isTournament}
                    className={`p-2 -ml-2 rounded-lg transition-colors group flex items-center gap-2 ${civ.rerollUsed || isTournament ? 'text-slate-700 cursor-not-allowed' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}
                    title={isTournament ? "Locked by Tournament Rules" : civ.rerollUsed ? "Reroll already used" : "Reroll this civ"}
                >
                    <RefreshCw size={14} className={!(civ.rerollUsed || isTournament) ? "group-hover:rotate-180 transition-transform duration-500" : ""} />
                    <span className="text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                        {isTournament ? "LOCKED" : (civ.rerollUsed ? "Used" : "Reroll")}
                    </span>
                </button>

                {!isCompact && (
                    <button
                        onClick={handleCopy}
                        className="text-slate-600 hover:text-[#5B8CFF] transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                    >
                        {copied ? <Check size={14} className="text-emerald-400" /> : <ListChecks size={14} />}
                        {copied ? "Copied" : "Checklist"}
                    </button>
                )}
            </div>
        </div>
    );
};
