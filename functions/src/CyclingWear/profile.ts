import fs from 'node:fs';
import path from 'node:path';

import { CyclingProfile } from './types';

const DEFAULT_PROFILE_PATH = path.join(
    process.cwd(),
    'config',
    'cycling-profile.json'
);

export function getCyclingProfilePath(): string {
    const configuredPath = process.env.CYCLING_PROFILE_PATH?.trim();

    if (!configuredPath) return DEFAULT_PROFILE_PATH;

    return path.isAbsolute(configuredPath) ?
        configuredPath :
        path.join(process.cwd(), configuredPath);
}

export function loadCyclingProfile(): CyclingProfile {
    const profilePath = getCyclingProfilePath();

    if (!fs.existsSync(profilePath)) {
        throw new Error(`Missing cycling profile file at ${profilePath}`);
    }

    const raw = fs.readFileSync(profilePath, 'utf8');
    const parsed = JSON.parse(raw) as CyclingProfile;

    validateCyclingProfile(parsed);

    return parsed;
}

function validateCyclingProfile(profile: CyclingProfile): void {
    if (!profile || typeof profile !== 'object') {
        throw new Error('Cycling profile must be a JSON object.');
    }

    if (!Array.isArray(profile.wardrobe) || profile.wardrobe.length === 0) {
        throw new Error('Cycling profile must include a non-empty wardrobe.');
    }

    const invalidItem = profile.wardrobe.find(
        (item) =>
            !item ||
            typeof item !== 'object' ||
            typeof item.name !== 'string' ||
            typeof item.category !== 'string'
    );

    if (invalidItem) {
        throw new Error(
            'Each wardrobe item must include at least "name" and "category".'
        );
    }
}
