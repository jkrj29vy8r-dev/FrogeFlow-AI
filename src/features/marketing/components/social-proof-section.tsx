const STATS = [
  { value: "120,000+", label: "Documents generated" },
  { value: "50,000+", label: "Creators worldwide" },
  { value: "4.9 / 5", label: "Average rating" },
  { value: "< 2 min", label: "Time to first draft" },
];

export function SocialProofSection() {
  return (
    <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <p className="mb-10 text-center text-sm font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
          Trusted by creators around the world
        </p>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-[hsl(var(--foreground))] sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
