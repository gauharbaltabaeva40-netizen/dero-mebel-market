import { useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { Filter } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useLang, styleTag } from "@/contexts/LanguageContext";
import { fmtPrice } from "@/lib/format";
import { type DimensionRange, fromMillimeters, isAvailableForOrder, isWithinDimensionRange, isWithinPriceLimit, toMillimeters } from "@/lib/catalogFilters";
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
  // Null means no ceiling: the first catalog view must include every published product.
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [widthRange, setWidthRange] = useState<DimensionRange>(null);
  const [heightRange, setHeightRange] = useState<DimensionRange>(null);
  const [depthRange, setDepthRange] = useState<DimensionRange>(null);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [dimensionUnit, setDimensionUnit] = useState<"mm" | "cm">("mm");

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

  const styles = useMemo(() => {
    if (!products) return [];
    return Array.from(new Set(products.map((product) => product.style).filter(Boolean))).sort();
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      if (category && p.category !== category) return false;
      if (style !== "all" && p.style !== style) return false;
      if (material !== "all" && p.material !== material) return false;
      if (availableOnly && !isAvailableForOrder(p.availability)) return false;
      if (!isWithinPriceLimit(p.basePriceKzt, maxPrice)) return false;
      if (!isWithinDimensionRange(p.widthMm, widthRange)) return false;
      if (!isWithinDimensionRange(p.heightMm, heightRange)) return false;
      if (!isWithinDimensionRange(p.depthMm, depthRange)) return false;
      return true;
    });
  }, [products, category, style, material, availableOnly, maxPrice, widthRange, heightRange, depthRange]);

  const maxCatalogPrice = useMemo(() => {
    if (!products) return 300000;
    return Math.max(...products.map((p) => p.basePriceKzt));
  }, [products]);

  const dimensionMaximums = useMemo(() => {
    const maximum = (field: "widthMm" | "heightMm" | "depthMm") => Math.max(100, ...((products ?? []).map((product) => product[field] ?? 0)));
    return { width: maximum("widthMm"), height: maximum("heightMm"), depth: maximum("depthMm") };
  }, [products]);
  const dimensions = [
    { key: "width", label: t.catalog.width, maximum: dimensionMaximums.width, range: widthRange, setRange: setWidthRange },
    { key: "height", label: t.catalog.height, maximum: dimensionMaximums.height, range: heightRange, setRange: setHeightRange },
    { key: "depth", label: t.catalog.depth, maximum: dimensionMaximums.depth, range: depthRange, setRange: setDepthRange },
  ];
  const dimensionScale = dimensionUnit === "cm" ? 10 : 1;
  const clearDimensions = () => {
    setWidthRange(null);
    setHeightRange(null);
    setDepthRange(null);
  };

  return (
    <div className="container py-12 md:py-16">
      <p className="swiss-label mb-4">{t.home.catsLabel}</p>
      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3">{t.catalog.title}</h1>
      <p className="text-muted-foreground mb-10">{t.catalog.subtitle}</p>

      <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 lg:items-start">
        {/* ── FILTER SIDEBAR ─────────────────────────── */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24">
          <div className="border border-foreground flex flex-col max-h-[min(46svh,34rem)] lg:h-[min(32rem,calc(100svh-7rem))]">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-foreground">
              <Filter className="w-4 h-4" />
              <span className="font-bold text-sm uppercase tracking-widest">{t.catalog.filters}</span>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto overscroll-contain">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3 text-muted-foreground">
                  {t.catalog.roomType}
                </p>
                  <div className="flex flex-col gap-1 max-h-44 overflow-y-auto overscroll-contain">
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
                  <div className="flex flex-col gap-1 max-h-44 overflow-y-auto overscroll-contain">
                    <button
                      onClick={() => setStyle("all")}
                    className={`text-left px-3 py-2 text-sm font-semibold transition-colors ${
                      style === "all" ? "bg-foreground text-background" : "hover:bg-muted"
                    }`}
                  >
                    {t.catalog.all}
                  </button>
                  {styles.map((s) => (
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
                  <div className="flex flex-col gap-1 max-h-44 overflow-y-auto overscroll-contain">
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
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">{t.catalog.availability}</p>
                <button
                  type="button"
                  aria-pressed={availableOnly}
                  onClick={() => setAvailableOnly((current) => !current)}
                  className={`w-full border px-3 py-2 text-left text-sm font-semibold transition-colors ${availableOnly ? "border-foreground bg-foreground text-background" : "border-foreground/45 hover:bg-muted"}`}
                >
                  {t.catalog.availableOnly}
                </button>
                <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{t.catalog.madeToOrder}</p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3 text-muted-foreground">
                  {t.catalog.price}
                </p>
                <Slider
                  value={[maxPrice ?? Math.max(maxCatalogPrice, 300000)]}
                  min={100000}
                  max={Math.max(maxCatalogPrice, 300000)}
                  step={10000}
                  onValueChange={(v) => setMaxPrice(v[0])}
                />
                <p className="text-sm font-bold mt-3">
                  {fmtPrice(maxPrice ?? Math.max(maxCatalogPrice, 300000))}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t.catalog.dimensions}</p>
                    <button type="button" onClick={() => setDimensionUnit((unit) => unit === "mm" ? "cm" : "mm")} className="border border-foreground/35 px-1.5 py-0.5 text-[10px] font-black uppercase text-foreground transition-colors hover:bg-foreground hover:text-background">{dimensionUnit === "mm" ? t.catalog.unitCm : t.catalog.unitMm}</button>
                  </div>
                  {(widthRange || heightRange || depthRange) && (
                    <button onClick={clearDimensions} className="text-[10px] font-bold uppercase tracking-widest text-swiss-yellow-dark hover:underline">
                      {t.catalog.clearSize}
                    </button>
                  )}
                </div>
                <div className="space-y-5">
                  {dimensions.map((dimension) => {
                    const selectedMm = Array.from(dimension.range ?? [0, dimension.maximum]);
                    const maximum = fromMillimeters(dimension.maximum, dimensionUnit);
                    const selected = selectedMm.map((value) => fromMillimeters(value, dimensionUnit));
                    return (
                      <div key={dimension.key}>
                        <div className="mb-2 flex items-baseline justify-between gap-3">
                          <span className="text-xs font-bold">{dimension.label}</span>
                          <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">{selected[0]}–{selected[1]} {dimensionUnit === "mm" ? t.catalog.unitMm : t.catalog.unitCm}</span>
                        </div>
                        <Slider
                          value={selected}
                          min={0}
                          max={maximum}
                          step={dimensionUnit === "mm" ? 10 : 1}
                          minStepsBetweenThumbs={1}
                          onValueChange={(value) => {
                            const selectedRange: [number, number] = [toMillimeters(value[0], dimensionUnit), toMillimeters(value[1], dimensionUnit)];
                            dimension.setRange(value[0] === 0 && value[1] === maximum ? null : selectedRange);
                          }}
                          aria-label={dimension.label}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── PRODUCT GRID ───────────────────────────── */}
        <div className="lg:col-span-9 lg:h-[min(32rem,calc(100svh-7rem))] lg:overflow-y-auto lg:overscroll-contain lg:pr-3">
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
                {t.chat.title}
              </Button>
            </div>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                {filtered.length} {t.catalog.results}
              </p>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-px bg-foreground/40">
                {filtered.map((p) => (
                  <article key={p.id} className="group bg-background flex flex-col min-w-0">
                    <Link href={`/products/${p.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-swiss-yellow focus-visible:ring-inset">
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
                    </Link>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        {p.category === "kitchen" ? t.home.catKitchen : t.home.catWardrobe}
                      </p>
                      <p className={`mb-2 text-[10px] font-bold uppercase tracking-widest ${p.availability === "unavailable" ? "text-destructive" : "text-swiss-yellow-dark"}`}>
                        {p.availability === "in_stock" ? t.catalog.inStock : p.availability === "unavailable" ? t.catalog.unavailable : t.catalog.madeToOrder}
                      </p>
                      <Link href={`/products/${p.id}`} className="font-bold text-base leading-snug mb-3 flex-1 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-swiss-yellow">
                        {lang === "kk" ? p.nameKk : p.nameRu}
                      </Link>
                      <div className="flex items-end justify-between border-t border-foreground/30 pt-3">
                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground tracking-widest">
                            {t.catalog.startingFrom}
                          </p>
                          <p className="font-black text-lg">
                            {fmtPrice(p.basePriceKzt)}
                            {p.priceUnit !== "fixed" && (
                              <span className="text-xs font-medium text-muted-foreground ml-1">
                                {p.priceUnit === "per_meter" ? t.catalog.perMeter : t.catalog.perM2}
                              </span>
                            )}
                          </p>
                        </div>
                        {p.kaspiReviews || p.kaspiRating ? (
                          <div className="text-right leading-tight">
                            <p className="text-xs font-black text-foreground">
                              <span className="text-swiss-yellow">★</span> {p.kaspiRating ? p.kaspiRating.toFixed(1) : "—"}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-semibold">
                              {p.kaspiReviews ?? 0} {t.catalog.kaspiReviews}
                            </p>
                          </div>
                        ) : null}
                      </div>
                      <Link
                        href={`/products/${p.id}`}
                        className="mt-3 block border border-foreground px-3 py-2.5 text-center text-xs font-bold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-background active:scale-[0.97] touch-manipulation"
                      >
                        {lang === "kk" ? "Толығырақ" : "Подробнее"}
                      </Link>
                      {p.kaspiUrl && p.kaspiVerified && (
                        <a
                          href={p.kaspiUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 block bg-swiss-yellow px-3 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-swiss-yellow/85 active:scale-[0.97] touch-manipulation"
                        >
                          {t.catalog.buyKaspi}
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
