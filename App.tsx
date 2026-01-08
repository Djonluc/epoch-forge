import React, { useState, useEffect } from 'react';
import { AppConfig, PlayerCiv, PresetMode, PointUsageMode, MapType } from './types';
import { generateCivForPlayer, SeededRNG } from './services/generator';
import { encodeConfig, decodeConfig } from './services/share';
import { SetupScreen } from './components/SetupScreen';
import { CivCard } from './components/CivCard';
import { DEFAULT_NAMES, MAP_TYPES, PRESET_MODES, POINT_MODES, EPOCHS } from './constants';
import { Download, Loader2, Globe, Scale, Hourglass, LayoutGrid, Columns, Trophy, Link as LinkIcon, Check } from 'lucide-react';
import { DjonStNixLogo } from './components/DjonStNixLogo';

const App: React.FC = () => {
    // Default Config State
    const [config, setConfig] = useState<AppConfig>({
        numPlayers: 2,
        playerNames: DEFAULT_NAMES.slice(0, 2),
        playerArchetypes: ['Random', 'Random'], // Default init for 2 players
        startEpoch: 1,
        endEpoch: 15,
        seed: `EF-${Math.floor(Math.random() * 10000)}`,

        // Active
        preset: 'Casual' as PresetMode,
        pointUsage: 'Efficient' as PointUsageMode,
        mapType: 'Land' as MapType,

        // Randomization Defaults
        isMapRandom: false,
        allowedMaps: [...MAP_TYPES],
        isPresetRandom: false,
        allowedPresets: [...PRESET_MODES],
        isPointUsageRandom: false,
        allowedPointUsages: [...POINT_MODES],
        isEndEpochRandom: false,
        endEpochMin: 1,
        endEpochMax: 15
    });

    const [civs, setCivs] = useState<PlayerCiv[]>([]);
    const [isForging, setIsForging] = useState(false);
    const [isForged, setIsForged] = useState(false);
    const [resolvedConfig, setResolvedConfig] = useState<AppConfig | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'compare'>('grid');
    const [linkCopied, setLinkCopied] = useState(false);

    const updateConfig = (updates: Partial<AppConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    };

    const epochName = (id: number) => EPOCHS.find(e => e.id === id)?.name || id;

    // Dynamic Header Text
    const getHeaderText = () => {
        if (!isForged) return "Setting up a match...";

        const parts = [];
        parts.push(config.isMapRandom ? "Random World" : `${config.mapType} World`);
        parts.push(config.isPresetRandom ? "Random Rules" : config.preset);

        const epochText = config.isEndEpochRandom
            ? `${epochName(config.startEpoch)} → ?`
            : `${epochName(config.startEpoch)} → ${epochName(config.endEpoch)}`;

        return `${parts.join(" · ")} · ${epochText}`;
    };

    // Load from URL on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shareCode = params.get('m');
        if (shareCode) {
            const sharedConfig = decodeConfig(shareCode);
            if (sharedConfig) {
                setConfig(sharedConfig);
                // Auto-forge if loaded from link
                handleForge(sharedConfig);
                // Clean URL so refresh doesn't stick
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }, []);

    const handleForge = (cfgOverride?: AppConfig) => {
        const finalConfig = cfgOverride ? { ...cfgOverride } : { ...config };

        setIsForging(true);
        setIsForged(false);

        // 1. Resolve Random Rules using Seeded RNG (Match-level reproducibility)
        const matchRng = new SeededRNG(`match-rules-${finalConfig.seed}`);

        // Resolve Map
        if (finalConfig.isMapRandom && finalConfig.allowedMaps.length > 0) {
            const index = Math.floor(matchRng.next() * finalConfig.allowedMaps.length);
            finalConfig.mapType = finalConfig.allowedMaps[index];
        }

        // Resolve Preset
        if (finalConfig.isPresetRandom && finalConfig.allowedPresets.length > 0) {
            const index = Math.floor(matchRng.next() * finalConfig.allowedPresets.length);
            finalConfig.preset = finalConfig.allowedPresets[index];
        }

        // Resolve Point Usage
        if (finalConfig.isPointUsageRandom && finalConfig.allowedPointUsages.length > 0) {
            const index = Math.floor(matchRng.next() * finalConfig.allowedPointUsages.length);
            finalConfig.pointUsage = finalConfig.allowedPointUsages[index];
        }

        // Resolve End Epoch
        if (finalConfig.isEndEpochRandom) {
            const min = finalConfig.endEpochMin;
            const max = finalConfig.endEpochMax;
            const range = max - min + 1;
            const pick = Math.floor(matchRng.next() * range) + min;
            finalConfig.endEpoch = pick;
        }

        // 2. Generate Civs (calculation happens instantly, display is delayed)
        const quota = Math.floor(finalConfig.playerNames.length / 2);
        const civRng = new SeededRNG(finalConfig.seed);
        const indices = finalConfig.playerNames.map((_, i) => i);

        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(civRng.next() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        const forcedIndices = new Set(indices.slice(0, quota));

        const generated = finalConfig.playerNames.map((name, idx) =>
            generateCivForPlayer(finalConfig, name, idx, undefined, forcedIndices.has(idx))
        );

        // 3. The "Reveal Rhythm"
        setTimeout(() => {
            setResolvedConfig(finalConfig);
            setCivs(generated);
            setIsForged(true);
            setIsForging(false);

            setTimeout(() => {
                document.getElementById('results-feed')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }, 800); // 800ms "Forging..." delay
    };

    const handleReroll = (index: number) => {
        if (!resolvedConfig) return;
        // Strict Tournament Mode Check
        if (resolvedConfig.preset === 'Tournament') return;

        const player = civs[index];

        // Safety check: Prevent usage if already used
        if (player.rerollUsed) return;

        // Deterministic sub-seed: MainSeed - PlayerName - Index - REROLL
        // This ensures if you reload the same seed, the reroll result is identical
        const newSeed = `${resolvedConfig.seed}-${player.playerName}-${index}-REROLL`;

        const newCiv = generateCivForPlayer(resolvedConfig, player.playerName, index, newSeed);
        newCiv.rerollUsed = true; // Mark as used
        newCiv.reasoning += " (Rerolled)"; // Update reasoning to reflect change

        const newCivs = [...civs];
        newCivs[index] = newCiv;
        setCivs(newCivs);
    };

    const exportData = () => {
        if (!civs.length) return;
        const data = JSON.stringify({ config: resolvedConfig, civs }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `epoch-forge-${config.seed}.json`;
        a.click();
    };

    const handleShareLink = () => {
        if (!resolvedConfig) return;
        const encoded = encodeConfig(config); // Share the ORIGINAL config (with the seed)
        const url = `${window.location.origin}${window.location.pathname}?m=${encoded}`;
        navigator.clipboard.writeText(url);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0F1117] text-slate-200 pb-20 font-sans">
            <div className="max-w-4xl mx-auto px-4 pt-10 md:pt-16 space-y-12">

                {/* Header */}
                <div className="text-center space-y-3 mb-8">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Epoch Forge</h1>
                    <div className="flex flex-col items-center gap-1 mb-2">
                        <DjonStNixLogo className="scale-75 md:scale-90" />
                    </div>
                    <p className={`font-medium text-lg transition-colors duration-500 ${isForged ? 'text-[#5B8CFF]' : 'text-slate-500'}`}>
                        {getHeaderText()}
                    </p>
                </div>

                {/* Setup Section (Lobby) - De-emphasize when forged */}
                <div className={`transition-all duration-1000 ${isForged || isForging ? 'opacity-20 blur-[2px] grayscale pointer-events-none' : ''}`}>
                    <SetupScreen config={config} onUpdate={updateConfig} />
                </div>

                {/* The Forge Button / Status */}
                {!isForged && (
                    <div className="flex flex-col items-center justify-center pt-8 pb-4 h-32">
                        {isForging ? (
                            <div className="flex flex-col items-center animate-pulse space-y-4">
                                <Loader2 className="animate-spin text-[#5B8CFF]" size={40} />
                                <span className="text-lg font-bold text-white tracking-widest uppercase">Forging Civilizations...</span>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleForge()}
                                    className="group relative inline-flex items-center justify-center px-12 py-6 font-black text-white transition-all duration-500 bg-gradient-to-br from-[#5B8CFF] via-[#4374e8] to-[#3b66d1] text-xl rounded-2xl hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(91,140,255,0.3)] hover:shadow-[0_0_50px_rgba(91,140,255,0.6)] border border-white/10 hover:border-white/20 ring-1 ring-white/10"
                                >
                                    <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <span className="mr-3 text-2xl group-hover:scale-110 transition-transform duration-300">🔥</span>
                                    <span className="tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">FORGE CIVILIZATIONS</span>
                                </button>
                                <p className="mt-5 text-[10px] font-bold text-slate-600 uppercase tracking-[0.25em] transition-colors group-hover:text-[#5B8CFF]">Ready when you are</p>
                            </>
                        )}
                    </div>
                )}

                {/* Results Feed */}
                {isForged && resolvedConfig && (
                    <div id="results-feed" className="space-y-12 pt-4">

                        {/* Match Banner - Celebratory Style */}
                        <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                            <div className="text-center py-6 relative">

                                {/* Match ID */}
                                <div className="mb-4">
                                    <span className="inline-block bg-[#171A21] px-3 py-1 rounded-full border border-white/5 text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                                        Match Seed: <span className="text-[#5B8CFF] font-bold">{resolvedConfig.seed}</span>
                                    </span>
                                </div>

                                {/* Main Headline Banner */}
                                <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-5 text-slate-200 font-bold text-lg md:text-xl tracking-tight">
                                    <span className="flex items-center gap-2">
                                        <Globe size={20} className="text-emerald-400" />
                                        {resolvedConfig.mapType} World
                                    </span>
                                    <span className="hidden md:block text-slate-600">·</span>
                                    <span className="flex items-center gap-2">
                                        <Scale size={20} className="text-amber-400" />
                                        {resolvedConfig.preset}
                                    </span>
                                    <span className="hidden md:block text-slate-600">·</span>
                                    <span className="flex items-center gap-2">
                                        <Hourglass size={20} className="text-rose-400" />
                                        {epochName(resolvedConfig.startEpoch)} → {epochName(resolvedConfig.endEpoch)}
                                    </span>
                                </div>

                                {/* Subline */}
                                <div className="mt-2 text-sm font-medium text-slate-500 flex items-center justify-center gap-2">
                                    <span>Point Logic: <span className="text-slate-400">{resolvedConfig.pointUsage}</span></span>
                                    {resolvedConfig.preset === 'Tournament' && (
                                        <span className="ml-2 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Trophy size={10} /> Tournament Lock Active
                                        </span>
                                    )}
                                </div>

                                {/* Controls: Export & View Toggle */}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:flex gap-2">
                                    <button
                                        onClick={handleShareLink}
                                        className="p-2 text-slate-600 hover:text-white hover:bg-white/5 rounded-lg transition-colors relative"
                                        title="Copy Match Link"
                                    >
                                        {linkCopied ? <Check size={20} className="text-emerald-400" /> : <LinkIcon size={20} />}
                                    </button>
                                    <button
                                        onClick={() => setViewMode(prev => prev === 'grid' ? 'compare' : 'grid')}
                                        className="p-2 text-slate-600 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                        title="Toggle Comparison View"
                                    >
                                        {viewMode === 'grid' ? <Columns size={20} /> : <LayoutGrid size={20} />}
                                    </button>
                                    <button onClick={exportData} className="p-2 text-slate-600 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Export Match JSON">
                                        <Download size={20} />
                                    </button>
                                </div>

                                {/* Mobile View Toggle (Centered below) */}
                                <div className="lg:hidden mt-4 flex justify-center gap-4">
                                    <button
                                        onClick={handleShareLink}
                                        className="text-xs font-bold uppercase tracking-widest text-[#5B8CFF] flex items-center gap-2"
                                    >
                                        {linkCopied ? <Check size={16} /> : <LinkIcon size={16} />}
                                        {linkCopied ? "Link Copied" : "Share Link"}
                                    </button>
                                    <button
                                        onClick={() => setViewMode(prev => prev === 'grid' ? 'compare' : 'grid')}
                                        className="text-xs font-bold uppercase tracking-widest text-[#5B8CFF] flex items-center gap-2"
                                    >
                                        {viewMode === 'grid' ? <Columns size={16} /> : <LayoutGrid size={16} />}
                                        {viewMode === 'grid' ? "Compare View" : "Card View"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Civ List with Staggered Entry */}
                        <div className={`grid gap-8 md:gap-10 transition-all duration-500 ${viewMode === 'compare' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                            {civs.map((civ, idx) => (
                                <div
                                    key={civ.id}
                                    className="animate-fade-in-up"
                                    style={{ animationDelay: `${150 + (idx * 150)}ms` }} // 150ms stagger
                                >
                                    <CivCard
                                        civ={civ}
                                        onReroll={() => handleReroll(idx)}
                                        index={idx} // Pass index for visual offset
                                        isCompact={viewMode === 'compare'}
                                        isTournament={resolvedConfig.preset === 'Tournament'}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="text-center pt-12 pb-8">
                            <button
                                onClick={() => { setIsForged(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-[#5B8CFF] transition-colors py-4 px-8"
                            >
                                Start New Match
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;