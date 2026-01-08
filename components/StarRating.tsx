import React from 'react';
import { Star } from 'lucide-react';

interface Props {
    value: number; // 1-5
    label: string;
}

export const StarRating: React.FC<Props> = ({ value, label }) => {
    return (
        <div className="flex items-center justify-between text-sm group">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">{label}</span>
            <div className="flex space-x-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="relative">
                        <Star
                            size={12}
                            className={`${
                                star <= value 
                                    ? "fill-cyan-400 text-cyan-400 drop-shadow-[0_0_3px_rgba(34,211,238,0.5)]" 
                                    : "fill-slate-800 text-slate-800"
                            }`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};