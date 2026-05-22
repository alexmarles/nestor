# Cycling Profile Export Prompt

Send the prompt below to your ChatGPT chat that already knows your cycling wardrobe and preferences. Then place the JSON-only answer in `functions/config/cycling-profile.json`.

```text
I want you to export everything you already know about my cycling clothing, what items I own, and my wearing preferences into a JSON context file for a Telegram bot.

Important rules:
- Use only information you already know from this chat.
- Do not invent clothes, accessories, preferences, thresholds, or habits.
- If something is unknown, leave it out instead of guessing.
- Normalize duplicate items and keep names practical and short.
- Output valid JSON only.
- Do not wrap the JSON in markdown fences.
- Every wardrobe item must include "name" and "category".
- If you know how I naturally name clothing items in Catalan or Spanish, include those in "translations".
- Keep short notes as arrays of strings when useful.

Use exactly this JSON structure:
{
  "riderProfile": {
    "name": "string",
    "runsTemperature": "string",
    "sweatProfile": "string",
    "ridingStyle": "string",
    "notes": ["string"]
  },
  "preferences": {
    "priorities": ["string"],
    "likes": ["string"],
    "dislikes": ["string"],
    "alwaysPack": ["string"],
    "neverRecommend": ["string"]
  },
  "decisionRules": [
    {
      "condition": "string",
      "recommendation": "string"
    }
  ],
  "routeContext": {
    "typicalRoutes": ["string"],
    "notes": ["string"]
  },
  "wardrobe": [
    {
      "name": "string",
      "category": "string",
      "translations": {
        "es": "string",
        "ca": "string"
      },
      "notes": ["string"],
      "preferredConditions": ["string"],
      "avoidConditions": ["string"]
    }
  ],
  "responsePreferences": {
    "style": "concise",
    "includePackList": true,
    "includeAlternative": true
  }
}

Additional guidance:
- In "decisionRules", include any real temperature, rain, wind, descent, layering, or comfort rules you know I follow.
- In "wardrobe", include all owned cycling items you know about: jerseys, base layers, jackets, gilets, bibs, tights, warmers, gloves, socks, overshoes, caps, etc.
- Use categories like "base-layer", "jersey", "outer-layer", "bottoms", "accessory", "gloves", or "footwear" when appropriate.
- In "translations", prefer practical item names I would naturally use in each language rather than literal word-for-word translations.
- Keep the output compact but complete enough for the bot to make clothing recommendations from a forecast message.
```
