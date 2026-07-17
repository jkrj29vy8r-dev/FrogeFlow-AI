"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Image, ArrowRight } from "lucide-react";
import { createCover } from "@/features/covers/actions/covers.actions";
import { DEFAULT_VARIATION } from "@/features/covers/lib/layouts";
import { applyLayout } from "@/features/covers/lib/layouts";
import type { ProductType } from "@/types/covers";

const PRODUCT_TYPES: Array<{ id: ProductType; label: string; desc: string }> = [
  { id: "ebook", label: "eBook", desc: "Digital book or guide" },
  { id: "guide", label: "PDF Guide", desc: "Step-by-step guide" },
  { id: "workbook", label: "Workbook", desc: "Interactive exercises" },
  { id: "checklist", label: "Checklist", desc: "Action checklist" },
  { id: "lead_magnet", label: "Lead Magnet", desc: "Free resource" },
];

export default function NewCoverPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [productType, setProductType] = useState<ProductType>("ebook");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter a cover name."); return; }
    setCreating(true);
    setError("");

    const content = applyLayout({
      title: name.trim(),
      subtitle: "",
      author: "",
      brand: "",
      variation: DEFAULT_VARIATION,
    });

    const { cover, error: err } = await createCover({
      name: name.trim(),
      productType,
      content,
    });

    if (err || !cover) {
      setError(err ?? "Failed to create cover");
      setCreating(false);
      return;
    }

    router.push(`/covers/${cover.id}/editor`);
  }

  return (
    <div className="mx-auto max-w-lg py-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.1)]">
          <Image className="h-7 w-7 text-[hsl(var(--primary))]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">New Cover Design</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Start with a template and customize with AI
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            Cover Name / Product Title
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. The Ultimate Marketing Blueprint"
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">Product Type</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PRODUCT_TYPES.map(pt => (
              <button
                key={pt.id}
                type="button"
                onClick={() => setProductType(pt.id)}
                className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-all ${
                  productType === pt.id
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                    : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]"
                }`}
              >
                <span className={`text-sm font-semibold ${productType === pt.id ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--foreground))]"}`}>
                  {pt.label}
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{pt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {creating ? "Creating..." : "Create & Open Editor"}
          {!creating && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
