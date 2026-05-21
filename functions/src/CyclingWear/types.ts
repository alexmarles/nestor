export interface CyclingWardrobeItem {
    name: string;
    category: string;
    notes?: string[];
    preferredConditions?: string[];
    avoidConditions?: string[];
}

export interface CyclingProfile {
    riderProfile?: {
        name?: string;
        runsTemperature?: string;
        sweatProfile?: string;
        ridingStyle?: string;
        notes?: string[];
    };
    preferences?: {
        priorities?: string[];
        likes?: string[];
        dislikes?: string[];
        alwaysPack?: string[];
        neverRecommend?: string[];
    };
    decisionRules?: Array<{
        condition: string;
        recommendation: string;
    }>;
    routeContext?: {
        typicalRoutes?: string[];
        notes?: string[];
    };
    wardrobe: CyclingWardrobeItem[];
    responsePreferences?: {
        style?: string;
        includePackList?: boolean;
        includeAlternative?: boolean;
    };
}
