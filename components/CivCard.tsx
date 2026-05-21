import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { PlayerCiv, GeneratedItem, Difficulty, ResolvedAppConfig } from '../types';
import { HEADINGS, EPOCHS } from '../constants';
import { StrengthBar } from './StrengthBar';
import { Tooltip } from './Tooltip';
import { audioService } from '../services/audio';
import {
    RefreshCw,
    ChevronDown,
    ChevronRight,
    Copy,
    Check,
    Eye,
    HelpCircle,
    AlertTriangle,
    ListChecks,
    Download,
    Sparkles,
    Activity,
    Zap,
    Target,
    Shield,
    Swords,
    Cpu,
    Coins,
    Anchor,
    Search,
    User,
    CornerDownRight,
    Globe,
    Hourglass
} from 'lucide-react';

interface Props {
    civ: PlayerCiv;
    onReroll: () => void;
    index: number;
    isCompact?: boolean;
    isTournament?: boolean;
    isTopScore?: boolean;
    config?: ResolvedAppConfig;
}

export const CivCard: React.FC<Props> = ({ civ, onReroll, index, isCompact = false, isTournament = false, isTopScore = false, config }) => {
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showReasoning, setShowReasoning] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const groupedItems: Record<string, GeneratedItem[]> = {};
    civ.items.forEach(item => {
        const key = item.category || "Civilization Powers";
        if (!groupedItems[key]) groupedItems[key] = [];
        groupedItems[key].push(item);
    });

    const handleCopy = () => {
        let text = `Tactical Data: ${civ.playerName}\n`;
        text += `Spec: ${civ.summary}\n`;
        text += `Power Level: ${civ.powerScore}\n`;
        text += `========================================\n`;
        civ.items.forEach((item, i) => {
            text += `[${(i + 1).toString().padStart(2, '0')}] ${item.name} (Cost: ${item.cost})\n`;
        });
        text += `========================================\n`;
        text += `Residual Points: ${100 - civ.pointsSpent}\n`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsDownloading(true);
        try {
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                backgroundColor: '#0F1117',
                style: { transform: 'scale(1)' }
            });
            const link = document.createElement('a');
            link.download = `Epoch_Forge_${civ.playerName}_${civ.powerScore}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Download failed:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    const getAccentColor = (category: string) => {
        if (category.includes("Economy") || category.includes("Citizens")) return "border-emerald-500/30";
        if (category.includes("Buildings") || category.includes("General") || category.includes("Religion")) return "border-indigo-500/30";
        return "border-rose-500/30";
    };

    const getArchetypeIcon = (category: string) => {
        if (category.includes("Economy")) return <Coins size={20} />;
        if (category.includes("Citizens")) return <User size={20} />;
        if (category.includes("Buildings")) return <Shield size={20} />;
        if (category.includes("Infantry") || category.includes("Cavalry")) return <Swords size={20} />;
        if (category.includes("Ships")) return <Anchor size={20} />;
        if (category.includes("Cyber") || category.includes("Tanks")) return <Cpu size={20} />;
        return <Activity size={20} />;
    };

    const accentClass = getAccentColor(civ.primaryCategory);
    const archetypeIcon = getArchetypeIcon(civ.primaryCategory);
    const isLegendary = civ.powerScore >= 85;

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-400";
        if (score >= 50) return "text-amber-400";
        return "text-rose-400";
    };

    const getDifficultyColor = (diff: Difficulty) => {
        if (diff === 'Beginner') return 'text-emerald-500';
        if (diff === 'Intermediate') return 'text-amber-500';
        return 'text-rose-500';
    };

    const getCostExplanation = (item: GeneratedItem) => {
        if (!item.inflationApplied || item.inflationApplied <= 0) return undefined;
        const heading = HEADINGS.find(h => h.name === item.category);
        if (!heading || heading.bonusCost === 0) return undefined;
        return `Inflation Adjustment: +${item.inflationApplied}PT (Sector Saturation)`;
    };

    const epochName = (id: number) => EPOCHS.find(e => e.id === id)?.name || id;

    return (
        <div
            ref={cardRef}
            className={`bg-[#12141C] rounded-[2.5rem] p-8 md:p-10 w-full relative overflow-hidden transition-all hover:scale-[1.01] hover:shadow-[0_0_60px_rgba(0,0,0,0.5)] border-2 ${isLegendary ? 'border-amber-500/50 shadow-[inset_0_0_40px_rgba(245,158,11,0.1)]' : accentClass} ${isCompact ? 'flex flex-col h-full' : ''}`}
        >
            {/* Tactical Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:32px_32px]" />

            {isLegendary && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
            )}

            {/* Top Bar - Identity & Status */}
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-3xl bg-[#171A21] flex items-center justify-center text-slate-500 shadow-inner border-2 ${isLegendary ? 'border-amber-500/40 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-white/5'}`}>
                        {archetypeIcon}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] font-mono">Commander: <span className="text-orange-400">{civ.playerName}</span></span>
                            {isTopScore && <Zap size={14} className="text-amber-400 animate-pulse" />}
                        </div>
                        <h3 className="text-4xl font-black text-slate-100 italic tracking-tighter leading-none mb-2">{civ.civName}</h3>
                        <div className="flex flex-wrap items-center gap-3 font-mono">
                            {civ.doctrine && (
                                <Tooltip content={<div className="max-w-[200px]"><strong>{civ.doctrine.name}</strong><br/>{civ.doctrine.description}<br/><br/><em>Focus: {civ.doctrine.ecoFocus} Economy</em></div>} position="bottom">
                                    <span className="text-[10px] font-bold text-amber-500 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 uppercase tracking-widest flex items-center gap-2 cursor-help">
                                        <Target size={10} /> {civ.doctrine.name}
                                    </span>
                                </Tooltip>
                            )}
                            <span className="text-[10px] font-bold text-orange-500 px-2 py-0.5 rounded-lg bg-orange-500/10 border border-orange-500/20 uppercase tracking-widest">
                                {civ.primaryCategory.split('–')[0].trim()} Focus
                            </span>
                            <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg bg-white/5 border border-white/5">
                                <Search size={10} className="text-slate-600" />
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${getDifficultyColor(civ.difficulty)}`}>{civ.difficulty} Complexity</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 font-mono">
                    <div className={`flex flex-col items-end px-4 py-2 rounded-2xl bg-[#0F1117] border-2 ${isLegendary ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-white/5'}`}>
                        <span className="text-[9px] font-bold text-slate-600 tracking-widest uppercase mb-1">Power Output</span>
                        <span className={`text-4xl font-black italic tracking-tighter ${getScoreColor(civ.powerScore)} drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                            {civ.powerScore}<span className="text-xs ml-1 opacity-50">%</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Tactical Briefing */}
            {!isCompact && (
                <div className="relative mb-10 pl-4 md:pl-20">
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-orange-500/40 via-orange-500/10 to-transparent" />
                    <div className="pl-12">
                        <div className="flex items-center gap-3 mb-3">
                            <Activity size={14} className="text-orange-500/60" />
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.3em] font-mono">
                                Tactical Briefing {civ.doctrine && `— Objective: ${civ.doctrine.winCondition}`}
                            </span>
                        </div>
                        <p className="text-lg text-slate-300 font-medium leading-[1.6] italic tracking-tight mb-4">
                            "{civ.summary}"
                        </p>
                        <div className="animate-fade-in mb-6 p-6 bg-[#0F1117] rounded-3xl border-2 border-white/5 font-mono text-xs text-slate-500 leading-relaxed relative">
                            <div className="absolute top-2 right-4 text-[8px] font-bold text-slate-700 uppercase">Cognitive Log</div>
                            <CornerDownRight size={14} className="inline mr-2 text-orange-500/40" />
                            {civ.reasoning}
                        </div>
                    </div>
                </div>
            )}

            {/* Power Distribution Matrix */}
            <div className={`mb-10 ${isCompact ? 'w-full px-0' : 'pl-4 md:pl-20'}`}>
                <div className="pl-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#171A21] p-4 rounded-2xl border-2 border-white/5 flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] font-mono italic">Early Phase</span>
                        <StrengthBar value={civ.ratings.early} color="bg-orange-500" />
                    </div>
                    <div className="bg-[#171A21] p-4 rounded-2xl border-2 border-white/5 flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] font-mono italic">Mid Phase</span>
                        <StrengthBar value={civ.ratings.mid} color="bg-orange-500" />
                    </div>
                    <div className="bg-[#171A21] p-4 rounded-2xl border-2 border-white/5 flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] font-mono italic">Late Phase</span>
                        <StrengthBar value={civ.ratings.late} color="bg-orange-500" />
                    </div>
                </div>
            </div>

            {/* Item Allocation Table */}
            {!isCompact && (
                <div className="pl-4 md:pl-20 mb-6 font-mono">
                    <div className="pl-12">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-[0.3em] text-slate-600 group border-2 border-transparent hover:border-white/5"
                        >
                            <span className="flex items-center gap-4 group-hover:text-slate-400">
                                <ListChecks size={18} className="text-orange-500/40" />
                                Allocated Data [{civ.items.length}]
                                {expanded ? <ChevronDown size={14} className="ml-2" /> : <ChevronRight size={14} className="ml-2" />}
                            </span>
                        </button>

                        {expanded && (
                            <div className="mt-4 space-y-8 animate-fade-in p-6 bg-[#171A21] rounded-[2.5rem] border-2 border-white/5">
                                {config && (
                                    <div className="px-4 py-3 bg-[#12141C] rounded-xl border border-white/5 flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6">
                                        <span className="text-slate-600 italic">Eligible due to:</span>
                                        <span className="flex items-center gap-1.5"><Globe size={12} className="text-emerald-500/60" /> {config.mapType} World</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                        <span className="flex items-center gap-1.5"><Swords size={12} className="text-amber-500/60" /> {config.preset} Set</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                        <span className="flex items-center gap-1.5"><Hourglass size={12} className="text-rose-500/60" /> Ends: {epochName(config.endEpoch)}</span>
                                    </div>
                                )}
                                {Object.entries(groupedItems).map(([category, items]) => (
                                    <div key={category} className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-px flex-1 bg-white/5" />
                                            <h4 className="text-[10px] font-bold text-orange-500/60 uppercase tracking-[0.4em]">
                                                {category} {(() => {
                                                    const heading = HEADINGS.find(h => h.name === category);
                                                    return (heading?.bonusCost ?? 0) > 0
                                                        ? <span className="ml-2 text-[9px] text-amber-500/60 normal-case tracking-normal">(Inflation: +{heading?.bonusCost} per additional)</span>
                                                        : null;
                                                })()}
                                            </h4>
                                            <div className="h-px flex-1 bg-white/5" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-1">
                                            {items.map((item, idx) => {
                                                const isInflated = (item.inflationApplied || 0) > 0;
                                                const explanation = getCostExplanation(item);
                                                const hasSynergy = civ.synergies.some(s => s.items.includes(item.name));

                                                const isPower = item.type === 'power';

                                                return (
                                                    <div key={idx} className={`flex justify-between items-center p-3 px-5 rounded-xl transition-all group border-2 ${isPower ? 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20' : 'bg-[#0F1117] hover:bg-white/5 border-transparent hover:border-white/5'}`}>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${hasSynergy ? 'bg-cyan-400 animate-pulse' : (isPower ? 'bg-amber-500' : 'bg-slate-800')}`} />
                                                                <Tooltip content={isPower ? undefined : item.description} position="left">
                                                                    <span className={`text-sm font-bold transition-all cursor-help ${isPower ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-200'}`}>{item.name}</span>
                                                                </Tooltip>
                                                            </div>
                                                            {isPower && item.description && (
                                                                <p className="pl-5 mt-1 text-[10px] text-amber-500/70 font-mono tracking-tight leading-relaxed max-w-sm">
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {hasSynergy && (
                                                                <Tooltip content={civ.synergies.find(s => s.items.includes(item.name))?.description}>
                                                                    <div className="bg-cyan-500/10 text-cyan-400 text-[9px] font-bold italic px-2 py-0.5 rounded border border-cyan-500/20 tracking-tight shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                                                                        Power Combo++
                                                                    </div>
                                                                </Tooltip>
                                                            )}
                                                            <Tooltip content={explanation}>
                                                                <div className="flex items-center gap-2">
                                                                    {isInflated && <span className="text-[10px] text-slate-700 line-through">+{item.inflationApplied}</span>}
                                                                    <span className={`text-xs font-bold ${isInflated ? 'text-amber-500' : 'text-slate-600'}`}>{item.cost}PT</span>
                                                                </div>
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-slate-500">
                                    <span>Point Breakdown:</span>
                                    <div className="flex gap-4">
                                        <span>Base: <span className="text-slate-300">100</span></span>
                                        <span>Spent: <span className="text-orange-400">{civ.pointsSpent}</span></span>
                                        <span>Remaining: <span className="text-emerald-400">{100 - civ.pointsSpent}</span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Control Interface */}
            <div className={`mt-8 pt-8 border-t-2 border-white/5 flex flex-wrap justify-between items-center gap-6 relative z-10 ${isCompact ? 'mt-auto' : 'md:pl-20'}`}>
                <div className="px-2">
                    <Tooltip content={isTournament ? "Tournament Lock Active" : civ.rerollUsed ? "Reroll Expended" : "Regenerate Path"}>
                        <button
                            onClick={onReroll}
                            disabled={civ.rerollUsed || isTournament}
                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-mono text-[10px] font-bold uppercase tracking-[0.2em] border-2 ${civ.rerollUsed || isTournament ? 'bg-white/5 border-transparent text-slate-800 cursor-not-allowed opacity-40' : 'bg-[#171A21] border-white/10 text-slate-500 hover:text-slate-100 hover:border-orange-500/50 hover:bg-orange-600/10 active:scale-95 shadow-xl'}`}
                        >
                            <RefreshCw size={14} className={!(civ.rerollUsed || isTournament) ? "animate-spin-slow" : ""} />
                            {isTournament ? "System Lock" : (civ.rerollUsed ? "Used" : "Re-Forge")}
                        </button>
                    </Tooltip>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { handleCopy(); audioService.playInteraction(); }}
                        className="p-3 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-600 hover:text-slate-400 transition-all border-2 border-transparent hover:border-white/5 active:scale-95"
                    >
                        {copied ? <Check size={18} className="text-emerald-400" /> : <ListChecks size={18} />}
                    </button>
                    <button
                        onClick={() => { handleDownload(); audioService.playInteraction(); }}
                        disabled={isDownloading}
                        className="p-3 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-600 hover:text-slate-400 transition-all border-2 border-transparent hover:border-white/5 active:scale-95 disabled:opacity-30"
                    >
                        {isDownloading ? <RefreshCw size={18} className="animate-spin" /> : <Download size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};
