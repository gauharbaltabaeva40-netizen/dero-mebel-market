import { useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { Filter } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useLang, styleTag } from "@/contexts/LanguageContext";
import { fmtPrice } from "@/lib/format";
import { useOpenChat } from "@/components/AiChatWidget";

export default function Catalog() {
  const { t, lang } = useLang();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const openChat = useOpenChat();

  const [category, setCategory] = useState<"kitchen" | "wardrobe" | null>(
    (params.get("category") as "kitchen" | "wardrobe") ?? null,
  );
  const [style, setStyle] = useState<string>("all");
  const [material, setMaterial] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(500000);

  const { data: products, isLoading } = trpc.products.list.useQuery();

  const materials = useMemo(() => {
    if (!products) return [];
    // Translated material list with both-language view of the same products.
    return Array.from(
      new Map(
        products.map((p) => {
          const label = (lang === "kk" ? p.materialKk : p.materialRu) ?? p.material;
          return [p.material, label] as const;
        }),
      ),
    )
      .sort(([, a], [, b]) => a.localeCompare(b));
  }, [products, lang]);

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      if (category && p.category !== category) return false;
      if (style !== "all" && p.style !== style) return false;
      if (material !== "all" && p.material !== material) return false;
      if (p.basePriceKzt > maxPrice) return false;
      return true;
    });
  }, [products, category, style, material, maxPrice]);

  const maxCatalogPrice = useMemo(() => {
    if (!products) return 300000;
    return Math.max(...products.map((p) => p.basePriceKzt));
  }, [products]);

  return (
    <div className="container py-12 md:py-16">
      <p className="swiss-label mb-4">{t.home.catsLabel}</p>
      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3">{t.catalog.title}</h1>
      <p className="text-muted-foreground mb-10">{t.catalog.subtitle}</p>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* ── FILTER SIDEBAR ─────────────────────────── */}
        <aside className="lg:col-span-3">
          <div className="border border-foreground sticky top-24">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-foreground">
              <Filter className="w-4 h-4" />
              <span className="font-bold text-sm uppercase tracking-widest">{t.catalog.filters}</span>
            </div>

            <div className="p-4 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3 text-muted-foreground">
                  {t.catalog.category}
                </p>
                <div className="flex flex-col gap-1">
                  {[
                    { value: null as string | null, label: t.catalog.all },
                    { value: "kitchen", label: t.home.catKitchen },
                    { value: "wardrobe", label: t.home.catWardrobe },
                  ].map((opt) => (
                    <button
                      key={opt.value ?? "all"}
                      onClick={() => setCategory(opt.value as "kitchen" | "wardrobe" | null)}
                      className={`text-left px-3 py-2 text-sm font-semibold transition-colors ${
                        category === opt.value
                          ? "bg-foreground text-background"
                          : "hover:bg-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3 text-muted-foreground">
                  {t.catalog.style}
                </p>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setStyle("all")}
                    className={`text-left px-3 py-2 text-sm font-semibold transition-colors ${
                      style === "all" ? "bg-foreground text-background" : "hover:bg-muted"
                    }`}
                  >
                    {t.catalog.all}
                  </button>
                  {(Object.keys(t.catalog.styleTags) as string[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`text-left px-3 py-2 text-sm font-semibold transition-colors ${
                        style === s ? "bg-foreground text-background" : "hover:bg-muted"
                      }`}
                    >
                      {styleTag(s, t)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3 text-muted-foreground">
                  {t.catalog.material}
                </p>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setMaterial("all")}
                    className={`text-left px-3 py-2 text-sm font-semibold transition-colors ${
                      material === "all" ? "bg-foreground text-background" : "hover:bg-muted"
                    }`}
                  >
                    {t.catalog.all}
                  </button>
                  {materials.map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setMaterial(value)}
                      className={`text-left px-3 py-2 text-sm font-semibold transition-colors ${
                        material === value ? "bg-foreground text-background" : "hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3 text-muted-foreground">
                  {t.catalog.price}
                </p>
                <Slider
                  value={[maxPrice]}
                  min={100000}
                  max={Math.max(maxCatalogPrice, 300000)}
                  step={10000}
                  onValueChange={(v) => setMaxPrice(v[0])}
                />
                <p className="text-sm font-bold mt-3">{fmtPrice(maxPrice)}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── PRODUCT GRID ───────────────────────────── */}
        <div className="lg:col-span-9">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-px bg-foreground/40">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-background aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-foreground p-12 text-center">
              <p className="font-bold mb-2">{t.catalog.noResults.split(".")[0]}.</p>
              <p className="text-sm text-muted-foreground mb-6">{t.catalog.noResults.split(".")[1]}</p>
              <Button
                onClick={() => openChat({})}
                className="bg-swiss-yellow hover:bg-swiss-yellow/90 text-black rounded-none"
              >
                AI
              </Button>
            </div>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                {filtered.length} {t.catalog.results}
              </p>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-px bg-foreground/40">
                {filtered.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="group bg-background flex flex-col"
                  >
                    <div className="aspect-[4/3] overflow-hidden border-b border-foreground relative">
                      <img
                        src={p.photoUrl}
                        alt={lang === "kk" ? p.nameKk : p.nameRu}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-background border border-foreground px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                        {styleTag(p.style, t)}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        {p.category === "kitchen" ? t.home.catKitchen : t.home.catWardrobe}
                      </p>
                      <h3 className="font-bold text-base leading-snug mb-3 flex-1">
                        {lang === "kk" ? p.nameKk : p.nameRu}
                      </h3>
                      <div className="flex items-end justify-between border-t border-foreground/30 pt-3">
                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground tracking-widest">
                            {t.catalog.startingFrom}
                          </p>
                          <p className="font-black text-lg">
                            {fmtPrice(p.basePriceKzt)}
                            <span className="text-xs font-medium text-muted-foreground ml-1">
                              {p.priceUnit === "per_meter" ? t.catalog.perMeter : t.catalog.perM2}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
