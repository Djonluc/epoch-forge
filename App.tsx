import React, { useState, useEffect } from 'react';
import { AppConfig, PlayerCiv, PresetMode, PointUsageMode, MapType } from './types';
import { generateCivForPlayer, SeededRNG } from './services/generator';
import { encodeConfig, decodeConfig } from './services/share';
import { SetupScreen } from './components/SetupScreen';
import { CivCard } from './components/CivCard';
import { audioService } from './services/audio';
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
        audioService.playInteraction();
        setConfig(prev => ({ ...prev, ...updates }));
    };

    const epochName = (id: number) => EPOCHS.find(e => e.id === id)?.name || id;

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

        const finalConfig = cfgOverride ? { ...cfgOverride } : { ...config };
        const matchRng = new SeededRNG(`match-rules-${finalConfig.seed}`);

        if (finalConfig.isMapRandom && finalConfig.allowedMaps.length > 0) {
            const index = Math.floor(matchRng.next() * finalConfig.allowedMaps.length);
            finalConfig.mapType = finalConfig.allowedMaps[index];
        }
        if (finalConfig.isPresetRandom && finalConfig.allowedPresets.length > 0) {
            const index = Math.floor(matchRng.next() * finalConfig.allowedPresets.length);
            finalConfig.preset = finalConfig.allowedPresets[index];
        }
        if (finalConfig.isPointUsageRandom && finalConfig.allowedPointUsages.length > 0) {
            const index = Math.floor(matchRng.next() * finalConfig.allowedPointUsages.length);
            finalConfig.pointUsage = finalConfig.allowedPointUsages[index];
        }
        if (finalConfig.isEndEpochRandom) {
            const min = finalConfig.endEpochMin;
            const max = finalConfig.endEpochMax;
            const pick = Math.floor(matchRng.next() * (max - min + 1)) + min;
            finalConfig.endEpoch = pick;
        }

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

        setTimeout(() => {
            setResolvedConfig(finalConfig);
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
                    <div className="flex flex-col items-center gap-1 mt-6">
                        <DjonStNixLogo className="scale-75 md:scale-90 opacity-40 hover:opacity-100 transition-opacity cursor-default" />
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

                    <p className={`font-bold text-sm tracking-[0.3em] uppercase transition-colors duration-700 mt-8 ${isForged ? 'text-amber-500' : 'text-slate-600'}`}>
                        {getHeaderText()}
                    </p>
                </div>

                <div className={`transition-all duration-1000 ${isForged || isForging ? 'opacity-10 blur-[4px] grayscale pointer-events-none' : ''}`}>
                    <SetupScreen config={config} onUpdate={updateConfig} />
                </div>

                {!isForged && (
                    <div className="flex flex-col items-center justify-center pt-12 pb-12 w-full">
                        {isForging ? (
                            <div className="flex flex-col items-center animate-pulse space-y-8">
                                <div className="relative">
                                    <Loader2 className="animate-spin text-orange-500" size={80} />
                                    <div className="absolute inset-0 bg-orange-500/30 blur-3xl rounded-full" />
                                </div>
                                <span className="text-3xl font-black text-white tracking-[0.4em] uppercase italic">Forging Results...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-8 w-full">
                                <button onClick={() => handleForge()} className="group relative flex items-center justify-center w-full max-w-lg h-56 font-black text-white transition-all duration-700 bg-gradient-to-br from-[#12141C] to-[#0A0B10] rounded-[50px] hover:scale-[1.03] active:scale-[0.97] border-2 border-white/5 hover:border-orange-500/40 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/30 via-transparent to-red-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                        {[...Array(15)].map((_, i) => (
                                            <div key={i} className="absolute bottom-[-10%] w-1.5 h-1.5 bg-gradient-to-t from-orange-500 to-amber-300 rounded-full animate-flame-spark"
                                                style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${1 + Math.random() * 2}s`, opacity: 0.4 + Math.random() * 0.4 }} />
                                        ))}
                                    </div>
                                    <div className="relative flex flex-col items-center justify-center pt-4">
                                        <span className="text-base tracking-[0.8em] font-bold text-orange-500/50 mb-3 group-hover:text-orange-400 transition-colors uppercase">Ignite The</span>
                                        <div className="relative">
                                            <span className="text-8xl md:text-9xl tracking-tighter font-black bg-gradient-to-r from-orange-400 via-amber-200 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)]">FORGE</span>
                                            <div className="absolute inset-0 blur-2xl bg-orange-500/10 -z-10 group-hover:bg-orange-500/30 transition-colors" />
                                        </div>
                                    </div>
                                </button>
                                <p className="text-sm font-black text-slate-700 uppercase tracking-[0.8em] transition-colors group-hover:text-amber-900/50 animate-pulse">Awaiting your command</p>
                            </div>
                        )}
                    </div>
                )}

                {isForged && resolvedConfig && (
                    <div id="results-feed" className="space-y-12 pt-4">
                        <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                            <div className="text-center py-6 relative">
                                <div className="mb-4">
                                    <span className="inline-block bg-[#171A21] px-3 py-1 rounded-full border border-white/5 text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                                        Match Seed: <span className="text-[#5B8CFF] font-bold">{resolvedConfig.seed}</span>
                                    </span>
                                </div>
                                <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-5 text-slate-200 font-bold text-lg md:text-xl tracking-tight">
                                    <span className="flex items-center gap-2"><Globe size={20} className="text-emerald-400" />{resolvedConfig.mapType} World</span>
                                    <span className="hidden md:block text-slate-600">·</span>
                                    <span className="flex items-center gap-2"><Scale size={20} className="text-amber-400" />{resolvedConfig.preset}</span>
                                    <span className="hidden md:block text-slate-600">·</span>
                                    <span className="flex items-center gap-2"><Hourglass size={20} className="text-rose-400" />{epochName(resolvedConfig.startEpoch)} → {epochName(resolvedConfig.endEpoch)}</span>
                                </div>
                                <div className="mt-2 text-sm font-medium text-slate-500 flex items-center justify-center gap-2">
                                    <span>Point Logic: <span className="text-slate-400">{resolvedConfig.pointUsage}</span></span>
                                    {resolvedConfig.preset === 'Tournament' && (
                                        <span className="ml-2 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"><Trophy size={10} /> Tournament Lock Active</span>
                                    )}
                                </div>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:flex gap-2">
                                    <button onClick={handleShareLink} className="p-2 text-slate-600 hover:text-white hover:bg-white/5 rounded-lg transition-colors relative">
                                        {linkCopied ? <Check size={20} className="text-emerald-400" /> : <LinkIcon size={20} />}
                                    </button>
                                    <button onClick={() => setViewMode(prev => prev === 'grid' ? 'compare' : 'grid')} className="p-2 text-slate-600 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                        {viewMode === 'grid' ? <Columns size={20} /> : <LayoutGrid size={20} />}
                                    </button>
                                    <button onClick={exportData} className="p-2 text-slate-600 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Download size={20} /></button>
                                </div>
                                <div className="lg:hidden mt-4 flex justify-center gap-4">
                                    <button onClick={handleShareLink} className="text-xs font-bold uppercase tracking-widest text-[#5B8CFF] flex items-center gap-2">
                                        {linkCopied ? <Check size={16} /> : <LinkIcon size={16} />}{linkCopied ? "Link Copied" : "Share Link"}
                                    </button>
                                    <button onClick={() => setViewMode(prev => prev === 'grid' ? 'compare' : 'grid')} className="text-xs font-bold uppercase tracking-widest text-[#5B8CFF] flex items-center gap-2">
                                        {viewMode === 'grid' ? <Columns size={16} /> : <LayoutGrid size={16} />}{viewMode === 'grid' ? "Compare View" : "Card View"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={`grid gap-8 md:gap-10 transition-all duration-500 ${viewMode === 'compare' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                            {(() => {
                                const maxPower = civs.length ? Math.max(...civs.map(c => c.powerScore)) : 0;
                                return civs.map((civ, idx) => (
                                    <div key={civ.id} className="animate-fade-in-up" style={{ animationDelay: `${150 + (idx * 150)}ms` }}>
                                        <CivCard civ={civ} onReroll={() => handleReroll(idx)} index={idx} isCompact={viewMode === 'compare'} isTournament={resolvedConfig.preset === 'Tournament'} isTopScore={civ.powerScore === maxPower} />
                                    </div>
                                ));
                            })()}
                        </div>

                        <div className="text-center pt-12 pb-8">
                            <button onClick={() => { setIsForged(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-[#5B8CFF] transition-colors py-4 px-8">
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