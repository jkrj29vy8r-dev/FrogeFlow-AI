import type { LandingPageInput, SectionType } from "@/types/landing-pages";
import { DEFAULT_SECTIONS_BY_TYPE } from "@/types/landing-pages";

export function buildLandingPagePrompt(input: LandingPageInput): string {
  const sections = DEFAULT_SECTIONS_BY_TYPE[input.pageType];
  const sectionList = sections.join(', ');

  return `You are an expert conversion copywriter and marketing strategist with 20+ years of experience writing landing pages for top SaaS products, info-products, and services.

Your task: Generate complete, conversion-optimized landing page content as a single valid JSON object.

## PAGE DETAILS
- Page Type: ${input.pageType.replace('_', ' ')} page
- Product Name: ${input.productName}
- Description: ${input.description}
- Target Audience: ${input.targetAudience}
- Industry: ${input.industry}
- Writing Tone: ${input.tone}
- Copywriting Framework: ${input.framework}
- Primary Call-to-Action: ${input.cta}
${input.testimonials ? `- Customer Testimonials (use these verbatim): ${input.testimonials}` : ''}
${input.faqs ? `- FAQs to include: ${input.faqs}` : ''}

## COPYWRITING FRAMEWORK
Apply the ${input.framework} framework throughout:
${getFrameworkInstructions(input.framework)}

## REQUIRED SECTIONS
Generate these sections IN ORDER: ${sectionList}

## OUTPUT FORMAT
Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:

{
  "seo": {
    "title": "string (50-60 chars, includes product name + main benefit)",
    "description": "string (150-160 chars, compelling description with CTA)",
    "og_title": "string",
    "og_description": "string (max 200 chars)",
    "twitter_title": "string",
    "twitter_description": "string (max 200 chars)",
    "canonical_path": "/string-slug",
    "schema": {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "string",
      "description": "string"
    }
  },
  "sections": [
    ${sections.map(s => getSectionSchema(s)).join(',\n    ')}
  ]
}

## CONTENT GUIDELINES
- Write in a ${input.tone} tone targeting: ${input.targetAudience}
- Headlines: Bold, specific, benefit-driven, 6-12 words
- Subheadlines: Expand on headline, 15-25 words
- CTAs: Action verbs, specific, urgent
- Benefits/Features: 3-6 items per section
- Testimonials: Include name, role, company, specific quote with measurable results
- Avoid generic filler copy — make every word earn its place
- Focus on transformation: from pain → to desired outcome
- Use power words: "finally", "discover", "proven", "exclusive", "guaranteed"

Return ONLY the JSON object. No markdown code fences. No additional text.`;
}

function getFrameworkInstructions(framework: string): string {
  switch (framework) {
    case 'AIDA':
      return '- Attention: Hook with a bold claim or question in the hero\n- Interest: Build curiosity with features/benefits\n- Desire: Create emotional appeal with testimonials/results\n- Action: Compelling CTAs throughout';
    case 'PAS':
      return '- Problem: Identify the painful problem your audience faces\n- Agitate: Amplify the pain and consequences of not solving it\n- Solution: Present your product as the perfect solution';
    case 'BAB':
      return '- Before: Paint a vivid picture of life before your product\n- After: Show the transformation and desired outcome\n- Bridge: Explain how your product creates that transformation';
    case 'StoryBrand':
      return '- Character: Customer is the hero, you are the guide\n- Problem: External, internal, and philosophical problems\n- Plan: Clear 3-step plan\n- Success: Vision of success\n- Failure: Stakes if they do nothing';
    default:
      return '- Write persuasive, conversion-focused copy';
  }
}

function getSectionSchema(type: SectionType): string {
  switch (type) {
    case 'hero':
      return `{
      "section_type": "hero",
      "content": {
        "badge": "string or null (short pill text like 'New' or '10,000+ users')",
        "headline": "string (powerful H1, 6-10 words)",
        "subheadline": "string (2-3 sentences expanding on the headline value prop)",
        "primaryCta": { "text": "string", "href": "#" },
        "secondaryCta": { "text": "string or null", "href": "#features" },
        "socialProof": "string or null (e.g. '✓ 30-day guarantee  ✓ No credit card required')"
      }
    }`;
    case 'pain_points':
      return `{
      "section_type": "pain_points",
      "content": {
        "headline": "string",
        "subheadline": "string or null",
        "items": [
          { "emoji": "😤", "title": "string", "description": "string (1-2 sentences)" },
          { "emoji": "😰", "title": "string", "description": "string" },
          { "emoji": "😩", "title": "string", "description": "string" }
        ]
      }
    }`;
    case 'solution':
      return `{
      "section_type": "solution",
      "content": {
        "headline": "string",
        "subheadline": "string or null",
        "description": "string (2-3 sentences about your solution)",
        "points": ["string", "string", "string", "string"]
      }
    }`;
    case 'features':
      return `{
      "section_type": "features",
      "content": {
        "headline": "string",
        "subheadline": "string or null",
        "items": [
          { "title": "string", "description": "string (2-3 sentences)", "badge": "string or null" },
          { "title": "string", "description": "string", "badge": null },
          { "title": "string", "description": "string", "badge": null },
          { "title": "string", "description": "string", "badge": null }
        ]
      }
    }`;
    case 'benefits':
      return `{
      "section_type": "benefits",
      "content": {
        "headline": "string",
        "subheadline": "string or null",
        "items": [
          { "icon": "⚡", "title": "string", "description": "string (1-2 sentences)" },
          { "icon": "🎯", "title": "string", "description": "string" },
          { "icon": "🚀", "title": "string", "description": "string" }
        ]
      }
    }`;
    case 'how_it_works':
      return `{
      "section_type": "how_it_works",
      "content": {
        "headline": "string",
        "subheadline": "string or null",
        "steps": [
          { "step": "1", "title": "string", "description": "string (2-3 sentences)" },
          { "step": "2", "title": "string", "description": "string" },
          { "step": "3", "title": "string", "description": "string" }
        ]
      }
    }`;
    case 'testimonials':
      return `{
      "section_type": "testimonials",
      "content": {
        "headline": "string",
        "subheadline": "string or null",
        "items": [
          { "name": "string", "role": "string", "company": "string or null", "quote": "string (specific result-oriented testimonial)", "rating": 5 },
          { "name": "string", "role": "string", "company": "string or null", "quote": "string", "rating": 5 },
          { "name": "string", "role": "string", "company": "string or null", "quote": "string", "rating": 5 }
        ]
      }
    }`;
    case 'pricing':
      return `{
      "section_type": "pricing",
      "content": {
        "headline": "string",
        "subheadline": "string or null",
        "plans": [
          {
            "name": "Starter",
            "price": "$X",
            "period": "/month",
            "description": "string",
            "features": ["string", "string", "string", "string"],
            "cta": "string",
            "highlighted": false,
            "badge": null
          },
          {
            "name": "Pro",
            "price": "$X",
            "period": "/month",
            "description": "string",
            "features": ["string", "string", "string", "string", "string"],
            "cta": "string",
            "highlighted": true,
            "badge": "Most Popular"
          }
        ]
      }
    }`;
    case 'faq':
      return `{
      "section_type": "faq",
      "content": {
        "headline": "string",
        "subheadline": "string or null",
        "items": [
          { "question": "string", "answer": "string (2-4 sentences)" },
          { "question": "string", "answer": "string" },
          { "question": "string", "answer": "string" },
          { "question": "string", "answer": "string" },
          { "question": "string", "answer": "string" }
        ]
      }
    }`;
    case 'guarantee':
      return `{
      "section_type": "guarantee",
      "content": {
        "headline": "string",
        "description": "string (2-3 sentences describing the guarantee)",
        "badge": "string or null (e.g. '100% Satisfaction')",
        "period": "string or null (e.g. '30 days')"
      }
    }`;
    case 'about':
      return `{
      "section_type": "about",
      "content": {
        "headline": "string",
        "description": "string (3-4 sentences about the company/creator)",
        "stats": [
          { "value": "string (e.g. '10,000+')", "label": "string" },
          { "value": "string", "label": "string" },
          { "value": "string", "label": "string" }
        ]
      }
    }`;
    case 'cta':
      return `{
      "section_type": "cta",
      "content": {
        "headline": "string (compelling final push, 6-10 words)",
        "subheadline": "string or null",
        "primaryCta": { "text": "string", "href": "#" },
        "secondaryCta": { "text": "string or null", "href": "#" }
      }
    }`;
    case 'footer':
      return `{
      "section_type": "footer",
      "content": {
        "companyName": "string",
        "tagline": "string or null",
        "links": [
          { "label": "Privacy Policy", "href": "/privacy" },
          { "label": "Terms of Service", "href": "/terms" },
          { "label": "Contact", "href": "/contact" }
        ],
        "copyright": "string (e.g. '© 2025 Company. All rights reserved.')"
      }
    }`;
    default:
      return `{ "section_type": "${type}", "content": {} }`;
  }
}

export function buildRegenerateSectionPrompt(
  input: LandingPageInput,
  sectionType: SectionType,
  currentContent: Record<string, unknown>,
  instruction?: string
): string {
  return `You are an expert conversion copywriter. Regenerate this ${sectionType} section for a ${input.pageType} page.

## PRODUCT
- Name: ${input.productName}
- Description: ${input.description}
- Target Audience: ${input.targetAudience}
- Tone: ${input.tone}
- Primary CTA: ${input.cta}

## CURRENT CONTENT
${JSON.stringify(currentContent, null, 2)}

## TASK
${instruction ? `User request: ${instruction}\n\n` : ''}Rewrite this section with fresh, more compelling copy. Maintain the same JSON structure.

Return ONLY the content JSON object (the value of "content", not the outer section wrapper). No markdown, no explanation.`;
}
