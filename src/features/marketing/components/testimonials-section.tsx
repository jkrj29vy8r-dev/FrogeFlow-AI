const TESTIMONIALS = [
  {
    quote:
      "I launched my first eBook in 48 hours. BookForge AI wrote the whole outline and content — I just refined the tone. Already made back my subscription 10x.",
    author: "Sarah K.",
    role: "Health & wellness coach",
    avatar: "SK",
    color: "bg-violet-400",
  },
  {
    quote:
      "As a marketer I need landing pages and lead magnets constantly. This tool cut my content production time by 80%. Absolutely worth every penny.",
    author: "Tom R.",
    role: "Digital marketing consultant",
    avatar: "TR",
    color: "bg-blue-400",
  },
  {
    quote:
      "I was skeptical about AI writing tools but the quality here genuinely surprised me. The outlines are logical, the prose is clean, and editing is a breeze.",
    author: "Amara L.",
    role: "Self-published author",
    avatar: "AL",
    color: "bg-emerald-400",
  },
  {
    quote:
      "We use BookForge AI to spin up workbooks and checklists for our courses. Our students love the quality. We've saved dozens of hours every month.",
    author: "James P.",
    role: "Online course creator",
    avatar: "JP",
    color: "bg-amber-400",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-[hsl(var(--muted)/0.3)] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
            Loved by creators everywhere
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[hsl(var(--muted-foreground))]">
            See what people are building with BookForge AI.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className="flex flex-col rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {"★★★★★".split("").map((star, i) => (
                  <span key={i} className="text-sm text-amber-400">
                    {star}
                  </span>
                ))}
              </div>

              <p className="flex-1 text-sm leading-relaxed text-[hsl(var(--foreground))]">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-5 flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${t.color}`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{t.author}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
