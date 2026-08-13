import { Link, useLocation } from "wouter";
import type { ReactNode } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { ChatTrigger } from "@/components/AiChatWidget";

/**
 * Swiss-style layout: top thin black border, uppercase navigation,
 * red square as the brand mark.
 */
const LOGO_URL = "/manus-storage/dero-mebel-logo_6177e179.png";

/**
 * Swiss-style layout: top thin black border, uppercase navigation,
 * official DERO MEBEL MARKET logo (silver/white lettering + gold accents).
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useLang();
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: t.nav.home },
    { href: "/catalog", label: t.nav.catalog },
    { href: "/faq", label: t.nav.faq },
    { href: "/#contact", label: t.nav.contact },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      {/* Four-sided page frame: outer padding on all sides */}
      <div className="flex-1 flex flex-col m-2 sm:m-3 md:m-6 lg:m-8">
      <header className="motion-fade-up sticky top-3 z-40 px-1 sm:px-2">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 rounded-[1.65rem] border border-foreground/20 bg-background/72 px-2 py-2 shadow-[0_12px_32px_rgba(0,0,0,0.10)] backdrop-blur-xl sm:gap-4 sm:px-4">
          <Link href="/" className="flex shrink-0 items-center gap-1 rounded-full px-1 py-0.5 transition-opacity hover:opacity-70" aria-label="Dero Mebel Market">
            <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-foreground/20 bg-background sm:size-9">
              <img src={LOGO_URL} alt="" className="size-full object-cover" />
            </span>
            <span className="flex flex-col leading-none select-none">
              <span className="text-[6px] sm:text-[9px] font-black tracking-[0.08em] sm:tracking-[0.16em]" style={{ color: "var(--foreground)", fontFamily: "'Inter', sans-serif" }}>DERO MEBEL</span>
              <span className="mt-0.5 hidden text-[8px] sm:block sm:text-[9px] font-black tracking-[0.18em]" style={{ color: "var(--swiss-yellow-dark)", fontFamily: "'Inter', sans-serif" }}>MARKET</span>
            </span>
          </Link>

          <nav className="flex min-w-0 flex-1 items-center justify-start gap-3 overflow-x-auto whitespace-nowrap no-scrollbar sm:justify-center sm:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-1 py-1 text-[9px] sm:px-2 sm:text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${
                  location === item.href
                    ? "bg-foreground text-background"
                    : "text-foreground/65 hover:bg-foreground/8 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 overflow-hidden rounded-full border border-foreground/30 bg-background/65 text-[9px] sm:text-[10px] font-bold uppercase">
            <button
              onClick={() => setLang("kk")}
              className={`px-2 py-1 transition-colors duration-150 ${
                lang === "kk" ? "bg-foreground text-background" : "hover:bg-muted"
              }`}
            >
              KZ
            </button>
            <button
              onClick={() => setLang("ru")}
              className={`px-2 py-1 transition-colors duration-150 border-l border-foreground/30 ${
                lang === "ru" ? "bg-foreground text-background" : "hover:bg-muted"
              }`}
            >
              RU
            </button>
          </div>
        </div>
      </header>

      <main className="site-main flex-1 py-8 md:py-10">{children}</main>
      <ChatTrigger />

      <footer className="motion-fade-up border border-foreground bg-foreground text-background">
        <div className="container py-10 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={LOGO_URL} alt="Dero Mebel Market" className="h-12 w-auto object-contain rounded-sm" />
            </div>
            <p className="text-sm text-background/70 max-w-xs">
              {lang === "kk"
                ? "Астанада ас үй жиһаздары мен шкафтарды өз өндірісімізде жасаймыз."
                : "Изготавливаем кухни и шкафы в собственном производстве в Астане."}
            </p>
            <div className="mt-4 flex flex-col gap-2 text-xs font-bold uppercase tracking-wider">
              <a
                href="https://www.instagram.com/deromebel_market/"
                target="_blank"
                rel="noreferrer"
                className="inline-block hover:underline hover:text-background transition-colors"
                style={{ color: "var(--swiss-yellow)" }}
              >
                Instagram →
              </a>
              <a
                href="https://kaspi.kz/shop/m/30234153"
                target="_blank"
                rel="noreferrer"
                className="inline-block hover:underline hover:text-background transition-colors"
                style={{ color: "var(--swiss-yellow)" }}
              >
                Kaspi.kz →
              </a>
            </div>
          </div>
          <div>
            <p className="swiss-label mb-4">{t.nav.catalog}</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/catalog?category=kitchen" className="hover:underline transition-colors" style={{ color: "var(--swiss-yellow)" }}>
                {t.home.catKitchen}
              </Link>
              <Link href="/catalog?category=wardrobe" className="hover:underline transition-colors" style={{ color: "var(--swiss-yellow)" }}>
                {t.home.catWardrobe}
              </Link>
            </div>
          </div>
          <div>
            <p className="swiss-label mb-4" style={{ color: "var(--swiss-yellow)" }}>{t.home.contactLabel}</p>
            <div className="text-sm space-y-1.5">
              <a href="tel:+77010822764" className="block hover:underline font-bold text-background">+7 701 082 27 64</a>
              <a href="https://wa.me/77010822764" target="_blank" rel="noreferrer" className="block hover:underline hover:text-background transition-colors" style={{ color: "var(--swiss-yellow)" }}>
                WhatsApp: +7 701 082 27 64
              </a>
              <a
                href="https://www.instagram.com/deromebel_market/"
                target="_blank"
                rel="noreferrer"
                className="block hover:underline hover:text-background transition-colors"
                style={{ color: "var(--swiss-yellow)" }}
              >
                Instagram: @deromebel_market
              </a>
              <a
                href="https://kaspi.kz/shop/m/30234153"
                target="_blank"
                rel="noreferrer"
                className="block hover:underline hover:text-background transition-colors"
                style={{ color: "var(--swiss-yellow)" }}
              >
                Kaspi.kz — DERO мебель
              </a>
              <p className="text-background/60">Астана, Керей хан 27</p>
              <p className="text-background/60">10:00–20:00</p>
            </div>
          </div>
        </div>
        <div className="border-t border-foreground/40">
          <div className="container py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-background/60">
            <span>© {new Date().getFullYear()} Dero Mebel — {t.home.footerRights}.</span>
            <span className="text-background/60">{t.home.footerNote}</span>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
