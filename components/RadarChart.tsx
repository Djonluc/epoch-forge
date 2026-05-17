import React from 'react';

interface Props {
    data: { economy: number; military: number; defense: number; mobility: number; tech: number; naval: number };
    color?: string;
    size?: number;
}

export const RadarChart: React.FC<Props> = ({ data, color = '#f97316', size = 150 }) => {
    const center = size / 2;
    const radius = (size / 2) * 0.65;

    const axes = [
        { label: 'MIL', value: data.military },
        { label: 'TECH', value: data.tech },
        { label: 'NAV', value: data.naval },
        { label: 'DEF', value: data.defense },
        { label: 'ECO', value: data.economy },
        { label: 'MOB', value: data.mobility }
    ];

    const getPoint = (value: number, index: number) => {
        const angle = (Math.PI / 3) * index - Math.PI / 2;
        const r = radius * (value / 100);
        return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
    };

    const points = axes.map((a, i) => getPoint(a.value, i));
    const pointStr = points.map(p => `${p.x},${p.y}`).join(' ');
    const levels = [25, 50, 75, 100];

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="overflow-visible">
                {levels.map(l => {
                    const bg = axes.map((_, i) => getPoint(l, i));
                    return <polygon key={l} points={bg.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
                })}
                {axes.map((_, i) => {
                    const end = getPoint(100, i);
                    return <line key={i} x1={center} y1={center} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
                })}
                <polygon points={pointStr} fill={`${color}30`} stroke={color} strokeWidth="2" />
                {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} />)}
                {axes.map((a, i) => {
                    const lp = getPoint(130, i);
                    return <text key={i} x={lp.x} y={lp.y} fill="rgba(255,255,255,0.4)" fontSize="7" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>{a.label}</text>;
                })}
            </svg>
        </div>
    );
};
