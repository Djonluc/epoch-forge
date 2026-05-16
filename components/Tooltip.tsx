import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
    className = ''
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    const updateCoords = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top,
                left: rect.left + (rect.width / 2),
            });
            return true;
        }
        return false;
    };

    const handleMouseEnter = () => {
        if (updateCoords()) {
            setIsVisible(true);
        }
    };

    useEffect(() => {
        if (isVisible) {
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
        }
        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
        };
    }, [isVisible]);

    const positionStyles: Record<string, React.CSSProperties> = {
        top: {
            bottom: `calc(100vh - ${coords.top}px + 8px)`,
            left: `${Math.max(120, Math.min(window.innerWidth - 120, coords.left))}px`,
            transform: 'translateX(-50%)'
        },
        bottom: {
            top: `${coords.top + (triggerRef.current?.offsetHeight || 0)}px`,
            left: `${Math.max(120, Math.min(window.innerWidth - 120, coords.left))}px`,
            transform: 'translateX(-50%)',
            marginTop: '8px'
        },
        left: {
            top: `${coords.top + (triggerRef.current?.offsetHeight || 0) / 2}px`,
            right: `calc(100vw - ${coords.left - (triggerRef.current?.offsetWidth || 0) / 2}px + 8px)`,
            transform: 'translateY(-50%)'
        },
        right: {
            top: `${coords.top + (triggerRef.current?.offsetHeight || 0) / 2}px`,
            left: `${coords.left + (triggerRef.current?.offsetWidth || 0) / 2}px`,
            transform: 'translateY(-50%)',
            marginLeft: '8px'
        }
    };

    if (!content) return <>{children}</>;

    return (
        <div
            ref={triggerRef}
            className={`relative inline-block cursor-help pointer-events-auto ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && createPortal(
                <div
                    className={`fixed z-[9999] pointer-events-none px-3 py-2 text-xs font-medium text-slate-200 bg-slate-900/95 backdrop-blur-xl rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10 w-max max-w-[250px] animate-tooltip-in`}
                    style={positionStyles[position]}
                >
                    {content}
                </div>,
                document.body
            )}
        </div>
    );
};
