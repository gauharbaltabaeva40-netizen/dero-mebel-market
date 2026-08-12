import { Link } from "wouter";
import { ArrowRight, MessageCircle, Ruler, Factory, Layers, ShieldCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LanguageContext";
import { useOpenChat } from "@/components/AiChatWidget";

export default function Home() {
  const { t, lang } = useLang();
  const openChat = useOpenChat();

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="border-b border-foreground">
        <div className="container py-20 md:py-28 flex flex-col items-center text-center max-w-4xl mx-auto">
          <p className="swiss-label mb-6">{t.home.heroLabel}</p>
          <h1 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight mb-8">
            {t.home.heroTitle}
            <br />
            <span className="text-swiss-yellow">{t.home.heroTitleAccent}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-10">{t.home.heroSub}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-swiss-yellow hover:bg-swiss-yellow/90 text-black rounded-none px-8 h-12 text-sm font-bold uppercase tracking-wider active:scale-[0.97] transition-transform"
              onClick={() => openChat({ initialMessage: undefined })}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t.home.heroCta1}
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-none px-8 h-12 text-sm font-bold uppercase tracking-wider border-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              <Link href="/catalog">
                {t.home.heroCta2}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* stats strip */}
        <div className="container grid md:grid-cols-3 border-t border-foreground">
          {t.home.stats.map(([title, desc], i) => (
            <div
              key={title}
              className={`py-6 px-2 flex items-baseline gap-4 ${i > 0 ? "md:border-l border-foreground/40" : ""}`}
            >
              <span className="swiss-square w-4 h-4 shrink-0" />
              <div>
                <p className="font-bold text-sm uppercase tracking-wider">{title}</p>
                <p className="text-xs text-muted-foreground mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTRO ────────────────────────────────────── */}
      <section className="container py-20 flex flex-col items-center text-center max-w-4xl mx-auto">
        <p className="swiss-label mb-6">{t.home.introLabel}</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">{t.home.introTitle}</h2>
        <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">{t.home.introText}</p>
      </section>

      {/* ── CATEGORIES ───────────────────────────────── */}
      <section className="border-y border-foreground bg-muted/40">
        <div className="container py-20 flex flex-col items-center">
          <div className="text-center mb-10">
            <p className="swiss-label mb-4 justify-center">{t.home.catsLabel}</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">{t.home.catsTitle}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-foreground">
            <Link href="/catalog?category=kitchen" className="group bg-background p-8 md:p-12 transition-colors hover:bg-accent/50">
              <div className="aspect-[16/10] overflow-hidden mb-8 border border-foreground/20">
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80"
                  alt={t.home.catKitchen}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{t.home.catKitchen}</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm">{t.home.catKitchenDesc}</p>
                </div>
                <ChevronRight className="w-6 h-6 text-swiss-yellow group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/catalog?category=wardrobe" className="group bg-background p-8 md:p-12 transition-colors hover:bg-accent/50">
              <div className="aspect-[16/10] overflow-hidden mb-8 border border-foreground/20">
                <img
                  src="https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80"
                  alt={t.home.catWardrobe}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{t.home.catWardrobe}</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm">{t.home.catWardrobeDesc}</p>
                </div>
                <ChevronRight className="w-6 h-6 text-swiss-yellow group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── ADVANTAGES ───────────────────────────────── */}
      <section className="container py-20 flex flex-col items-center">
        <p className="swiss-label mb-4 justify-center">{t.home.advLabel}</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-12 text-center">{t.home.advTitle}</h2>
        <div className="grid md:grid-cols-2 gap-px bg-foreground/40">
          {[t.home.adv1, t.home.adv2, t.home.adv3, t.home.adv4].map(([title, desc], i) => {
            const icons = [Factory, Ruler, Layers, ShieldCheck];
            const Icon = icons[i];
            return (
              <div key={title} className="bg-background p-8 flex gap-5 items-start">
                <div className="swiss-square w-10 h-10 shrink-0 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW TO ORDER ─────────────────────────────── */}
      <section className="border-y border-foreground bg-foreground text-background">
        <div className="container py-20">
          <p className="swiss-label mb-4 justify-center" style={{ color: "var(--swiss-yellow-dark)" }}>
            {t.home.stepsLabel}
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-14 text-center">{t.home.stepsTitle}</h2>
          <div className="grid md:grid-cols-4 gap-10">
            {[t.home.step1, t.home.step2, t.home.step3, t.home.step4].map(([title, desc], i) => (
              <div key={title} className="relative">
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-6xl font-black text-swiss-yellow">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-background/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ PREVIEW + AI BANNER ──────────────────── */}
      <section className="container py-20 grid md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-7">
          <p className="swiss-label mb-4">{t.home.faqPreviewLabel}</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-8">{t.home.faqPreviewTitle}</h2>
          <div className="border border-foreground divide-y divide-foreground/30">
            {(lang === "kk"
              ? [
                  ["Тапсырыс бойынша жасайсыздар ма?", "/faq"],
                  ["Баға қалай есептеледі?", "/faq"],
                  ["Жеткізу қанша тұрады?", "/faq"],
                  ["Кепілдік бар ма?", "/faq"],
                ]
              : [
                  ["Делаете на заказ?", "/faq"],
                  ["Как считается цена?", "/faq"],
                  ["Сколько стоит доставка?", "/faq"],
                  ["Есть ли гарантия?", "/faq"],
                ]
            ).map(([q, href]) => (
              <Link
                key={q}
                href={href}
                className="flex items-center justify-between py-4 px-2 hover:bg-muted transition-colors group"
              >
                <span className="font-medium">{q}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-swiss-yellow group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
          <Button
            asChild
            variant="outline"
            className="mt-6 rounded-none border-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            <Link href="/faq">
              {t.home.faqSeeAll}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="md:col-span-5">
          <div className="border border-foreground p-8 h-full flex flex-col justify-between">
            <div className="swiss-square w-8 h-8 mb-6 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary-foreground" />
            </div>
            <p className="text-lg font-medium leading-relaxed mb-8">{t.home.aiBanner}</p>
            <Button
              onClick={() => openChat({})}
              className="bg-swiss-yellow hover:bg-swiss-yellow/90 text-black rounded-none w-full h-11 font-bold uppercase tracking-wider text-sm active:scale-[0.97] transition-transform"
            >
              {t.home.aiOpen}
            </Button>
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────── */}
      <section id="contact" className="border-t border-foreground bg-muted/40">
        <div className="container py-20 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <p className="swiss-label mb-4">{t.home.contactLabel}</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">{t.home.contactTitle}</h2>
            <div className="space-y-3 text-muted-foreground">
              <a href="tel:+77010822764" className="block text-lg font-semibold text-foreground hover:underline">
                +7 701 082 27 64
              </a>
              <a href="https://wa.me/77010822764" target="_blank" rel="noreferrer" className="block hover:underline" style={{ color: "var(--swiss-yellow-dark)" }}>
                WhatsApp: +7 701 082 27 64
              </a>
              <p>Астана, Керей хан 27</p>
              <p>10:00–20:00</p>
              <a href="https://www.instagram.com/deromebel_market/" target="_blank" rel="noreferrer" className="block hover:underline" style={{ color: "var(--swiss-yellow-dark)" }}>
                Instagram: @deromebel_market
              </a>
              <a href="https://kaspi.kz/shop/m/30234153" target="_blank" rel="noreferrer" className="block hover:underline" style={{ color: "var(--swiss-yellow-dark)" }}>
                Kaspi.kz — DERO мебель
              </a>
            </div>
          </div>
          <div className="md:col-span-7">
            <div className="border border-foreground bg-background p-8 md:p-10">
              <p className="swiss-label mb-6">{t.home.aiOpen}</p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {lang === "kk"
                  ? "AI консультант сұрақтарыңызға жауап беріп, параметрлеріңізді жинап, заявканы менеджерге жібереді. Телефон нөміріңізді қалдыру жеткілікті."
                  : "AI-консультант ответит на вопросы, соберёт параметры и отправит заявку менеджеру. Достаточно оставить номер телефона."}
              </p>
              <Button
                size="lg"
                onClick={() => openChat({})}
                className="bg-swiss-yellow hover:bg-swiss-yellow/90 text-black rounded-none px-10 h-12 font-bold uppercase tracking-wider text-sm active:scale-[0.97] transition-transform"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t.home.heroCta1}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
