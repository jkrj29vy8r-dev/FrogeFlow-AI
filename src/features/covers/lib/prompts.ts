import type { CoverInput } from "@/types/covers";

export function buildCoverGenerationPrompt(input: CoverInput): string {
  return `You are a professional cover designer. Generate 4 distinct cover design variations for this digital product.

Product: ${input.title}
Subtitle: ${input.subtitle || 'none'}
Author/Brand: ${input.author || input.brandName || 'none'}
Product Type: ${input.productType}
Industry: ${input.industry}
Target Audience: ${input.targetAudience}
Style preference: ${input.style}
Brand colors: Primary ${input.primaryColor}, Secondary ${input.secondaryColor}

Return ONLY valid JSON (no markdown, no explanation) matching this exact schema:

{
  "variations": [
    {
      "name": "string (2-3 word design name)",
      "description": "string (one sentence)",
      "layout": "centered" | "bold" | "minimal" | "split" | "professional" | "creative",
      "background": {
        "type": "gradient" | "solid" | "pattern",
        "gradient": {
          "angle": number,
          "stops": [{ "color": "#rrggbb", "position": 0 }, { "color": "#rrggbb", "position": 100 }]
        },
        "color": "#rrggbb or null",
        "pattern": "dots" | "grid" | "diagonal" | null,
        "patternColor": "rgba string or null"
      },
      "textColors": {
        "title": "#rrggbb or rgba string",
        "subtitle": "#rrggbb or rgba string",
        "author": "#rrggbb or rgba string"
      },
      "accentColor": "#rrggbb",
      "fonts": {
        "title": "Playfair Display" | "Montserrat" | "Lato" | "Poppins" | "Merriweather" | "Raleway",
        "subtitle": "Playfair Display" | "Montserrat" | "Lato" | "Poppins" | "Merriweather" | "Raleway",
        "author": "Playfair Display" | "Montserrat" | "Lato" | "Poppins" | "Merriweather" | "Raleway"
      }
    }
  ]
}

Requirements:
- Each variation must be visually DISTINCT — different color palette, layout, and mood
- Match the industry and target audience aesthetically
- Use beautiful, harmonious color combinations
- Include one dark variation, one light variation, and two others
- The accent color must contrast well with the background
- Include gradient backgrounds with at least 2 stops for most variations
- One variation MUST use layout "minimal" with a light background
- One variation MUST use layout "bold" or "creative" with dark dramatic colors
- Ensure all 4 layout types are different from each other
- Make colors specific to the industry (health = green tones, finance = navy/gold, tech = purple/blue, etc.)`;
}

export function buildColorSuggestionsPrompt(industry: string, mood: string): string {
  return `Suggest 3 color palette combinations for a ${industry} digital product with a ${mood} mood.
Return ONLY valid JSON:
{
  "palettes": [
    {
      "name": "string",
      "primary": "#rrggbb",
      "secondary": "#rrggbb",
      "accent": "#rrggbb",
      "textDark": "#rrggbb",
      "textLight": "#rrggbb"
    }
  ]
}`;
}
