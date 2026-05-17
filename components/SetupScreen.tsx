import React, { useState } from 'react';
import { AppConfig, PresetMode, PointUsageMode, MapType, Archetype, MapSize, Resources, GameSpeed, RandomizableOption } from '../types';
import { EPOCHS, DEFAULT_NAMES, MAP_TYPES, PRESET_MODES, POINT_MODES, ARCHETYPES, MAP_TYPES_INFO, PRESET_MODES_INFO, POINT_MODES_INFO, MAP_SIZES, RESOURCES, GAME_SPEEDS, MAP_SIZES_INFO, RESOURCES_INFO, GAME_SPEEDS_INFO } from '../constants';
import { User, Plus, X, Lock, Dices, ChevronDown, Anchor, Coins, Shield, Swords, Scale, ChevronRight, Activity, ArrowRight, CornerDownRight, Target, Pickaxe, Hourglass } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { RadarChart } from './RadarChart';
import { audioService } from '../services/audio';

const ARCHETYPE_STATS: Record<Archetype, { economy: number; military: number; defense: number; mobility: number; tech: number; naval: number; desc: string }> = {
    'Random': { economy: 50, military: 50, defense: 50, mobility: 50, tech: 50, naval: 50, desc: 'System randomly assigns a strategic doctrine.' },
    'Economic': { economy: 95, military: 30, defense: 60, mobility: 40, tech: 85, naval: 50, desc: 'Boom economy → tech dominance → elite late army.' },
    'Aggressive': { economy: 40, military: 95, defense: 30, mobility: 85, tech: 40, naval: 40, desc: 'Rush infantry → overwhelm early → end fast.' },
    'Defensive': { economy: 65, military: 50, defense: 100, mobility: 20, tech: 70, naval: 40, desc: 'Fortify → outlast → attrition victory.' },
    'Naval': { economy: 60, military: 60, defense: 50, mobility: 70, tech: 50, naval: 100, desc: 'Control seas → choke trade → maritime hegemony.' },
    'Balanced': { economy: 70, military: 70, defense: 70, mobility: 70, tech: 70, naval: 70, desc: 'Flexible response → adapt to enemy → no weakness.' }
};

type TacticalStage = 'PLAYERS' | 'ROSTER' | 'TIMELINE' | 'STRATEGY';

interface Props {
    config: AppConfig;
    onUpdate: (updates: Partial<AppConfig>) => void;
    onComplete: (isReady: boolean) => void;
    onForge: () => void;
}

// --- Component: OperationalLogic (Strategy Phase UI) ---
const OperationalLogic = ({
    config,
    onUpdate,
    onBack,
    onFinalize,
    isExiting,
    isResolving
}: {
    config: AppConfig,
    onUpdate: (u: Partial<AppConfig>) => void,
    onBack: () => void,
    onFinalize: () => void,
    isExiting: boolean,
    isResolving: boolean
}) => {

    // Generic RandomizableSection local component
    const RandomizableSection = <T extends string>({
        title,
        option,
        optionsList,
        onChange,
        infoMap,
        icon
    }: {
        title: string;
        option: RandomizableOption<T>;
        optionsList: T[];
        onChange: (opt: RandomizableOption<T>) => void;
        infoMap?: Record<string, any>;
        icon?: React.ReactNode;
    }) => {
        const [expanded, setExpanded] = useState(false);
        const isRandom = option.mode === 'random';

        const toggleInArray = <U,>(item: U, array: U[]) => {
            if (array.includes(item)) {
                if (array.length === 1) return array;
                return array.filter(x => x !== item);
            }
            return [...array, item];
        };

        const handleModeToggle = () => {
            audioService.playInteraction();
            const newMode = isRandom ? 'fixed' : 'random';
            onChange({ ...option, mode: newMode });
            setExpanded(true);
        };

        const handleSelect = (val: T) => {
            audioService.playInteraction();
            if (isRandom) {
                const newAllowed = toggleInArray(val, option.allowed);
                onChange({ ...option, allowed: newAllowed });
            } else {
                onChange({ ...option, value: val });
                setExpanded(false);
            }
        };

        const currentLabel = isRandom ? "Random Selection" : option.value;
        const currentCount = isRandom ? option.allowed.length : 1;
        const isActiveState = (val: T) => isRandom ? option.allowed.includes(val) : option.value === val;

        return (
            <div className={`bg-[#12141C] border-2 ${isRandom ? 'border-orange-500/20' : 'border-white/5'} rounded-3xl p-5 flex flex-col items-center group transition-all shadow-xl relative overflow-visible w-full h-full ${expanded ? 'z-50' : 'z-10'}`}>
                <div className="flex flex-col w-full mb-4 px-1 relative z-10 gap-3">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-xl border-2 shrink-0 ${isRandom ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-[#171A21] border-white/5 text-slate-600'}`}>
                            {icon || <Dices size={14} />}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 font-mono leading-tight">{title}</div>
                    </div>
                    <div className="flex bg-[#171A21] rounded-lg p-0.5 border border-white/5 leading-none w-fit">
                        <button onClick={() => !isRandom && handleModeToggle()} className={`px-2 py-1.5 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${!isRandom ? 'bg-[#5B8CFF]/10 text-[#5B8CFF] shadow-sm' : 'text-slate-600 hover:text-slate-400'}`}>
                            <Target size={10} className="shrink-0" /> <span className="hidden sm:inline">Fixed</span>
                        </button>
                        <button onClick={() => isRandom && handleModeToggle()} className={`px-2 py-1.5 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${isRandom ? 'bg-orange-500/10 text-orange-400 shadow-sm' : 'text-slate-600 hover:text-slate-400'}`}>
                            <Dices size={10} className="shrink-0" /> <span className="hidden sm:inline">Random</span>
                        </button>
                    </div>
                </div>

                <button onClick={() => { audioService.playInteraction(); setExpanded(!expanded); }} className={`w-full rounded-xl px-4 py-3 flex items-center justify-between transition-all group shadow-lg mb-1 border-2 ${isRandom ? "bg-[#171A21] border-orange-500/20 text-orange-400" : "bg-[#171A21] border-white/10 text-slate-300 hover:border-[#5B8CFF]/30"}`}>
                    <div className="flex flex-col items-start overflow-hidden w-full pr-4">
                        <div className="flex items-center gap-3 w-full">
                            {isRandom && (
                                <div className="bg-orange-500 text-[#12141C] text-[9px] px-2 py-0.5 rounded font-black shrink-0 flex items-center justify-center min-w-[20px]">
                                    {currentCount}
                                </div>
                            )}
                            <span className="text-[10px] font-bold uppercase tracking-widest font-mono truncate">{currentLabel}</span>
                        </div>
                        {!isRandom && infoMap && infoMap[String(option.value)]?.description && (
                            <span className="text-[9px] text-slate-500 truncate w-full mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity text-left">
                                {infoMap[String(option.value)].description}
                            </span>
                        )}
                    </div>
                    <ChevronDown size={14} className={`shrink-0 transition-all duration-300 ${expanded ? 'rotate-180' : ''} ${isRandom ? 'text-orange-500' : 'text-slate-600'}`} />
                </button>

                {expanded && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-in bg-[#171A21] p-3 rounded-2xl border border-white/5 w-full max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 absolute z-50 top-full left-0 mt-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                        {optionsList.map((opt) => {
                            const info = infoMap?.[String(opt)];
                            const isActive = isActiveState(opt);
                            return (
                                <button key={String(opt)} onClick={() => handleSelect(opt)} className={`p-3 rounded-xl text-left transition-all flex flex-col gap-1 border-2 ${isActive ? 'bg-orange-500/10 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : isRandom ? 'bg-[#12141C] border-white/5 opacity-60 hover:opacity-100' : 'bg-[#12141C] border-white/5 hover:border-white/20'}`}>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${isActive ? 'text-orange-400' : 'text-slate-300'}`}>{opt}</span>
                                    {info?.description && <span className="text-[9px] text-slate-500 leading-tight">{info.description}</span>}
                                    {info?.strategic?.tagWeights && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {Object.keys(info.strategic.tagWeights).slice(0, 3).map((t: string) => (
                                                <span key={t} className="text-[7px] bg-white/5 px-1.5 py-0.5 rounded text-emerald-400/70 uppercase tracking-widest">+{t}</span>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
                {expanded && <div className="fixed inset-0 z-40" onClick={() => setExpanded(false)} />}
            </div>
        );
    };

    return (
        <div className={`flex flex-col items-center transition-all duration-300 ease-in-out w-full ${isExiting ? 'opacity-0 -translate-y-6' : 'opacity-100 translate-y-0'}`}>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-100 italic tracking-tighter mb-4 text-center">Operational Logic</h2>
            <p className="text-slate-500 font-mono tracking-[0.4em] uppercase text-[10px] mb-16 italic opacity-70">Directive 04: Global Constraints and Allocation Laws</p>

            {/* PRIMARY TIER — Strategic Cornerstones */}
            <div className="w-full mb-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500/60 font-mono mb-4 flex items-center gap-3"><div className="h-px flex-1 bg-orange-500/10" /><span>Primary Strategic Parameters</span><div className="h-px flex-1 bg-orange-500/10" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">
                <RandomizableSection title="Theater of War (Map Type)" option={config.mapType} optionsList={MAP_TYPES.filter(m => (!MAP_TYPES_INFO[m].minEpoch || config.endEpoch >= MAP_TYPES_INFO[m].minEpoch!))} onChange={(opt) => onUpdate({ mapType: opt })} infoMap={MAP_TYPES_INFO} icon={<Anchor size={16} />} />
                <RandomizableSection title="Ruleset & Balance Mode" option={config.preset} optionsList={PRESET_MODES} onChange={(opt) => onUpdate({ preset: opt })} infoMap={PRESET_MODES_INFO} icon={<Swords size={16} />} />
            </div>

            {/* SECONDARY TIER — Modifiers */}
            <div className="w-full mb-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600 font-mono mb-4 flex items-center gap-3"><div className="h-px flex-1 bg-white/5" /><span>Secondary Modifiers</span><div className="h-px flex-1 bg-white/5" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                <RandomizableSection title="Point Allocation Logic" option={config.pointUsage} optionsList={POINT_MODES} onChange={(opt) => onUpdate({ pointUsage: opt })} infoMap={POINT_MODES_INFO} icon={<Coins size={16} />} />
                <RandomizableSection title="Map Scale" option={config.mapSize} optionsList={MAP_SIZES} onChange={(opt) => onUpdate({ mapSize: opt })} infoMap={MAP_SIZES_INFO} icon={<Activity size={16} />} />
                <RandomizableSection title="Resource Density" option={config.resources} optionsList={RESOURCES} onChange={(opt) => onUpdate({ resources: opt })} infoMap={RESOURCES_INFO} icon={<Pickaxe size={16} />} />
                <RandomizableSection title="Game Velocity" option={config.gameSpeed} optionsList={GAME_SPEEDS} onChange={(opt) => onUpdate({ gameSpeed: opt })} infoMap={GAME_SPEEDS_INFO} icon={<Scale size={16} />} />
            </div>

            {/* STRATEGIC FEEDBACK — Environment Scan */}
            {(() => {
                const resolvedMap: MapType = config.mapType.mode === 'fixed' ? config.mapType.value : (config.mapType.allowed[0] || 'Continental');
                const mapInfo = MAP_TYPES_INFO[resolvedMap];
                if (!mapInfo) return null;
                const isNaval = mapInfo.navalSupport || mapInfo.category === 'water' || mapInfo.category === 'mixed';
                const tags = mapInfo.strategic?.tagWeights || {};
                const cats = mapInfo.strategic?.categoryWeights || {};
                const clamp = (v: number) => Math.max(5, Math.min(100, v));
                const radarData = {
                    economy: clamp(50 + ((tags["Resourceful"] || 1) - 1) * 40 + ((tags["Expansion"] || 1) - 1) * 30),
                    military: clamp(50 + ((tags["Attack"] || 1) - 1) * 40 + ((tags["Military"] || 1) - 1) * 30 + ((tags["Land"] || 1) - 1) * 20),
                    defense: clamp(50 + ((tags["Defensive"] || 1) - 1) * 40 + ((tags["Chokepoint"] || 1) - 1) * 30),
                    mobility: clamp(50 + ((tags["Mobility"] || 1) - 1) * 40 + ((tags["Open"] || 1) - 1) * 30),
                    tech: clamp(50 + ((tags["Space"] || 1) - 1) * 40 + ((tags["Technical"] || 1) - 1) * 30),
                    naval: clamp(isNaval ? 50 + ((tags["Naval"] || 1) - 1) * 50 + ((tags["Amphibious"] || 1) - 1) * 40 : 10)
                };
                const tagKeys = Object.keys(tags);
                return (
                    <div className="w-full mt-10 mb-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5B8CFF]/60 font-mono mb-4 flex items-center gap-3"><div className="h-px flex-1 bg-[#5B8CFF]/10" /><span>Live Environment Scan</span><div className="h-px flex-1 bg-[#5B8CFF]/10" /></div>
                        <div className="bg-[#171A21] rounded-[2rem] border-2 border-white/5 p-6 md:p-8 shadow-2xl flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#5B8CFF]/5 blur-[80px] pointer-events-none" />
                            <div className="shrink-0 z-10">
                                <RadarChart data={radarData} color="#5B8CFF" size={180} />
                            </div>
                            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 z-10 font-mono w-full">
                                <div className="bg-[#12141C] p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Map</span>
                                    <span className="text-sm font-black text-slate-200 uppercase">{resolvedMap}</span>
                                </div>
                                <div className="bg-[#12141C] p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Terrain</span>
                                    <span className={`text-sm font-black uppercase ${mapInfo.category === 'water' ? 'text-cyan-400' : mapInfo.category === 'mixed' ? 'text-amber-400' : mapInfo.category === 'space' ? 'text-purple-400' : 'text-emerald-400'}`}>{mapInfo.category}</span>
                                </div>
                                <div className="bg-[#12141C] p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Naval</span>
                                    <span className={`text-sm font-black uppercase ${isNaval ? 'text-emerald-400' : 'text-rose-500'}`}>{isNaval ? 'Viable' : 'Ineffective'}</span>
                                </div>
                                <div className="bg-[#12141C] p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Economy</span>
                                    <span className={`text-sm font-black uppercase ${radarData.economy >= 80 ? 'text-emerald-400' : radarData.economy >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{radarData.economy >= 80 ? 'Greedy' : radarData.economy >= 50 ? 'Stable' : 'Aggressive'}</span>
                                </div>
                                <div className="bg-[#12141C] p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Military</span>
                                    <span className={`text-sm font-black uppercase ${radarData.military >= 80 ? 'text-rose-500' : radarData.military >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>{radarData.military >= 80 ? 'Overwhelming' : radarData.military >= 50 ? 'Standard' : 'Low'}</span>
                                </div>
                                <div className="bg-[#12141C] p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Coherence</span>
                                    <span className="text-sm font-black text-cyan-400 uppercase">{Math.floor((radarData.economy + radarData.military + radarData.defense + radarData.mobility + radarData.tech + radarData.naval) / 6)}%</span>
                                </div>
                                {tagKeys.length > 0 && (
                                    <div className="col-span-2 sm:col-span-3 bg-[#12141C] p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Strategic Modifiers</span>
                                        <div className="flex flex-wrap gap-2">
                                            {tagKeys.map(t => (
                                                <span key={t} className="text-[9px] bg-[#5B8CFF]/10 text-[#5B8CFF] px-2 py-1 rounded-lg font-bold uppercase tracking-wider border border-[#5B8CFF]/20">+{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mt-16 font-mono">
                <button onClick={() => { audioService.playInteraction(); onBack(); }} disabled={isResolving} className={`text-[10px] font-bold text-slate-600 hover:text-orange-500 uppercase tracking-[0.3em] transition-all hover:scale-105 ${isResolving ? 'opacity-0 cursor-not-allowed' : ''}`}>Back to Timeline</button>
                <button
                    onClick={() => { audioService.playInteraction(); onFinalize(); }}
                    disabled={isResolving}
                    className={`group px-10 md:px-20 py-4 md:py-6 rounded-[2rem] flex items-center gap-4 md:gap-8 transition-all duration-300 shadow-[0_0_50px_rgba(249,115,22,0.3)] border-2 border-white/10 w-full sm:w-auto justify-center ${isResolving ? 'bg-slate-800 scale-95 cursor-wait opacity-80' : 'bg-orange-600 hover:bg-orange-500 hover:scale-[1.08] active:scale-95'}`}
                >
                    <span className="text-xs md:text-sm font-black text-white uppercase tracking-[0.3em] md:tracking-[0.5em] font-mono">{isResolving ? 'Resolving...' : 'Finalize Strategy'}</span>
                    {isResolving ? (
                        <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <ArrowRight size={24} className="text-white group-hover:translate-x-3 transition-all animate-pulse" />
                    )}
                </button>
            </div>
        </div>
    );
};

// --- Component: ForgePhase (Execution Phase UI) ---
const ForgePhase = ({ onForge }: { onForge: () => void }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full py-20 animate-in fade-in zoom-in-95 duration-700 fill-mode-forwards font-mono">
            <button onClick={() => { audioService.playInteraction(); onForge(); }} className="group relative flex items-center justify-center w-full max-w-lg h-60 font-black text-white transition-all duration-700 bg-[#12141C] rounded-[3.5rem] hover:scale-[1.05] active:scale-[0.95] border-4 border-white/5 hover:border-orange-500/50 shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/40 via-transparent to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="absolute bottom-[-10%] w-2 h-2 bg-gradient-to-t from-orange-500 to-amber-200 rounded-full animate-flame-spark"
                            style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${0.8 + Math.random() * 2}s`, opacity: 0.5 + Math.random() * 0.5 }} />
                    ))}
                </div>
                <div className="relative flex flex-col items-center justify-center pt-4">
                    <span className="text-[11px] tracking-[0.5em] font-bold text-orange-500/30 mb-4 group-hover:text-orange-400/60 transition-colors uppercase italic">Establish Connection</span>
                    <div className="relative">
                        <span className="text-9xl md:text-[10rem] tracking-tighter font-black bg-gradient-to-b from-slate-100 via-orange-400 to-orange-800 bg-clip-text text-transparent filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">FORGE</span>
                        <div className="absolute inset-0 blur-3xl bg-orange-500/20 -z-10 group-hover:bg-orange-500/40 transition-colors" />
                    </div>
                </div>
            </button>
            <div className="flex flex-col items-center gap-3 mt-10">
                <div className="h-0.5 w-12 bg-orange-500/20 rounded-full animate-pulse" />
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] animate-pulse">Strategy locked for execution</p>
            </div>
        </div>
    );
};

export const SetupScreen: React.FC<Props> = ({ config, onUpdate, onComplete, onForge }) => {
    const [currentStage, setCurrentStage] = useState<TacticalStage>('PLAYERS');
    const [startEpoch, setStartEpoch] = useState(config.startEpoch);
    const [endEpoch, setEndEpoch] = useState(config.endEpoch);
    const [endEpochMin, setEndEpochMin] = useState(config.endEpochMin);
    const [endEpochMax, setEndEpochMax] = useState(config.endEpochMax);

    // Transition State for Phase Shift
    const [strategyPhase, setStrategyPhase] = useState<'CONFIG' | 'EXITING' | 'FORGE'>('CONFIG');

    const updateName = (idx: number, name: string) => {
        const newNames = [...config.playerNames];
        newNames[idx] = name;
        onUpdate({ playerNames: newNames });
    };

    const updateArchetype = (idx: number, archetype: Archetype) => {
        audioService.playInteraction();
        const newArchetypes = [...config.playerArchetypes];
        newArchetypes[idx] = archetype;
        onUpdate({ playerArchetypes: newArchetypes });
    };

    const setNumPlayers = (count: number) => {
        audioService.playInteraction();
        const newCount = Math.min(10, Math.max(2, count));
        const newNames = [...config.playerNames];
        const newArchetypes = [...config.playerArchetypes];

        if (newNames.length < newCount) {
            for (let i = newNames.length; i < newCount; i++) {
                newNames.push(DEFAULT_NAMES[i] || `OPERATIVE ${i + 1}`);
                newArchetypes.push('Random');
            }
        } else if (newNames.length > newCount) {
            newNames.splice(newCount);
            newArchetypes.splice(newCount);
        }

        onUpdate({ numPlayers: newCount, playerNames: newNames, playerArchetypes: newArchetypes });
    };

    const addPlayer = () => {
        setNumPlayers(config.numPlayers + 1);
    };

    const removePlayer = (idxToRemove: number) => {
        if (config.numPlayers <= 2) return;
        audioService.playInteraction();
        const newCount = config.numPlayers - 1;
        const newNames = config.playerNames.filter((_, idx) => idx !== idxToRemove);
        const newArchetypes = config.playerArchetypes.filter((_, idx) => idx !== idxToRemove);
        onUpdate({ numPlayers: newCount, playerNames: newNames, playerArchetypes: newArchetypes });
    };

    // Helper: Custom Dropdown for Epochs (War-Room Aesthetic)
    const CustomSelect = ({ value, label, options, onChange, icon: Icon, prefix }: { value: number, label: string, options: { id: number, name: string }[], onChange: (val: number) => void, icon?: any, prefix?: string }) => {
        const [isOpen, setIsOpen] = useState(false);
        const selected = options.find(o => o.id === value) || options[0];

        return (
            <div className="relative w-full max-w-sm group/select">
                {prefix && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500/40 pointer-events-none font-mono text-[10px] z-20">{prefix}</div>}
                <button
                    onClick={() => { audioService.playInteraction(); setIsOpen(!isOpen); }}
                    className="w-full bg-[#171A21] text-lg md:text-xl p-5 px-10 text-slate-200 focus:outline-none cursor-pointer font-black text-center border-2 border-white/5 hover:border-orange-500/40 hover:text-orange-400 transition-all rounded-2xl shadow-xl tracking-tight flex items-center justify-center gap-4 group"
                >
                    <span className="whitespace-nowrap">{selected.name}</span>
                    <ChevronDown size={20} className={`text-slate-600 transition-transform duration-300 ${isOpen ? 'rotate-180 text-orange-500' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-[110%] left-0 w-full bg-[#171A21]/95 backdrop-blur-xl border-2 border-orange-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 py-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/20">
                        {options.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => { audioService.playInteraction(); onChange(opt.id); setIsOpen(false); }}
                                className={`w-full px-6 py-3 text-left hover:bg-orange-500/10 transition-colors flex items-center justify-between group ${value === opt.id ? 'bg-orange-500/5 text-orange-400' : 'text-slate-400'}`}
                            >
                                <span className={`font-bold transition-all ${value === opt.id ? 'translate-x-2' : ''}`}>{opt.name}</span>
                                {value === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]" />}
                            </button>
                        ))}
                    </div>
                )}
                {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
            </div>
        );
    };

    const nextStage = (current: TacticalStage) => {
        audioService.playInteraction();
        if (current === 'PLAYERS') setCurrentStage('ROSTER');
        if (current === 'ROSTER') setCurrentStage('TIMELINE');
        if (current === 'TIMELINE') setCurrentStage('STRATEGY');
    };

    // Auto-update parent
    React.useEffect(() => { onUpdate({ startEpoch, endEpoch }); }, [startEpoch, endEpoch]);
    React.useEffect(() => { onUpdate({ endEpochMin, endEpochMax }); }, [endEpochMin, endEpochMax]);

    const getArchetypeIcon = (arch: Archetype) => {
        switch (arch) {
            case 'Economic': return <Coins size={12} />;
            case 'Aggressive': return <Swords size={12} />;
            case 'Defensive': return <Shield size={12} />;
            case 'Naval': return <Anchor size={12} />;
            case 'Balanced': return <Scale size={12} />;
            default: return <Dices size={12} />;
        }
    };

    const avatarColors = [
        "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        "bg-rose-500/20 text-rose-400 border-rose-500/30",
        "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
        "bg-amber-500/20 text-amber-400 border-amber-500/30",
        "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    ];

    // --- Transition Logic ---
    const handleFinalizeStrategy = () => {
        setStrategyPhase('EXITING');
        // Wait for exit animation (400ms) then switch to Forge
        setTimeout(() => {
            setStrategyPhase('FORGE');
        }, 400);
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[80vh]">

            {/* Stage Indicators - Only show during Configuration */}
            {strategyPhase === 'CONFIG' && (
                <div className="flex items-center gap-4 mb-16">
                    {(['PLAYERS', 'ROSTER', 'TIMELINE', 'STRATEGY'] as TacticalStage[]).map((stage, idx) => (
                        <div key={stage} className={`h-1 w-16 rounded-full transition-all duration-500 ${stage === currentStage ? "bg-orange-500 shadow-[0_0_15px_#f97316]" : (['PLAYERS', 'ROSTER', 'TIMELINE', 'STRATEGY'].indexOf(currentStage) > idx ? "bg-orange-900" : "bg-white/10")}`} />
                    ))}
                    <div className="ml-4 text-[10px] font-bold font-mono text-orange-500 uppercase tracking-widest">{currentStage}</div>
                </div>
            )}

            {currentStage === 'PLAYERS' && (
                <div className="flex flex-col items-center animate-fade-in-up px-2 md:px-0 w-full">
                    <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-100 italic tracking-tighter mb-4 text-center">Protocol Agents</h2>
                    <p className="text-slate-500 font-mono tracking-[0.4em] uppercase text-[9px] md:text-[10px] mb-8 md:mb-16 italic opacity-70 text-center w-full">Directive 01: Establish Identity Parameters</p>

                    <div className="bg-[#171A21] p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border-2 border-white/5 shadow-2xl w-full max-w-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full group-hover:bg-orange-500/10 transition-all" />
                        <div className="relative z-10 flex flex-col items-center gap-6 md:gap-8">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/5 flex items-center justify-center mb-2 md:mb-4 ring-4 ring-white/5 group-hover:ring-orange-500/20 transition-all">
                                <User size={40} className="text-slate-400 group-hover:text-orange-500 transition-all md:w-12 md:h-12" />
                            </div>
                            <div className="flex items-center gap-4 md:gap-8 w-full justify-center">
                                <button onClick={() => setNumPlayers(config.numPlayers - 1)} className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95 shrink-0">
                                    <span className="text-2xl font-mono">-</span>
                                </button>
                                <div className="flex flex-col items-center">
                                    <span className="text-6xl sm:text-7xl md:text-8xl font-black text-slate-100 tracking-tighter">{config.numPlayers}</span>
                                    <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em] font-mono mt-1 md:mt-2">Operatives</span>
                                </div>
                                <button onClick={() => setNumPlayers(config.numPlayers + 1)} className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 flex items-center justify-center text-orange-500 transition-all active:scale-95 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] shrink-0">
                                    <Plus size={20} className="md:w-6 md:h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => nextStage('PLAYERS')} className="mt-8 md:mt-16 group px-8 md:px-16 py-4 md:py-5 bg-[#171A21] hover:bg-orange-600 rounded-2xl flex items-center gap-4 md:gap-6 transition-all duration-500 shadow-2xl border-2 border-white/10 hover:border-orange-500/50 hover:scale-[1.05] w-full sm:w-auto justify-center">
                        <span className="text-xs md:text-sm font-black text-slate-100 uppercase tracking-[0.2em] md:tracking-[0.4em] font-mono">Setup Player Roster</span>
                        <ChevronRight size={18} className="text-orange-500 group-hover:text-white group-hover:translate-x-2 transition-all md:w-5 md:h-5" />
                    </button>
                </div>
            )}

            {currentStage === 'ROSTER' && (
                <div className="w-full flex flex-col items-center animate-fade-in-up px-2 md:px-0">
                    <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-100 italic tracking-tighter mb-4 text-center">Roster Assignment</h2>
                    <p className="text-slate-500 font-mono tracking-[0.4em] uppercase text-[9px] md:text-[10px] mb-8 italic opacity-70 text-center w-full">Directive 02: Designate Call Signs & Doctrine Focus</p>

                    {/* Quick Add/Remove controls also here */}
                    <div className="flex items-center gap-4 mb-10 bg-white/5 p-2 rounded-2xl border border-white/5">
                        <button onClick={() => removePlayer(config.numPlayers - 1)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                            <X size={16} />
                        </button>
                        <div className="px-4 font-mono font-bold text-orange-500 text-sm">{config.numPlayers} OPERATIVES</div>
                        <button onClick={addPlayer} className="w-10 h-10 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 flex items-center justify-center text-orange-500 transition-all">
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 w-full max-w-5xl">
                        {Array.from({ length: config.numPlayers }).map((_, i) => {
                            const arch = config.playerArchetypes[i] || 'Random';
                            const stats = ARCHETYPE_STATS[arch];
                            const getArchIcon = (a: Archetype) => {
                                if (a === 'Economic') return <Coins size={12} />;
                                if (a === 'Aggressive') return <Swords size={12} />;
                                if (a === 'Defensive') return <Shield size={12} />;
                                if (a === 'Naval') return <Anchor size={12} />;
                                if (a === 'Balanced') return <Scale size={12} />;
                                return <Dices size={12} />;
                            };
                            return (
                                <div key={i} className="bg-[#171A21] p-6 rounded-[2rem] border-2 border-white/5 hover:border-orange-500/20 transition-all group flex flex-col gap-5 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 blur-[80px] pointer-events-none" />
                                    {/* Name Row */}
                                    <div className="flex items-center justify-between gap-4 z-10">
                                        <div className="flex items-center gap-4 flex-1">
                                            <span className="font-mono text-2xl font-black text-orange-500/20 group-hover:text-orange-500/40 transition-colors">{(i + 1).toString().padStart(2, '0')}</span>
                                            <input
                                                type="text"
                                                value={config.playerNames[i] || ''}
                                                placeholder={DEFAULT_NAMES[i] || `OPERATIVE ${i + 1}`}
                                                onChange={(e) => updateName(i, e.target.value)}
                                                className="bg-transparent text-xl font-bold text-slate-200 focus:outline-none placeholder:text-slate-700 w-full uppercase tracking-wider caret-orange-500"
                                            />
                                        </div>
                                        <button onClick={() => removePlayer(i)} className="p-2 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all text-slate-600" title="Remove Player">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    {/* Archetype Selection + Radar */}
                                    <div className="flex flex-col md:flex-row gap-4 z-10 bg-[#12141C] p-4 rounded-2xl border border-white/5">
                                        <div className="flex-1 flex flex-col gap-3">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Strategic Doctrine Focus</div>
                                            <div className="flex flex-wrap gap-2">
                                                {ARCHETYPES.map(a => (
                                                    <button key={a} onClick={() => updateArchetype(i, a)} className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-2 ${arch === a ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-[#171A21] text-slate-500 border-transparent hover:bg-white/5 hover:text-slate-300'}`}>
                                                        {getArchIcon(a)} {a}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-slate-500 italic font-mono mt-1">{stats.desc}</p>
                                        </div>
                                        <div className="shrink-0 flex items-center justify-center p-2 bg-[#0F1117] rounded-xl border border-white/5">
                                            <RadarChart data={stats} color={arch === 'Random' ? '#94a3b8' : '#f97316'} size={120} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mt-12 font-mono w-full sm:w-auto">
                        <button onClick={() => setCurrentStage('PLAYERS')} className="text-[10px] font-bold text-slate-600 hover:text-orange-500 uppercase tracking-[0.3em] transition-all hover:scale-105">Back</button>
                        <button onClick={() => nextStage('ROSTER')} className="group px-10 md:px-16 py-4 md:py-5 bg-[#171A21] hover:bg-orange-600 rounded-2xl flex items-center justify-center gap-4 md:gap-6 transition-all duration-500 shadow-2xl border-2 border-white/10 hover:border-orange-500/50 hover:scale-[1.05] w-full sm:w-auto">
                            <span className="text-xs md:text-sm font-black text-slate-100 uppercase tracking-[0.2em] md:tracking-[0.4em] font-mono">Confirm Manifest</span>
                            <ChevronRight size={20} className="text-orange-500 group-hover:text-white group-hover:translate-x-2 transition-all md:w-5 md:h-5" />
                        </button>
                    </div>
                </div>
            )}

            {currentStage === 'TIMELINE' && (
                <div className="flex flex-col items-center animate-fade-in-up px-2 md:px-0 w-full">
                    <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-100 italic tracking-tighter mb-4 text-center">Temporal Bounds</h2>
                    <p className="text-slate-500 font-mono tracking-[0.4em] uppercase text-[9px] md:text-[10px] mb-8 md:mb-16 italic opacity-70 text-center w-full">Directive 03: Epoch Constraints</p>
                    <div className="flex flex-wrap justify-center gap-8 w-full max-w-5xl">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-orange-500/5 blur-2xl rounded-full group-hover:bg-orange-500/10 transition-all opacity-0 group-hover:opacity-100" />
                            <div className="bg-[#171A21] p-10 rounded-[2.5rem] border-2 border-white/5 hover:border-orange-500/30 transition-all relative z-10 flex flex-col items-center w-80 shadow-2xl">
                                <div className="text-[10px] font-bold text-slate-600 tracking-[0.3em] uppercase mb-6 font-mono border-b border-white/5 pb-2">Entry Point</div>
                                <CustomSelect
                                    value={config.startEpoch}
                                    options={EPOCHS}
                                    onChange={(val) => setStartEpoch(val)}
                                    label="Selection"
                                    prefix="START"
                                />
                                <div className="mt-8 flex items-center gap-3 text-slate-600 px-6 py-2 rounded-full border border-white/5 bg-white/5 opacity-50 font-mono text-[10px] uppercase tracking-wider"><Lock size={12} /> Fixed Anchor</div>
                            </div>
                        </div>
                        <div className="hidden md:flex flex-col justify-center items-center gap-2 text-white/10 pt-12">
                            <div className="h-2 w-2 rounded-full bg-current" /><div className="h-2 w-2 rounded-full bg-current" /><div className="h-2 w-2 rounded-full bg-current" /><ArrowRight size={32} className="text-orange-500/50 animate-pulse" />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-orange-500/5 blur-2xl rounded-full group-hover:bg-orange-500/10 transition-all opacity-0 group-hover:opacity-100" />
                            <div className="bg-[#171A21] p-10 rounded-[2.5rem] border-2 border-white/5 hover:border-orange-500/30 transition-all relative z-10 flex flex-col items-center w-80 shadow-2xl">
                                <div className="text-[10px] font-bold text-slate-600 tracking-[0.3em] uppercase mb-6 font-mono border-b border-white/5 pb-2">Target Destination</div>
                                {!config.isEndEpochRandom ? (
                                    <CustomSelect
                                        value={config.endEpoch}
                                        options={EPOCHS.filter(e => e.id >= config.startEpoch)}
                                        onChange={(val) => setEndEpoch(val)}
                                        label="Selection"
                                        prefix="END"
                                    />
                                ) : (
                                    <div className="flex flex-col gap-3 w-full">
                                        <CustomSelect
                                            value={config.endEpochMin}
                                            options={EPOCHS.filter(e => e.id >= config.startEpoch)}
                                            onChange={(val) => setEndEpochMin(val)}
                                            label="Min"
                                            prefix="MIN"
                                        />
                                        <CustomSelect
                                            value={config.endEpochMax}
                                            options={EPOCHS.filter(e => e.id >= config.endEpochMin)}
                                            onChange={(val) => setEndEpochMax(val)}
                                            label="Max"
                                            prefix="MAX"
                                        />
                                    </div>
                                )}
                                <button onClick={() => onUpdate({ isEndEpochRandom: !config.isEndEpochRandom })} className={`mt-8 flex items-center gap-3 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] transition-all font-mono border-2 ${config.isEndEpochRandom ? "text-orange-400 bg-orange-400/10 border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.3)] animate-pulse" : "text-slate-600 bg-white/5 border-transparent hover:text-slate-400 hover:border-white/10"}`}>
                                    <Dices size={14} /> {config.isEndEpochRandom ? "Timeline Drift Active" : "Fixed Chronology"}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mt-8 font-mono w-full sm:w-auto">
                        <button onClick={() => setCurrentStage('ROSTER')} className="text-[10px] font-bold text-slate-600 hover:text-orange-500 uppercase tracking-[0.3em] transition-all hover:scale-105">Back to Roster</button>
                        <button onClick={() => nextStage('TIMELINE')} className="group px-10 md:px-16 py-4 md:py-5 bg-[#171A21] hover:bg-orange-600 rounded-2xl flex items-center justify-center gap-4 md:gap-6 transition-all duration-500 shadow-2xl border-2 border-white/10 hover:border-orange-500/50 hover:scale-[1.05] w-full sm:w-auto">
                            <span className="text-xs md:text-sm font-black text-slate-100 uppercase tracking-[0.2em] md:tracking-[0.4em] font-mono">Lock Timeline</span>
                            <ChevronRight size={20} className="text-orange-500 group-hover:text-white group-hover:translate-x-2 transition-all md:w-5 md:h-5" />
                        </button>
                    </div>
                </div>
            )}

            {currentStage === 'STRATEGY' && (
                <>
                    {/* Operational Logic - Fades out in transition */}
                    {strategyPhase !== 'FORGE' && (
                        <OperationalLogic
                            config={config}
                            onUpdate={onUpdate}
                            onBack={() => setCurrentStage('TIMELINE')}
                            onFinalize={handleFinalizeStrategy}
                            isExiting={strategyPhase === 'EXITING'}
                            isResolving={strategyPhase === 'EXITING'}
                        />
                    )}

                    {/* Forge Phase - Enters after transition */}
                    {strategyPhase === 'FORGE' && (
                        <ForgePhase onForge={onForge} />
                    )}
                </>
            )}
        </div>
    );
};
