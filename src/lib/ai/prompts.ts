import type { DocumentType } from "@/types/database";
import type { DocumentMetadata, OutlineSection } from "@/features/documents/types";

// ── Section count by length ───────────────────────────────────────────────────

const SECTION_COUNTS: Record<string, Record<string, number>> = {
  ebook: { short: 5, medium: 8, long: 12, comprehensive: 18 },
  pdf_guide: { short: 4, medium: 7, long: 10, comprehensive: 14 },
  checklist: { short: 3, medium: 5, long: 7, comprehensive: 10 },
  workbook: { short: 4, medium: 6, long: 9, comprehensive: 12 },
  default: { short: 4, medium: 7, long: 10, comprehensive: 14 },
};

function getSectionCount(type: DocumentType, length: string): number {
  return (SECTION_COUNTS[type] ?? SECTION_COUNTS.default)[length] ?? 7;
}

// ── Product type instructions ─────────────────────────────────────────────────

const TYPE_INSTRUCTIONS: Record<string, string> = {
  ebook: `Structure this as a complete eBook with:
- An engaging Introduction that hooks the reader
- Well-developed chapters that flow logically
- A satisfying Conclusion summarizing key insights
- A compelling Call to Action`,

  pdf_guide: `Structure this as an actionable PDF guide with:
- A clear Introduction explaining the purpose and benefits
- Step-by-step chapters with practical instructions
- A Tips section with quick wins and best practices
- A Conclusion with next steps`,

  checklist: `Structure this as a practical checklist with:
- A brief Introduction explaining how to use the checklist
- Grouped checklist sections, each covering a distinct area
- A short Conclusion with final thoughts`,

  workbook: `Structure this as an interactive workbook with:
- An Introduction setting expectations and goals
- Exercise chapters with reflection prompts and writing space
- A Conclusion celebrating progress and next steps`,

  default: `Structure this as professional content with:
- A clear Introduction
- Well-organized main sections
- A strong Conclusion`,
};

// ── Outline prompt ────────────────────────────────────────────────────────────

export function buildOutlinePrompt(type: DocumentType, metadata: DocumentMetadata): string {
  const sectionCount = getSectionCount(type, metadata.length);
  const typeInstructions = TYPE_INSTRUCTIONS[type] ?? TYPE_INSTRUCTIONS.default;

  return `You are an expert content strategist and ${type.replace(/_/g, " ")} creator.

Create a detailed outline for a ${type.replace(/_/g, " ")} with these specifications:
- Topic/Title: ${metadata.title}
- Description: ${metadata.description}
- Target Audience: ${metadata.audience}
- Language: ${metadata.language}
- Writing Style: ${metadata.writing_style}
- Tone: ${metadata.tone}
- Knowledge Level: ${metadata.knowledge_level}
- Length: ${metadata.length} (~${sectionCount} sections)
- Goal: ${metadata.goal}
${metadata.notes ? `- Additional Notes: ${metadata.notes}` : ""}

${typeInstructions}

Return ONLY a valid JSON object. No markdown, no explanation, no code blocks. Just the JSON:

{
  "sections": [
    {
      "position": 1,
      "title": "Section title here",
      "section_type": "introduction",
      "description": "One sentence describing what this section covers"
    }
  ]
}

Valid section_type values: introduction, chapter, subchapter, conclusion, cta, checklist_group, exercise, tips

Requirements:
- Generate exactly ${sectionCount} sections
- Make titles specific and compelling, not generic
- Descriptions must be one clear sentence
- First section must be introduction
- Last or second-to-last section must be conclusion
- Tailor content to ${metadata.knowledge_level} level ${metadata.audience}
- Write section titles in ${metadata.language}`;
}

// ── Section content prompt ────────────────────────────────────────────────────

export function buildSectionPrompt(
  type: DocumentType,
  metadata: DocumentMetadata,
  section: OutlineSection,
  allSections: OutlineSection[],
  targetWordCount: number
): string {
  const sectionList = allSections
    .map((s) => `  ${s.position}. ${s.title}`)
    .join("\n");

  const sectionTypeGuidance: Record<string, string> = {
    introduction: `Write a compelling introduction that:
- Opens with a hook (story, statistic, or provocative question)
- Clearly states what the reader will learn
- Builds anticipation for what's ahead
- Ends with a smooth transition to the first chapter`,

    chapter: `Write a well-structured chapter that:
- Opens with a clear statement of the chapter's focus
- Provides substantive, actionable content
- Uses examples, analogies, or case studies to illustrate points
- Ends with a brief summary or key takeaway`,

    subchapter: `Write a focused subchapter that:
- Dives deep into one specific aspect
- Provides detailed, practical information
- Includes specific examples or steps`,

    conclusion: `Write a satisfying conclusion that:
- Summarizes the key insights from the entire ${type.replace(/_/g, " ")}
- Reinforces the main transformation or value delivered
- Motivates the reader to apply what they've learned
- Ends on an inspiring, memorable note`,

    cta: `Write a compelling call to action that:
- Acknowledges the reader's journey
- Presents a clear next step or offer
- Creates urgency without being pushy
- Ends with encouragement`,

    checklist_group: `Write a checklist section that:
- Introduces this group of items with context
- Presents each item as a clear, actionable checkbox item
- Uses the format: "☐ [Action verb] [specific task]"
- Groups items logically
- Adds brief explanations where helpful`,

    exercise: `Write an interactive exercise that:
- Clearly states the exercise objective
- Provides step-by-step instructions
- Includes reflection prompts or fill-in-the-blank spaces
- Ends with a debrief or what to do with the results`,

    tips: `Write a practical tips section that:
- Presents each tip with a bold headline
- Explains the tip concisely and clearly
- Provides a practical example for each tip
- Makes tips immediately actionable`,
  };

  const guidance =
    sectionTypeGuidance[section.section_type] ??
    sectionTypeGuidance.chapter;

  return `You are writing a ${type.replace(/_/g, " ")} for ${metadata.audience}.

Document context:
- Title: ${metadata.title}
- Goal: ${metadata.goal}
- Tone: ${metadata.tone}
- Writing Style: ${metadata.writing_style}
- Knowledge Level: ${metadata.knowledge_level}
- Language: ${metadata.language}

Full outline:
${sectionList}

You are now writing Section ${section.position}: "${section.title}"
Section type: ${section.section_type}
Section purpose: ${section.description}

${guidance}

Writing requirements:
- Target approximately ${targetWordCount} words
- Match the ${metadata.tone} tone throughout
- Write in ${metadata.language}
- Pitch content to ${metadata.knowledge_level} level readers
- Do NOT include the section title as a heading — start with the content directly
- Do NOT include meta-commentary like "In this section..." or "As mentioned..."
- Write the actual content, not a description of what you will write`;
}
