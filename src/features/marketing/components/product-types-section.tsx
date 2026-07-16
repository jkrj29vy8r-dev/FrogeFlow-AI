import { BookOpen, FileText, CheckSquare, Magnet, Globe, Mail } from "lucide-react";

const PRODUCT_TYPES = [
  { icon: BookOpen, label: "eBooks", color: "text-violet-500 bg-violet-500/10" },
  { icon: FileText, label: "PDF Guides", color: "text-blue-500 bg-blue-500/10" },
  { icon: CheckSquare, label: "Workbooks", color: "text-emerald-500 bg-emerald-500/10" },
  { icon: CheckSquare, label: "Checklists", color: "text-amber-500 bg-amber-500/10" },
  { icon: Magnet, label: "Lead Magnets", color: "text-rose-500 bg-rose-500/10" },
  { icon: Globe, label: "Landing Pages", color: "text-cyan-500 bg-cyan-500/10" },
  { icon: FileText, label: "Sales Pages", color: "text-indigo-500 bg-indigo-500/10" },
  { icon: Mail, label: "Email Campaigns", color: "text-orange-500 bg-orange-500/10" },
] as const;

export function ProductTypesSection() {
  return (
    <section
      id="products"
      className="border-y border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] px-6 py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
            One platform. Every digital product.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[hsl(var(--muted-foreground))]">
            From lead magnets to full eBooks — create any digital product your
            audience needs.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PRODUCT_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.label}
                className="flex flex-col items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-center transition-shadow hover:shadow-md"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${type.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {type.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
