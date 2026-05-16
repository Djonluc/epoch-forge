import React, { useState, useEffect } from 'react';
import { AppConfig, ResolvedAppConfig, PlayerCiv, PresetMode, PointUsageMode, MapType, Archetype, MapSize, Resources, GameSpeed } from './types';
import { generateCivForPlayer, SeededRNG, resolveMatchConfig } from './services/generator';
import { encodeConfig, decodeConfig } from './services/share';
import { SetupScreen } from './components/SetupScreen';
import { CivCard } from './components/CivCard';
import { audioService } from './services/audio';
import { DEFAULT_NAMES, MAP_TYPES, PRESET_MODES, POINT_MODES, EPOCHS, MAP_SIZES, RESOURCES, GAME_SPEEDS } from './constants';
import { Download, RefreshCw, Globe, Scale, Hourglass, LayoutGrid, Columns, Trophy, Link as LinkIcon, Check, Lock } from 'lucide-react';
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
        preset: { mode: 'fixed', value: 'Casual', allowed: [...PRESET_MODES] },
        pointUsage: { mode: 'fixed', value: 'Efficient', allowed: [...POINT_MODES] },
        mapType: { mode: 'fixed', value: 'Continental', allowed: [...MAP_TYPES] },
        mapSize: { mode: 'fixed', value: 'Large', allowed: [...MAP_SIZES] },
        resources: { mode: 'fixed', value: 'Standard', allowed: [...RESOURCES] },
        gameSpeed: { mode: 'fixed', value: 'Standard', allowed: [...GAME_SPEEDS] },

        // Randomization Defaults (Legacy removed)

        isEndEpochRandom: false,
        endEpochMin: 1,
        endEpochMax: 15
    });

    const [civs, setCivs] = useState<PlayerCiv[]>([]);
    const [isForging, setIsForging] = useState(false);
    const [isForged, setIsForged] = useState(false);
    const [resolvedConfig, setResolvedConfig] = useState<ResolvedAppConfig | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'compare'>('grid');
    const [linkCopied, setLinkCopied] = useState(false);
    const [seedCopied, setSeedCopied] = useState(false);
    const [isSetupComplete, setIsSetupComplete] = useState(false);

    const updateConfig = (updates: Partial<AppConfig>) => {
        audioService.playInteraction();
        setConfig(prev => ({ ...prev, ...updates }));
    };

    const epochName = (id: number) => EPOCHS.find(e => e.id === id)?.name || id;

    const getHeaderText = () => {
        if (!isForged) return "Setting up a match...";
        if (resolvedConfig) {
            const epochText = `${epochName(resolvedConfig.startEpoch)} → ${epochName(resolvedConfig.endEpoch)}`;
            return `${resolvedConfig.mapType} World · ${resolvedConfig.preset} · ${epochText}`;
        }
        // Fallback (shouldn't happen if isForged is true)
        return "Tactical Report Generated";
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shareCode = params.get('m');
        if (shareCode) {
            const sharedConfig = decodeConfig(shareCode);
            if (sharedConfig) {
                setConfig(sharedConfig);
                handleForge(sharedConfig);
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }, []);

    useEffect(() => {
        const handleInitialClick = () => {
            audioService.playIntroGrunt();
            document.removeEventListener('click', handleInitialClick);
        };
        document.addEventListener('click', handleInitialClick);
        return () => document.removeEventListener('click', handleInitialClick);
    }, []);

    const handleForge = async (cfgOverride?: AppConfig) => {
        setIsForging(true);
        setIsForged(false);
        audioService.playForgeClang();
        audioService.playIntroGrunt();
        audioService.startFireCrackle();

        const soundInterval = setInterval(() => {
            if (Math.random() > 0.5) audioService.playRandomUnitSound();
        }, 800);

        // 1. Resolve to Strict Config immediately (Conceptually)
        const initConfig = cfgOverride ? { ...cfgOverride } : { ...config };

        // This is THE MOMENT "Random" becomes "Rivers" (or whatever)
        const resolved = resolveMatchConfig(initConfig);

        // 9. Absolute Sanity Rule (Requested Validaiton)
        const values = Object.values(resolved);
        if (values.includes('Random')) {
            console.error("CRITICAL ERROR: 'Random' found in resolved config!", resolved);
            alert("System Error: Random resolution failed. Please refresh.");
            return;
        }

        console.log(`🔒 Resolved Config:`, resolved);

        // 2. Generate Civs using the PRECISE resolved config
        const generated = resolved.playerNames.map((name, idx) =>
            generateCivForPlayer(resolved, name, idx, undefined, true)
        );

        setTimeout(() => {
            setResolvedConfig(resolved); // Store the strict object
            setCivs(generated);
            setIsForged(true);
            setIsForging(false);
            audioService.stopFireCrackle();
            clearInterval(soundInterval);
            setTimeout(() => {
                document.getElementById('results-feed')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }, 800);
    };

    const handleReroll = (index: number) => {
        if (!resolvedConfig) return;
        if (resolvedConfig.preset === 'Tournament') return;
        const player = civs[index];
        if (player.rerollUsed) return;
        const newSeed = `${resolvedConfig.seed}-${player.playerName}-${index}-REROLL`;
        const newCiv = generateCivForPlayer(resolvedConfig, player.playerName, index, newSeed);
        newCiv.rerollUsed = true;
        newCiv.reasoning += " (Rerolled)";
        const newCivs = [...civs];
        newCivs[index] = newCiv;
        setCivs(newCivs);
    };

    const handleReforgeAll = () => {
        audioService.playInteraction();
        const newSeed = `EF-${Math.floor(Math.random() * 10000)}`;
        const newConfig = { ...config, seed: newSeed };
        // Deep merge not needed for seed, but robust for structure
        setConfig(newConfig);
        handleForge(newConfig);
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
        audioService.playInteraction();
        const encoded = encodeConfig(config);
        const url = `${window.location.origin}${window.location.pathname}?m=${encoded}`;
        navigator.clipboard.writeText(url);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const resetApp = () => {
        audioService.playInteraction();
        setIsForged(false);
        setIsForging(false);
        setIsSetupComplete(false);
        setResolvedConfig(null);
        setCivs([]);
        window.history.replaceState({}, '', window.location.pathname);
    };

    return (
        <div className="min-h-screen bg-[#0F1117] text-slate-200 pb-20 font-sans">
            <div className="max-w-4xl mx-auto px-4 pt-10 md:pt-16 space-y-12">
                <div className="text-center mb-10 relative">
                    <div className="relative inline-block">
                        <button onClick={resetApp} className="relative px-8 py-2 block group hover:scale-[1.02] transition-transform">
                            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter bg-gradient-to-b from-amber-200 via-orange-400 to-red-600 bg-clip-text text-transparent filter drop-shadow-[0_8px_8px_rgba(0,0,0,0.6)] select-none py-2">
                                Epoch Forge
                            </h1>
                            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/40 to-transparent blur-3xl opacity-80 -z-10 group-hover:opacity-100 transition-opacity animate-pulse" />
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="absolute bottom-0 w-1 h-1 bg-gradient-to-t from-orange-400 to-amber-200 rounded-full animate-flame-spark"
                                        style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 4}s`, animationDuration: `${1.5 + Math.random() * 2.5}s`, opacity: 0.6 + Math.random() * 0.4 }} />
                                ))}
                            </div>
                        </button>
                    </div>

                    {!isForged && (
                        <div className="animate-fade-in mt-12 mb-8 group relative max-w-4xl mx-auto px-4">
                            <div className="relative overflow-hidden rounded-[2rem] border-4 border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.8)] group-hover:border-orange-500/30 transition-all duration-700">
                                <img
                                    src="hero_banner.png"
                                    alt="Evolution of Civilization"
                                    className="w-full h-auto opacity-90 group-hover:opacity-100 transition-all duration-700 scale-[1.01] group-hover:scale-100"
                                />
                                {/* Atmospheric Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1117] via-transparent to-transparent opacity-60 pointer-events-none" />
                                <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-transparent transition-colors duration-700 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col items-center mt-12 mb-8 group relative max-w-4xl mx-auto px-4 font-mono">
                        <div className="text-[10px] font-bold text-slate-600 tracking-[0.2em] uppercase mb-4 animate-pulse italic">
                            {isForged ? "Tactical Report Generated" : "System Ready for Calculation"}
                        </div>
                        <p className={`font-bold text-xs tracking-[0.2em] uppercase transition-colors duration-700 p-3 px-6 rounded-2xl border-2 ${isForged ? 'text-orange-500 border-orange-500/20 bg-orange-500/5 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'text-slate-600 border-white/5 bg-[#12141C]'}`}>
                            {getHeaderText()}
                        </p>
                    </div>

                    {/* Fixed DjonStNix Branding */}
                    <div className="fixed bottom-6 right-8 z-50 pointer-events-none">
                        <div className="pointer-events-auto">
                            <DjonStNixLogo className="scale-[0.6] md:scale-75 animate-electric-pulse" />
                        </div>
                    </div>
                </div>

                {!isForged && (
                    <div className={`transition-all duration-1000 ${isForging ? 'opacity-10 blur-[4px] grayscale pointer-events-none' : ''}`}>
                        <SetupScreen
                            config={config}
                            onUpdate={updateConfig}
                            onComplete={setIsSetupComplete}
                            onForge={() => handleForge()}
                        />
                    </div>
                )}

                {isForged && resolvedConfig && (
                    <div id="results-feed" className="space-y-12 pt-4">
                        <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                            <div className="flex flex-col items-center gap-6 py-8 border-b border-white/10 relative">
                                {/* Match Seed Bar */}
                                <div>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(resolvedConfig.seed); setSeedCopied(true); setTimeout(() => setSeedCopied(false), 2000); }}
                                        className="inline-block bg-[#171A21] px-4 py-1.5 rounded-full border border-white/5 text-[10px] font-mono text-slate-500 tracking-widest uppercase hover:text-white hover:border-[#5B8CFF]/50 transition-all shadow-lg"
                                    >
                                        {seedCopied ? <span className="text-emerald-400 font-bold">Seed Copied</span> : <span>Match Seed: <span className="text-[#5B8CFF] font-bold">{resolvedConfig.seed}</span></span>}
                                    </button>
                                </div>

                                {/* Main Tactical Info */}
                                <div className="space-y-4 w-full flex flex-col items-center">
                                    <div className="flex flex-wrap items-center justify-center gap-y-3 gap-x-6 text-slate-200 font-bold text-lg md:text-2xl tracking-tight text-center px-4">
                                        <span className="flex items-center gap-2 whitespace-nowrap">
                                            <Globe size={22} className="text-emerald-400" />
                                            {config.isMapRandom && <span className="text-emerald-400/60 text-sm mr-1">[Random]</span>}
                                            {resolvedConfig.mapType} World
                                        </span>
                                        <span className="hidden md:block text-slate-700">|</span>
                                        <span className="flex items-center gap-2 whitespace-nowrap"><Scale size={22} className="text-amber-400" />{resolvedConfig.preset}</span>
                                        <span className="hidden md:block text-slate-700">|</span>
                                        <span className="flex items-center gap-2 whitespace-nowrap"><Hourglass size={22} className="text-rose-400" />{epochName(resolvedConfig.startEpoch)} → {epochName(resolvedConfig.endEpoch)}</span>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
                                        <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{resolvedConfig.mapSize}</span>
                                        <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{resolvedConfig.resources} Resources</span>
                                        <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{resolvedConfig.gameSpeed} Speed</span>
                                        <span className="text-slate-600">·</span>
                                        <span className="text-slate-400 italic">Point Logic: {resolvedConfig.pointUsage}</span>
                                    </div>

                                    {resolvedConfig.preset === 'Tournament' && (
                                        <div className="px-3 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-2">
                                            <Trophy size={12} /> Tournament Lock Active
                                        </div>
                                    )}
                                </div>

                                {/* Utility Bar */}
                                <div className="flex items-center justify-center gap-2 md:gap-4 mt-2">
                                    <button
                                        onClick={handleShareLink}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-[#5B8CFF] transition-all"
                                        title="Copy Share Link"
                                    >
                                        {linkCopied ? <Check size={14} className="text-emerald-400" /> : <LinkIcon size={14} />}
                                        <span className="hidden sm:inline">{linkCopied ? "Copied" : "Share"}</span>
                                    </button>

                                    <button
                                        onClick={() => setViewMode(prev => prev === 'grid' ? 'compare' : 'grid')}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                                        title="Change View Mode"
                                    >
                                        {viewMode === 'grid' ? <Columns size={14} /> : <LayoutGrid size={14} />}
                                        <span className="hidden sm:inline">{viewMode === 'grid' ? "Compare" : "Grid"}</span>
                                    </button>

                                    <button
                                        onClick={exportData}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                                        title="Download JSON Report"
                                    >
                                        <Download size={14} />
                                        <span className="hidden sm:inline">Export</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={`grid gap-8 md:gap-10 transition-all duration-500 ${viewMode === 'compare' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                            {(() => {
                                const maxPower = civs.length ? Math.max(...civs.map(c => c.powerScore)) : 0;
                                return civs.map((civ, idx) => (
                                    <div key={civ.id} className="animate-fade-in-up" style={{ animationDelay: `${150 + (idx * 150)}ms` }}>
                                        <CivCard civ={civ} onReroll={() => handleReroll(idx)} index={idx} isCompact={viewMode === 'compare'} isTournament={resolvedConfig.preset === 'Tournament'} isTopScore={civ.powerScore === maxPower} config={resolvedConfig} />
                                    </div>
                                ));
                            })()}
                        </div>

                        <div className="text-center pt-12 pb-8 flex justify-center gap-8">
                            <button onClick={handleReforgeAll} className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-orange-400 transition-colors py-4 px-8 border border-transparent hover:border-orange-500/20 rounded-xl">
                                Re-Forge All
                            </button>
                            <button onClick={() => { setIsForged(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-[#5B8CFF] transition-colors py-4 px-8 border border-transparent hover:border-[#5B8CFF]/20 rounded-xl">
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