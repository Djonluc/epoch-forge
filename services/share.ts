
import { AppConfig } from '../types';

// Safe Unicode Base64 Encode
export const encodeConfig = (config: AppConfig): string => {
    try {
        const json = JSON.stringify(config);
        return btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode(parseInt(p1, 16));
        }));
    } catch (e) {
        console.error("Failed to encode config", e);
        return "";
    }
};

// Safe Unicode Base64 Decode
export const decodeConfig = (encoded: string): AppConfig | null => {
    try {
        const json = decodeURIComponent(atob(encoded).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(json);
    } catch (e) {
        console.error("Failed to decode config", e);
        return null;
    }
};
