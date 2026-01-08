
import React, { useState } from 'react';
import { AppConfig, PresetMode, PointUsageMode, MapType, Archetype } from '../types';
import { EPOCHS, DEFAULT_NAMES, MAP_TYPES, PRESET_MODES, POINT_MODES, ARCHETYPES } from '../constants';
import { User, Plus, X, Lock, Dices, ChevronDown, Anchor, Coins, Shield, Swords, Scale } from 'lucide-react';

interface Props {
    config: AppConfig;
    onUpdate: (updates: Partial<AppConfig>) => void;
}

export const SetupScreen: React.FC<Props> = ({ config, onUpdate }) => {
    
    // Handlers
    const setStartEpoch = (id: number) => onUpdate({ startEpoch: id });
    const setEndEpoch = (id: number) => onUpdate({ endEpoch: id });
    const setEndEpochMin = (id: number) => onUpdate({ endEpochMin: id });
    const setEndEpochMax = (id: number) => onUpdate({ endEpochMax: id });

    const addPlayer = () => {
        if (config.numPlayers >= 10) return;
        const newCount = config.numPlayers + 1;
        const newNames = [...config.playerNames];
        const newArchetypes = [...config.playerArchetypes];
        
        newNames.push(DEFAULT_NAMES[newCount - 1] || `Player ${newCount}`);
        newArchetypes.push('Random'); // Default
        
        onUpdate({ numPlayers: newCount, playerNames: newNames, playerArchetypes: newArchetypes });
    };

    const removePlayer = (idxToRemove: number) => {
        if (config.numPlayers <= 2) return;
        const newNames = config.playerNames.filter((_, idx) => idx !== idxToRemove);
        const newArchetypes = config.playerArchetypes.filter((_, idx) => idx !== idxToRemove);
        onUpdate({ numPlayers: config.numPlayers - 1, playerNames: newNames, playerArchetypes: newArchetypes });
    };

    const updateName = (idx: number, name: string) => {
        const newNames = [...config.playerNames];
        newNames[idx] = name;
        onUpdate({ playerNames: newNames });
    };

    const updateArchetype = (idx: number, archetype: Archetype) => {
        const newArchetypes = [...config.playerArchetypes];
        newArchetypes[idx] = archetype;
        onUpdate({ playerArchetypes: newArchetypes });
    };

    // Helper: Toggle Item in Array
    const toggleInArray = <T,>(item: T, array: T[]) => {
        if (array.includes(item)) {
            // Prevent removing the last one
            if (array.length === 1) return array;
            return array.filter(x => x !== item);
        }
        return [...array, item];
    };

    // Helper: Pill styling
    const pillClass = (isActive: boolean, isRandom: boolean) => `
        px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap
        ${isActive 
            ? 'bg-[#5B8CFF] text-white shadow-md shadow-blue-500/20 transform scale-105' 
            : isRandom 
                ? 'bg-[#1F2430] text-slate-500 border border-white/5 opacity-50 hover:opacity-100 hover:text-slate-300'
                : 'bg-[#1F2430] text-slate-400 border border-white/5 hover:bg-[#262B38] hover:text-slate-200'
        }
    `;

    const getArchetypeIcon = (arch: Archetype) => {
        switch(arch) {
            case 'Economic': return <Coins size={12} />;
            case 'Aggressive': return <Swords size={12} />;
            case 'Defensive': return <Shield size={12} />;
            case 'Naval': return <Anchor size={12} />;
            case 'Balanced': return <Scale size={12} />;
            default: return <Dices size={12} />;
        }
    };

    // Internal Component for Progressive Disclosure Sections
    const CollapsibleSection = <T extends string>({ 
        title, 
        current, 
        options, 
        isRandom, 
        allowedOptions, 
        onSelect, 
        onToggleRandom,
        onUpdateAllowed 
    }: {
        title: string,
        current: T,
        options: T[],
        isRandom: boolean,
        allowedOptions: T[],
        onSelect: (val: T) => void,
        onToggleRandom: () => void,
        onUpdateAllowed: (val: T) => void
    }) => {
        const [expanded, setExpanded] = useState(false);

        return (
            <div className="space-y-3 text-center">
                <div className="flex justify-center items-center gap-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{title}</div>
                    <button 
                        onClick={onToggleRandom}
                        className={`p-1 rounded transition-colors ${isRandom ? "text-[#5B8CFF] bg-[#5B8CFF]/10" : "text-slate-600 hover:text-slate-400"}`}
                        title="Toggle Randomize"
                    >
                        <Dices size={12} />
                    </button>
                </div>
                
                {/* Active State / Collapsed View */}
                {!expanded && !isRandom && (
                    <button 
                        onClick={() => setExpanded(true)}
                        className="bg-[#1F2430] border border-white/10 rounded-full px-5 py-2 flex items-center gap-2 mx-auto hover:bg-[#262B38] transition-colors group"
                    >
                        <span className="text-sm font-semibold text-slate-200">{current}</span>
                        <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300" />
                    </button>
                )}

                {/* Expanded Grid or Random Selection */}
                {(expanded || isRandom) && (
                    <div className="flex flex-wrap justify-center gap-2 animate-fade-in">
                        {options.map(opt => {
                            const active = isRandom 
                                ? allowedOptions.includes(opt)
                                : current === opt;
                            return (
                                <button 
                                    key={opt} 
                                    onClick={() => {
                                        if (isRandom) onUpdateAllowed(opt);
                                        else {
                                            onSelect(opt);
                                            setExpanded(false);
                                        }
                                    }} 
                                    className={pillClass(active, isRandom)}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    // Avatar colors
    const avatarColors = [
        "bg-emerald-500/20 text-emerald-400",
        "bg-rose-500/20 text-rose-400",
        "bg-indigo-500/20 text-indigo-400",
        "bg-amber-500/20 text-amber-400",
        "bg-cyan-500/20 text-cyan-400",
    ];

    return (
        <div className="space-y-12 animate-fade-in">
            
            {/* 1. Context / Rules Section */}
            <div className="space-y-8">
                {/* Timeline Rule */}
                <div className="flex flex-col items-center gap-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                        Timeline
                        <button 
                             onClick={() => onUpdate({ isEndEpochRandom: !config.isEndEpochRandom })}
                             className={`p-1 rounded transition-colors ${config.isEndEpochRandom ? "text-[#5B8CFF] bg-[#5B8CFF]/10" : "text-slate-600 hover:text-slate-400"}`}
                             title="Randomize End Epoch"
                        >
                            <Dices size={12} />
                        </button>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-[#0F1117] p-1.5 rounded-2xl border border-white/10 shadow-lg">
                        <select 
                            value={config.startEpoch}
                            onChange={(e) => setStartEpoch(Number(e.target.value))}
                            className="bg-transparent text-sm p-2 px-4 text-slate-200 focus:outline-none cursor-pointer font-bold text-center appearance-none hover:text-[#5B8CFF] transition-colors"
                        >
                            {EPOCHS.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                        <span className="text-slate-600 font-mono text-xs">➜</span>
                        
                        {!config.isEndEpochRandom ? (
                            <select 
                                value={config.endEpoch}
                                onChange={(e) => setEndEpoch(Number(e.target.value))}
                                className="bg-transparent text-sm p-2 px-4 text-slate-200 focus:outline-none cursor-pointer font-bold text-center appearance-none hover:text-[#5B8CFF] transition-colors"
                            >
                                {EPOCHS.filter(e => e.id >= config.startEpoch).map(e => (
                                    <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="flex items-center gap-1">
                                <select 
                                    value={config.endEpochMin}
                                    onChange={(e) => setEndEpochMin(Number(e.target.value))}
                                    className="bg-transparent text-sm p-2 px-2 text-[#5B8CFF] focus:outline-none cursor-pointer font-bold text-center appearance-none"
                                >
                                    {EPOCHS.filter(e => e.id >= config.startEpoch).map(e => (
                                        <option key={e.id} value={e.id}>{e.name}</option>
                                    ))}
                                </select>
                                <span className="text-slate-600 text-[10px] font-bold">-</span>
                                <select 
                                    value={config.endEpochMax}
                                    onChange={(e) => setEndEpochMax(Number(e.target.value))}
                                    className="bg-transparent text-sm p-2 px-2 text-[#5B8CFF] focus:outline-none cursor-pointer font-bold text-center appearance-none"
                                >
                                    {EPOCHS.filter(e => e.id >= config.endEpochMin).map(e => (
                                        <option key={e.id} value={e.id}>{e.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progressive Disclosure Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto items-start">
                    <CollapsibleSection 
                        title="World Type"
                        current={config.mapType}
                        options={MAP_TYPES}
                        isRandom={config.isMapRandom}
                        allowedOptions={config.allowedMaps}
                        onSelect={(val) => onUpdate({ mapType: val })}
                        onToggleRandom={() => onUpdate({ isMapRandom: !config.isMapRandom })}
                        onUpdateAllowed={(val) => onUpdate({ allowedMaps: toggleInArray(val, config.allowedMaps) })}
                    />
                    
                    <CollapsibleSection 
                        title="Balance Style"
                        current={config.preset}
                        options={PRESET_MODES}
                        isRandom={config.isPresetRandom}
                        allowedOptions={config.allowedPresets}
                        onSelect={(val) => onUpdate({ preset: val })}
                        onToggleRandom={() => onUpdate({ isPresetRandom: !config.isPresetRandom })}
                        onUpdateAllowed={(val) => onUpdate({ allowedPresets: toggleInArray(val, config.allowedPresets) })}
                    />

                    <CollapsibleSection 
                        title="Point Logic"
                        current={config.pointUsage}
                        options={POINT_MODES}
                        isRandom={config.isPointUsageRandom}
                        allowedOptions={config.allowedPointUsages}
                        onSelect={(val) => onUpdate({ pointUsage: val })}
                        onToggleRandom={() => onUpdate({ isPointUsageRandom: !config.isPointUsageRandom })}
                        onUpdateAllowed={(val) => onUpdate({ allowedPointUsages: toggleInArray(val, config.allowedPointUsages) })}
                    />
                </div>
            </div>

            {/* 2. Player Lobby Section */}
            <div className="pt-4">
                 <div className="flex items-center justify-between mb-6 px-4 max-w-3xl mx-auto">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Lobby</h2>
                    <span className="text-xs text-slate-600 font-mono">{config.numPlayers} / 10 Players</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {config.playerNames.map((name, idx) => (
                        <div key={idx} className="group relative bg-[#171A21] rounded-2xl p-5 border border-white/5 hover:border-[#5B8CFF]/30 hover:bg-[#1C2029] transition-all flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1">
                             {/* Delete Button (Hover only) */}
                            {config.numPlayers > 2 && (
                                <button 
                                    onClick={() => removePlayer(idx)}
                                    className="absolute top-2 right-2 text-slate-600 hover:text-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity p-1.5"
                                >
                                    <X size={14} />
                                </button>
                            )}
                            
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors relative ${avatarColors[idx % avatarColors.length]}`}>
                                <User size={20} />
                                {/* Ready Dot */}
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#171A21] shadow-sm animate-pulse" title="Ready"></div>
                            </div>
                            
                            <input 
                                type="text"
                                value={name}
                                onChange={(e) => updateName(idx, e.target.value)}
                                className="w-full bg-transparent text-center text-sm font-semibold text-slate-200 focus:outline-none border-b-2 border-transparent focus:border-[#5B8CFF]/50 pb-1 placeholder-slate-600"
                                placeholder="Enter Name"
                            />

                            {/* Archetype Selector */}
                            <div className="mt-2 w-full relative group/arch">
                                <select
                                    value={config.playerArchetypes[idx] || 'Random'}
                                    onChange={(e) => updateArchetype(idx, e.target.value as Archetype)}
                                    className="appearance-none w-full bg-[#0F1117] text-[10px] font-bold uppercase tracking-wide text-slate-500 py-1.5 pl-7 pr-2 rounded-lg border border-white/5 cursor-pointer hover:border-slate-600 hover:text-slate-300 focus:outline-none"
                                >
                                    {ARCHETYPES.map(arch => (
                                        <option key={arch} value={arch}>{arch}</option>
                                    ))}
                                </select>
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover/arch:text-slate-400">
                                    {getArchetypeIcon(config.playerArchetypes[idx] || 'Random')}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add Button */}
                    {config.numPlayers < 10 && (
                        <button 
                            onClick={addPlayer}
                            className="bg-transparent rounded-2xl p-4 border border-dashed border-slate-700 hover:border-[#5B8CFF]/50 hover:bg-[#1F2430]/30 transition-all flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-[#5B8CFF] min-h-[140px]"
                        >
                            <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center opacity-50">
                                <Plus size={16} />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wide">Join Lobby</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
