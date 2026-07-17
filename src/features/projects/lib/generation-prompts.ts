import type { ProjectInput, AssetType } from "@/types/projects";

export function buildPhase1Prompt(input: ProjectInput): string {
  return `You are an expert digital product creator. Generate a complete digital product business based on these inputs:

Product Idea: ${input.productIdea}
Target Audience: ${input.targetAudience}
Industry: ${input.industry}
Goal: ${input.goal}
Brand Name: ${input.brandName}
Tone: ${input.tone}
Language: ${input.language}

Return ONLY valid JSON matching this exact schema. No markdown, no explanation:

{
  "product_description": {
    "headline": "string",
    "subheadline": "string",
    "shortDescription": "string (2-3 sentences)",
    "longDescription": "string (detailed paragraph)",
    "bulletPoints": ["string", "..."],
    "targetAudience": "string",
    "uniqueValueProp": "string"
  },
  "seo_metadata": {
    "metaTitle": "string (max 60 chars)",
    "metaDescription": "string (max 160 chars)",
    "keywords": ["string", "..."],
    "ogTitle": "string",
    "ogDescription": "string",
    "twitterTitle": "string",
    "twitterDescription": "string",
    "structuredData": {}
  },
  "ebook_outline": {
    "title": "string",
    "subtitle": "string",
    "introduction": "string",
    "chapters": [
      { "number": 1, "title": "string", "description": "string", "keyPoints": ["string"] }
    ],
    "conclusion": "string",
    "callToAction": "string"
  },
  "workbook": {
    "title": "string",
    "introduction": "string",
    "modules": [
      {
        "title": "string",
        "objective": "string",
        "exercises": [
          { "title": "string", "prompt": "string", "fieldCount": 3 }
        ]
      }
    ]
  },
  "checklist": {
    "title": "string",
    "description": "string",
    "sections": [
      { "title": "string", "items": [{ "text": "string", "note": "string" }] }
    ]
  },
  "lead_magnet": {
    "title": "string",
    "subtitle": "string",
    "hook": "string",
    "sections": [
      { "heading": "string", "content": "string", "tip": "string" }
    ],
    "cta": "string"
  },
  "social_media_pack": {
    "posts": [
      { "platform": "instagram", "caption": "string", "hashtags": ["string"], "hook": "string" },
      { "platform": "linkedin", "caption": "string", "hashtags": ["string"], "hook": "string" },
      { "platform": "twitter", "caption": "string", "hashtags": ["string"], "hook": "string" },
      { "platform": "facebook", "caption": "string", "hashtags": ["string"], "hook": "string" }
    ]
  },
  "ai_cover": {
    "title": "string",
    "subtitle": "string",
    "authorName": "${input.brandName}",
    "tagline": "string",
    "style": "professional",
    "primaryColor": "${input.primaryColor}",
    "secondaryColor": "${input.secondaryColor}"
  },
  "faq": {
    "items": [
      { "question": "string", "answer": "string" }
    ]
  },
  "cta_pack": {
    "ctas": [
      { "context": "string", "primary": "string", "secondary": "string", "microcopy": "string" }
    ]
  },
  "download_page": {
    "headline": "string",
    "subheadline": "string",
    "thankYouMessage": "string",
    "deliverableTitle": "string",
    "downloadInstructions": "string",
    "bonusItems": [{ "title": "string", "description": "string" }],
    "nextSteps": ["string"],
    "cta": "string"
  }
}

Requirements:
- Write in ${input.language} language
- Use a ${input.tone} tone throughout
- Make all content specific to: ${input.productIdea}
- Include at least 5 FAQ items, 5 bullet points, 5 chapters, 5 email steps, 6 checklist items
- All content must be original, engaging, and conversion-focused`;
}

export function buildEmailSequencePrompt(input: ProjectInput): string {
  return `You are an expert email copywriter. Create a 7-email welcome and nurture sequence for this digital product:

Product: ${input.productIdea}
Target Audience: ${input.targetAudience}
Brand: ${input.brandName}
Tone: ${input.tone}
Goal: ${input.goal}
Language: ${input.language}

Return ONLY valid JSON. No markdown:

{
  "email_sequence": {
    "emails": [
      {
        "subject": "string",
        "preheader": "string (max 90 chars)",
        "body": "string (full email body with personalization)",
        "cta": "string",
        "delay": "string (e.g. Immediately, Day 2, Day 4)"
      }
    ]
  }
}

Emails: Welcome, Value delivery, Pain point, Case study, Objection handling, Scarcity/urgency, Final CTA.
Use ${input.tone} tone. Write in ${input.language}.`;
}

export function buildRegenerateAssetPrompt(input: ProjectInput, assetType: AssetType, instruction?: string): string {
  return `You are an expert digital product creator. Regenerate the ${assetType.replace(/_/g, ' ')} for:

Product: ${input.productIdea}
Audience: ${input.targetAudience}
Brand: ${input.brandName}
Tone: ${input.tone}
Language: ${input.language}
${instruction ? `Special instruction: ${instruction}` : ''}

Return ONLY valid JSON for the "${assetType}" key (same schema as before). No markdown, no extra keys.`;
}
