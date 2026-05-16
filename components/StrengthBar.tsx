import React from 'react';
import { Tooltip } from './Tooltip';

interface Props {
    value: number; // 1-5
    label: 'Early' | 'Mid' | 'Late';
    color?: string;
}

export const StrengthBar: React.FC<Props> = ({ value, label, color = "bg-[#5B8CFF]" }) => {
    // Convert 1-5 rating to percentage (20% steps)
    const percentage = Math.min(100, Math.max(10, value * 20));

    const icons = {
        'Early': '⏱',
        'Mid': '⚔',
        'Late': '🚀'
    };

    return (
        <div className="flex items-center gap-3 text-xs mb-1.5 last:mb-0">
            <Tooltip content={<div className="p-1"><strong>{label} Game</strong><br />Impact during this phase.</div>}>
                <div className="w-6 text-center text-sm grayscale opacity-70">
                    {icons[label]}
                </div>
            </Tooltip>
            <div className="flex-1 h-1.5 bg-[#0F1117] rounded-full overflow-hidden border border-white/5">
                <div
                    className={`h-full rounded-full ${color} opacity-90`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};