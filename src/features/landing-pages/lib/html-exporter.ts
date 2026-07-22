import type {
  LandingPage,
  LandingPageSection,
  HeroContent,
  PainPointsContent,
  SolutionContent,
  FeaturesContent,
  BenefitsContent,
  HowItWorksContent,
  TestimonialsContent,
  PricingContent,
  FAQContent,
  GuaranteeContent,
  AboutContent,
  CTAContent,
  FooterContent,
} from "@/types/landing-pages";

interface ExportInput {
  page: LandingPage;
  sections: LandingPageSection[];
}

// ── HTML Export ───────────────────────────────────────────────────────────────

export function exportAsHtml({ page, sections }: ExportInput): string {
  const primary = page.settings.primaryColor || '#6366f1';
  const secondary = page.settings.secondaryColor || '#8b5cf6';
  const visibleSections = sections.filter(s => s.is_visible).sort((a, b) => a.position - b.position);

  const sectionsHtml = visibleSections.map(s => renderSectionHtml(s, primary, secondary)).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(page.seo.title)}</title>
  <meta name="description" content="${escHtml(page.seo.description)}" />
  <meta property="og:title" content="${escHtml(page.seo.og_title)}" />
  <meta property="og:description" content="${escHtml(page.seo.og_description)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escHtml(page.seo.twitter_title)}" />
  <meta name="twitter:description" content="${escHtml(page.seo.twitter_description)}" />
  <link rel="canonical" href="${escHtml(page.seo.canonical_path)}" />
  <script type="application/ld+json">${JSON.stringify(page.seo.schema)}</script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --primary: ${primary}; --secondary: ${secondary}; }
    html { overflow-x: hidden; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      color: #111827;
      background: #fff;
      line-height: 1.6;
      /* AI-generated headlines/descriptions can contain long unbroken
         words or URLs with no natural wrap point — without this, a single
         long token overflows its container and causes horizontal scroll
         on the exported page. Inherited by every heading/paragraph below. */
      overflow-wrap: break-word;
      word-break: break-word;
    }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    section { padding: 80px 0; }
    h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; }
    h2 { font-size: clamp(1.5rem, 3vw, 2.25rem); font-weight: 700; line-height: 1.2; letter-spacing: -0.01em; }
    h3 { font-size: 1.125rem; font-weight: 600; }
    p { color: #4b5563; font-size: 1.0625rem; }
    .badge { display: inline-flex; align-items: center; padding: 4px 14px; border-radius: 999px; font-size: 0.8125rem; font-weight: 600; background: color-mix(in srgb, var(--primary) 12%, transparent); color: var(--primary); margin-bottom: 20px; }
    .btn { display: inline-flex; align-items: center; padding: 12px 28px; border-radius: 8px; font-size: 1rem; font-weight: 600; text-decoration: none; cursor: pointer; transition: opacity .15s; }
    .btn:hover { opacity: .88; }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-outline { background: transparent; color: var(--primary); border: 2px solid var(--primary); }
    .btn-white { background: #fff; color: var(--primary); }
    .text-center { text-align: center; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 48px; }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-top: 48px; }
    .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 28px; }
    .subtext { font-size: 1.125rem; color: #6b7280; margin-top: 16px; }
    .divider { width: 48px; height: 4px; background: var(--primary); border-radius: 2px; margin: 16px auto 0; }
    .star { color: #fbbf24; }
    @media (max-width: 640px) { section { padding: 48px 0; } .grid-3, .grid-2 { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
${sectionsHtml}
</body>
</html>`;
}

function renderSectionHtml(section: LandingPageSection, primary: string, _secondary: string): string {
  const c = section.content;
  switch (section.section_type) {
    case 'hero': return renderHeroHtml(c as unknown as HeroContent, primary);
    case 'pain_points': return renderPainPointsHtml(c as unknown as PainPointsContent);
    case 'solution': return renderSolutionHtml(c as unknown as SolutionContent, primary);
    case 'features': return renderFeaturesHtml(c as unknown as FeaturesContent);
    case 'benefits': return renderBenefitsHtml(c as unknown as BenefitsContent);
    case 'how_it_works': return renderHowItWorksHtml(c as unknown as HowItWorksContent, primary);
    case 'testimonials': return renderTestimonialsHtml(c as unknown as TestimonialsContent);
    case 'pricing': return renderPricingHtml(c as unknown as PricingContent, primary);
    case 'faq': return renderFAQHtml(c as unknown as FAQContent);
    case 'guarantee': return renderGuaranteeHtml(c as unknown as GuaranteeContent, primary);
    case 'about': return renderAboutHtml(c as unknown as AboutContent);
    case 'cta': return renderCTAHtml(c as unknown as CTAContent, primary);
    case 'footer': return renderFooterHtml(c as unknown as FooterContent);
    default: return '';
  }
}

function escHtml(s: string): string {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderHeroHtml(c: HeroContent, _primary: string): string {
  return `<section style="background:linear-gradient(135deg,#f0f4ff 0%,#faf0ff 100%);padding:100px 0 80px">
  <div class="container text-center">
    ${c.badge ? `<span class="badge">${escHtml(c.badge)}</span>` : ''}
    <h1>${escHtml(c.headline)}</h1>
    <p class="subtext" style="max-width:600px;margin:16px auto 0">${escHtml(c.subheadline)}</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:36px">
      <a href="${escHtml(c.primaryCta.href)}" class="btn btn-primary">${escHtml(c.primaryCta.text)}</a>
      ${c.secondaryCta ? `<a href="${escHtml(c.secondaryCta.href)}" class="btn btn-outline">${escHtml(c.secondaryCta.text)}</a>` : ''}
    </div>
    ${c.socialProof ? `<p style="margin-top:24px;font-size:.875rem;color:#6b7280">${escHtml(c.socialProof)}</p>` : ''}
  </div>
</section>`;
}

function renderPainPointsHtml(c: PainPointsContent): string {
  const items = (c.items ?? []).map(i => `
    <div class="card">
      <div style="font-size:2rem;margin-bottom:12px">${i.emoji}</div>
      <h3>${escHtml(i.title)}</h3>
      <p style="margin-top:8px">${escHtml(i.description)}</p>
    </div>`).join('');
  return `<section style="background:#fff8f0">
  <div class="container text-center">
    <h2>${escHtml(c.headline)}</h2>
    ${c.subheadline ? `<p class="subtext">${escHtml(c.subheadline)}</p>` : ''}
    <div class="grid-3">${items}</div>
  </div>
</section>`;
}

function renderSolutionHtml(c: SolutionContent, _primary: string): string {
  const points = (c.points ?? []).map(p => `<li style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px">
    <span style="color:var(--primary);font-weight:700;flex-shrink:0">✓</span>
    <span>${escHtml(p)}</span></li>`).join('');
  return `<section>
  <div class="container" style="max-width:760px">
    <h2 class="text-center">${escHtml(c.headline)}</h2>
    ${c.subheadline ? `<p class="subtext text-center">${escHtml(c.subheadline)}</p>` : ''}
    <p style="margin-top:24px;text-align:center">${escHtml(c.description)}</p>
    <ul style="margin-top:28px;list-style:none">${points}</ul>
  </div>
</section>`;
}

function renderFeaturesHtml(c: FeaturesContent): string {
  const items = (c.items ?? []).map(i => `
    <div class="card">
      ${i.badge ? `<span class="badge" style="font-size:.75rem;padding:2px 10px;margin-bottom:12px">${escHtml(i.badge)}</span>` : ''}
      <h3>${escHtml(i.title)}</h3>
      <p style="margin-top:8px">${escHtml(i.description)}</p>
    </div>`).join('');
  return `<section style="background:#fafafa">
  <div class="container">
    <div class="text-center" style="margin-bottom:8px">
      <h2>${escHtml(c.headline)}</h2>
      ${c.subheadline ? `<p class="subtext">${escHtml(c.subheadline)}</p>` : ''}
    </div>
    <div class="grid-2">${items}</div>
  </div>
</section>`;
}

function renderBenefitsHtml(c: BenefitsContent): string {
  const items = (c.items ?? []).map(i => `
    <div class="card text-center">
      <div style="font-size:2.25rem;margin-bottom:14px">${i.icon}</div>
      <h3>${escHtml(i.title)}</h3>
      <p style="margin-top:8px">${escHtml(i.description)}</p>
    </div>`).join('');
  return `<section>
  <div class="container text-center">
    <h2>${escHtml(c.headline)}</h2>
    ${c.subheadline ? `<p class="subtext">${escHtml(c.subheadline)}</p>` : ''}
    <div class="grid-3">${items}</div>
  </div>
</section>`;
}

function renderHowItWorksHtml(c: HowItWorksContent, _primary: string): string {
  const steps = (c.steps ?? []).map((s, i) => `
    <div style="display:flex;gap:20px;align-items:flex-start${i < (c.steps?.length ?? 0) - 1 ? ';margin-bottom:36px' : ''}">
      <div style="min-width:44px;height:44px;background:var(--primary);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.125rem;flex-shrink:0">${s.step}</div>
      <div>
        <h3>${escHtml(s.title)}</h3>
        <p style="margin-top:6px">${escHtml(s.description)}</p>
      </div>
    </div>`).join('');
  return `<section style="background:#f8faff">
  <div class="container" style="max-width:720px">
    <h2 class="text-center">${escHtml(c.headline)}</h2>
    ${c.subheadline ? `<p class="subtext text-center">${escHtml(c.subheadline)}</p>` : ''}
    <div style="margin-top:48px">${steps}</div>
  </div>
</section>`;
}

function renderTestimonialsHtml(c: TestimonialsContent): string {
  const items = (c.items ?? []).map(i => `
    <div class="card">
      <div style="color:#fbbf24;font-size:1.125rem;margin-bottom:12px">${'★'.repeat(i.rating ?? 5)}</div>
      <p style="font-style:italic;color:#374151;margin-bottom:16px">"${escHtml(i.quote)}"</p>
      <div style="border-top:1px solid #e5e7eb;padding-top:14px">
        <strong>${escHtml(i.name)}</strong>
        <p style="font-size:.875rem;color:#6b7280;margin-top:2px">${escHtml(i.role)}${i.company ? `, ${escHtml(i.company)}` : ''}</p>
      </div>
    </div>`).join('');
  return `<section>
  <div class="container text-center">
    <h2>${escHtml(c.headline)}</h2>
    ${c.subheadline ? `<p class="subtext">${escHtml(c.subheadline)}</p>` : ''}
    <div class="grid-3">${items}</div>
  </div>
</section>`;
}

function renderPricingHtml(c: PricingContent, _primary: string): string {
  const plans = (c.plans ?? []).map(p => `
    <div class="card" style="${p.highlighted ? 'border-color:var(--primary);border-width:2px;position:relative' : ''}">
      ${p.badge ? `<span class="badge" style="position:absolute;top:-14px;left:50%;transform:translateX(-50%)">${escHtml(p.badge)}</span>` : ''}
      <h3 style="font-size:1.25rem">${escHtml(p.name)}</h3>
      <div style="margin:16px 0"><span style="font-size:2.5rem;font-weight:800">${escHtml(p.price)}</span><span style="color:#6b7280">${escHtml(p.period)}</span></div>
      <p style="margin-bottom:20px">${escHtml(p.description)}</p>
      <ul style="list-style:none;margin-bottom:24px">
        ${(p.features ?? []).map(f => `<li style="padding:6px 0;display:flex;gap:8px"><span style="color:var(--primary)">✓</span>${escHtml(f)}</li>`).join('')}
      </ul>
      <a href="#" class="btn ${p.highlighted ? 'btn-primary' : 'btn-outline'}" style="width:100%;justify-content:center">${escHtml(p.cta)}</a>
    </div>`).join('');
  return `<section style="background:#fafafa">
  <div class="container text-center">
    <h2>${escHtml(c.headline)}</h2>
    ${c.subheadline ? `<p class="subtext">${escHtml(c.subheadline)}</p>` : ''}
    <div class="grid-${(c.plans ?? []).length <= 2 ? '2' : '3'}" style="align-items:center">${plans}</div>
  </div>
</section>`;
}

function renderFAQHtml(c: FAQContent): string {
  const items = (c.items ?? []).map(i => `
    <details style="border:1px solid #e5e7eb;border-radius:10px;padding:18px 22px;cursor:pointer">
      <summary style="font-weight:600;font-size:1.0625rem;list-style:none;display:flex;justify-content:space-between;align-items:center">
        ${escHtml(i.question)} <span style="color:var(--primary)">+</span>
      </summary>
      <p style="margin-top:12px;color:#4b5563">${escHtml(i.answer)}</p>
    </details>`).join('');
  return `<section>
  <div class="container" style="max-width:760px">
    <h2 class="text-center">${escHtml(c.headline)}</h2>
    ${c.subheadline ? `<p class="subtext text-center">${escHtml(c.subheadline)}</p>` : ''}
    <div style="margin-top:40px;display:flex;flex-direction:column;gap:12px">${items}</div>
  </div>
</section>`;
}

function renderGuaranteeHtml(c: GuaranteeContent, _primary: string): string {
  return `<section style="background:linear-gradient(135deg,#f0f4ff,#faf0ff)">
  <div class="container text-center" style="max-width:660px">
    ${c.period ? `<div style="font-size:3.5rem;margin-bottom:8px">🛡️</div>` : ''}
    ${c.badge ? `<span class="badge">${escHtml(c.badge)}</span>` : ''}
    <h2>${escHtml(c.headline)}</h2>
    <p class="subtext">${escHtml(c.description)}</p>
    ${c.period ? `<p style="margin-top:16px;font-weight:700;color:var(--primary)">${escHtml(c.period)} money-back guarantee</p>` : ''}
  </div>
</section>`;
}

function renderAboutHtml(c: AboutContent): string {
  const stats = (c.stats ?? []).map(s => `
    <div class="text-center">
      <div style="font-size:2rem;font-weight:800;color:var(--primary)">${escHtml(s.value)}</div>
      <div style="color:#6b7280;font-size:.9375rem;margin-top:4px">${escHtml(s.label)}</div>
    </div>`).join('');
  return `<section style="background:#fafafa">
  <div class="container" style="max-width:760px;text-align:center">
    <h2>${escHtml(c.headline)}</h2>
    <p class="subtext">${escHtml(c.description)}</p>
    ${stats ? `<div style="display:flex;gap:40px;justify-content:center;flex-wrap:wrap;margin-top:40px">${stats}</div>` : ''}
  </div>
</section>`;
}

function renderCTAHtml(c: CTAContent, _primary: string): string {
  return `<section style="background:var(--primary);color:#fff">
  <div class="container text-center" style="max-width:760px">
    <h2 style="color:#fff">${escHtml(c.headline)}</h2>
    ${c.subheadline ? `<p style="color:rgba(255,255,255,.8);font-size:1.125rem;margin-top:12px">${escHtml(c.subheadline)}</p>` : ''}
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:36px">
      <a href="${escHtml(c.primaryCta.href)}" class="btn btn-white">${escHtml(c.primaryCta.text)}</a>
      ${c.secondaryCta ? `<a href="${escHtml(c.secondaryCta.href)}" class="btn" style="color:#fff;border:2px solid rgba(255,255,255,.5)">${escHtml(c.secondaryCta.text)}</a>` : ''}
    </div>
  </div>
</section>`;
}

function renderFooterHtml(c: FooterContent): string {
  const links = (c.links ?? []).map(l => `<a href="${escHtml(l.href)}" style="color:#6b7280;text-decoration:none;font-size:.875rem">${escHtml(l.label)}</a>`).join('  ·  ');
  return `<footer style="background:#111827;color:#9ca3af;padding:40px 0">
  <div class="container text-center">
    <div style="font-weight:700;color:#fff;font-size:1.125rem;margin-bottom:8px">${escHtml(c.companyName)}</div>
    ${c.tagline ? `<p style="font-size:.9375rem;margin-bottom:16px">${escHtml(c.tagline)}</p>` : ''}
    ${links ? `<div style="margin-bottom:16px">${links}</div>` : ''}
    <p style="font-size:.8125rem">${escHtml(c.copyright)}</p>
  </div>
</footer>`;
}

// ── Markdown Export ────────────────────────────────────────────────────────────

export function exportAsMarkdown({ page, sections }: ExportInput): string {
  const visibleSections = sections.filter(s => s.is_visible).sort((a, b) => a.position - b.position);
  const lines: string[] = [`# ${page.seo.title}`, '', `> ${page.seo.description}`, ''];

  for (const section of visibleSections) {
    lines.push(...renderSectionMarkdown(section));
  }

  return lines.join('\n');
}

function renderSectionMarkdown(section: LandingPageSection): string[] {
  const c = section.content;
  const lines: string[] = [];

  switch (section.section_type) {
    case 'hero': {
      const h = c as unknown as HeroContent;
      lines.push(`## ${h.headline}`, '', h.subheadline, '', `**[${h.primaryCta.text}](${h.primaryCta.href})**${h.secondaryCta ? `  [${h.secondaryCta.text}](${h.secondaryCta.href})` : ''}`, '');
      break;
    }
    case 'benefits':
    case 'features':
    case 'how_it_works':
    case 'pain_points': {
      const h = c as { headline?: string; subheadline?: string; items?: { title?: string; description?: string }[]; steps?: { title?: string; description?: string }[] };
      lines.push(`## ${h.headline ?? ''}`, '');
      if (h.subheadline) lines.push(h.subheadline, '');
      const items = h.items ?? h.steps ?? [];
      for (const i of items) {
        lines.push(`### ${i.title ?? ''}`, i.description ?? '', '');
      }
      break;
    }
    case 'testimonials': {
      const t = c as unknown as TestimonialsContent;
      lines.push(`## ${t.headline}`, '');
      for (const i of t.items ?? []) {
        lines.push(`> "${i.quote}"`, `> — ${i.name}, ${i.role}${i.company ? `, ${i.company}` : ''}`, '');
      }
      break;
    }
    case 'pricing': {
      const p = c as unknown as PricingContent;
      lines.push(`## ${p.headline}`, '');
      for (const plan of p.plans ?? []) {
        lines.push(`### ${plan.name} — ${plan.price}${plan.period}`, plan.description, '');
        for (const f of plan.features ?? []) lines.push(`- ${f}`);
        lines.push('');
      }
      break;
    }
    case 'faq': {
      const f = c as unknown as FAQContent;
      lines.push(`## ${f.headline}`, '');
      for (const i of f.items ?? []) {
        lines.push(`**${i.question}**`, '', i.answer, '');
      }
      break;
    }
    default: {
      const generic = c as { headline?: string; description?: string };
      if (generic.headline) lines.push(`## ${generic.headline}`, '');
      if (generic.description) lines.push(generic.description, '');
      break;
    }
  }

  lines.push('---', '');
  return lines;
}

// ── React TSX Export ──────────────────────────────────────────────────────────

export function exportAsReact({ page, sections }: ExportInput): string {
  const visibleSections = sections.filter(s => s.is_visible).sort((a, b) => a.position - b.position);
  const primary = page.settings.primaryColor || '#6366f1';
  const secondary = page.settings.secondaryColor || '#8b5cf6';

  const sectionsCode = visibleSections.map(s => {
    const json = JSON.stringify(s.content, null, 4).split('\n').map((l, i) => i === 0 ? l : `  ${l}`).join('\n');
    return `  // ${s.section_type}\n  <Section type="${s.section_type}" content={${json}} primary="${primary}" secondary="${secondary}" />`;
  }).join('\n\n');

  return `// Generated by FrogeFlow AI
// ${page.seo.title}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${page.seo.title.replace(/'/g, "\\'")}',
  description: '${page.seo.description.replace(/'/g, "\\'")}',
};

const PRIMARY = '${primary}';
const SECONDARY = '${secondary}';

function Section({ type, content, primary, secondary }: { type: string; content: Record<string, unknown>; primary: string; secondary: string }) {
  // Implement each section type's rendering here
  return <section data-section={type} style={{ '--primary': primary, '--secondary': secondary } as React.CSSProperties} />;
}

export default function LandingPage() {
  return (
    <main style={{ '--primary': PRIMARY, '--secondary': SECONDARY } as React.CSSProperties}>
${sectionsCode}
    </main>
  );
}
`;
}

// ── Next.js Page Export ───────────────────────────────────────────────────────

export function exportAsNextjs({ page, sections }: ExportInput): string {
  return `// Generated by FrogeFlow AI
// Deploy this file as app/page.tsx in your Next.js project

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${page.seo.title.replace(/'/g, "\\'")}',
  description: '${page.seo.description.replace(/'/g, "\\'")}',
  openGraph: {
    title: '${page.seo.og_title.replace(/'/g, "\\'")}',
    description: '${page.seo.og_description.replace(/'/g, "\\'")}',
  },
  twitter: {
    card: 'summary_large_image',
    title: '${page.seo.twitter_title.replace(/'/g, "\\'")}',
    description: '${page.seo.twitter_description.replace(/'/g, "\\'")}',
  },
};

// Copy the sections data below into your own components
const PAGE_SECTIONS = ${JSON.stringify(sections.filter(s => s.is_visible).map(s => ({ type: s.section_type, content: s.content })), null, 2)};

export default function Page() {
  return (
    <main>
      {/* Implement your section components here using the PAGE_SECTIONS data above */}
      {PAGE_SECTIONS.map((section) => (
        <section key={section.type} data-section={section.type}>
          <pre>{JSON.stringify(section.content, null, 2)}</pre>
        </section>
      ))}
    </main>
  );
}
`;
}
