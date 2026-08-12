import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { ArrowLeft, MessageCircle, ShoppingCart, Truck, Wrench, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLang, styleTag } from "@/contexts/LanguageContext";
import { fmtPrice, fmtDims } from "@/lib/format";
import { useOpenChat, useChat } from "@/components/AiChatWidget";

export default function Product() {
  const { t, lang } = useLang();
  const [, params] = useRoute("/products/:id");
  const id = Number(params?.id ?? 0);
  const openChat = useOpenChat();
  const { setContextProduct } = useChat();

  const { data: product, isLoading } = trpc.products.byId.useQuery(
    { id },
    { enabled: id > 0 },
  );

  // Let the AI assistant know which product the visitor is looking at
  useEffect(() => {
    if (product) {
      setContextProduct({ id: product.id, nameKk: product.nameKk, nameRu: product.nameRu });
    }
    return () => setContextProduct(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (isLoading) {
    return <div className="container py-24 animate-pulse h-96 bg-muted" />;
  }

  if (!product) {
    return (
      <div className="container py-24 text-center">
        <p className="font-bold mb-4">404 — product not found</p>
        <Button asChild variant="outline" className="rounded-none border-foreground">
          <Link href="/catalog">{t.product.back}</Link>
        </Button>
      </div>
    );
  }

  const name = lang === "kk" ? product.nameKk : product.nameRu;
  const desc = lang === "kk" ? product.descriptionKk : product.descriptionRu;

  // Bilingual product attributes — instant translation on language switch,
  // fallback to shared base fields if the localized value is missing.
  const material =
    (lang === "kk" ? product.materialKk : product.materialRu) ?? product.material;
  const facade =
    (lang === "kk" ? product.facadeKk : product.facadeRu) ?? product.facade ?? "";
  const colors =
    ((lang === "kk" ? product.colorsKk : product.colorsRu) as string[] | undefined | null) ??
    (product.colors as string[] | undefined | null) ??
    [];
  const features =
    ((lang === "kk" ? product.featuresKk : product.featuresRu) as string[] | undefined | null) ??
    (product.features as string[] | undefined | null) ??
    [];

  return (
    <div className="container py-10 md:py-14">
      <Button
        asChild
        variant="ghost"
        className="rounded-none mb-8 pl-0 gap-2 text-sm font-semibold uppercase tracking-wider"
      >
        <Link href="/catalog">
          <ArrowLeft className="w-4 h-4" />
          {t.product.back}
        </Link>
      </Button>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* ── GALLERY ─────────────────────────────────── */}
        <div className="lg:col-span-7">
          <div className="border border-foreground">
            <img src={product.photoUrl} alt={name} className="w-full aspect-[4/3] object-cover" />
            <div className="flex items-center justify-between px-3 py-2 border-t border-foreground">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {product.category === "kitchen" ? t.home.catKitchen : t.home.catWardrobe} · {styleTag(product.style, t)}
              </span>
              <span className="swiss-square w-3 h-3" />
            </div>
          </div>
          {desc && (
            <div className="mt-8 border-l-4 border-swiss-yellow pl-5">
              <p className="text-base text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          )}
        </div>

        {/* ── DETAILS ─────────────────────────────────── */}
        <div className="lg:col-span-5">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-4">{name}</h1>

          <div className="flex items-end gap-3 border-y border-foreground py-5 mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                {t.catalog.startingFrom}
              </p>
              <p className="text-3xl font-black">
                {fmtPrice(product.basePriceKzt)}
                {product.priceUnit !== "fixed" && (
                  <span className="text-sm font-medium text-muted-foreground ml-1">
                    {product.priceUnit === "per_meter" ? t.catalog.perMeter : t.catalog.perM2}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* ── KASPI REVIEWS BLOCK ─────────────────── */}
          {product.kaspiUrl && (
            <a
              href={product.kaspiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 border border-foreground block"
            >
              <div className="px-4 py-3 border-b border-foreground flex items-center gap-3">
                <span className="flex items-center gap-1 text-lg font-black">
                  {"★★★★★".slice(0, 5)}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest">
                  {t.catalog.kaspiRating}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {product.kaspiReviews ?? 0} {t.catalog.kaspiReviews} →
                </span>
              </div>
              <p className="px-4 py-3 text-xs text-muted-foreground leading-relaxed">
                {t.catalog.kaspiMerchantNote}
              </p>
            </a>
          )}

          <div className="divide-y divide-foreground/30 border border-foreground">
            <DetailRow label={t.product.materials} value={`${material}${facade ? ` · ${facade}` : ""}`} />
            <DetailRow label={t.product.dimensions} value={fmtDims(product.widthMm, product.heightMm, product.depthMm)} />
            <DetailRow label={t.product.colors} value={colors.join(", ") || "—"} />
            {product.leadTimeDays && (
              <DetailRow label={t.product.leadTime} value={`${product.leadTimeDays} ${t.product.days}`} icon={<Clock className="w-4 h-4" />} />
            )}
            <DetailRow label={t.product.features} value={null} isList features={features} />
          </div>

          <div className="mt-6 border border-foreground bg-muted/50 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              {t.product.estimatedPrice}
            </p>
            <p className="text-2xl font-black">
              {fmtPrice(product.basePriceKzt)}
              {product.priceUnit !== "fixed" && (
                <span className="text-sm font-medium text-muted-foreground ml-1">
                  {product.priceUnit === "per_meter" ? t.catalog.perMeter : t.catalog.perM2}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{t.product.estimatedNote}</p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-px bg-foreground/40 border border-foreground/40 text-center">
            {[
              { icon: <Truck className="w-4 h-4" />, label: t.product.delivery, val: lang === "kk" ? "Астана" : "Астана" },
              { icon: <Wrench className="w-4 h-4" />, label: t.product.installation, val: "✓" },
              { icon: <ShieldCheck className="w-4 h-4" />, label: t.product.warranty, val: "12" },
            ].map((x) => (
              <div key={x.label} className="bg-background py-4">
                <div className="flex justify-center mb-2">{x.icon}</div>
                <p className="text-[10px] font-bold uppercase tracking-widest">{x.label}</p>
                <p className="text-sm font-bold mt-0.5">{x.val}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {product.kaspiUrl ? (
              <a
                href={product.kaspiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-swiss-yellow hover:bg-swiss-yellow/90 text-black h-12 flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-sm transition-colors active:scale-[0.97] transition-transform"
              >
                <ShoppingCart className="w-4 h-4" />
                {t.catalog.buyKaspi}
              </a>
            ) : null}
            {product.kaspiUrl && (
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                {t.catalog.buyKaspiNote}
              </p>
            )}
            {!product.kaspiUrl && (
              <Button
                size="lg"
                onClick={() =>
                  openChat({
                    initialMessage:
                      lang === "kk"
                        ? `Мен "${name}" жобасын тапсырыс бергім келеді. Бағасын есептеп беріңіз.`
                        : `Хочу заказать проект "${name}". Рассчитайте примерную цену.`,
                  })
                }
                className="rounded-none h-12 bg-swiss-yellow hover:bg-swiss-yellow/90 text-black font-bold uppercase tracking-wider text-sm active:scale-[0.97] transition-transform"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {lang === "kk" ? "Тапсырыс беру" : "Заказать проект"}
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                openChat({
                  initialMessage:
                    lang === "kk"
                      ? `Мен "${name}" туралы сұрағым келеді. Бағасын есептеп беріңіз.`
                      : `Я хочу узнать про "${name}". Рассчитайте примерную цену.`,
                })
              }
              className="rounded-none h-12 font-bold uppercase tracking-wider text-sm border-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t.product.orderAi}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon,
  isList,
  features,
}: {
  label: string;
  value: string | null;
  icon?: React.ReactNode;
  isList?: boolean;
  features?: string[] | null;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      {icon && <span className="mt-0.5 text-swiss-yellow">{icon}</span>}
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground w-28 shrink-0 pt-0.5">
        {label}
      </span>
      {isList ? (
        <ul className="space-y-1">
          {features?.map((f) => (
            <li key={f} className="text-sm flex gap-2">
              <span className="swiss-square w-1.5 h-1.5 mt-1.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-sm font-medium">{value}</span>
      )}
    </div>
  );
}
