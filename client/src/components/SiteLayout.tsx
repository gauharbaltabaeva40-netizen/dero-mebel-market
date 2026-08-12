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
      <div className="flex-1 flex flex-col m-2 md:m-4 lg:m-6">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border border-foreground">
        {/* Centered branding: official logo image + wordmark */}
        <div className="container flex items-center justify-center gap-4 md:gap-6 py-2">
          <img
            src={LOGO_URL}
            alt="Dero Mebel Market"
            className="h-16 md:h-20 w-auto object-contain"
          />
          <div className="flex flex-col leading-none select-none">
            <span
              className="text-2xl md:text-3xl font-black tracking-[0.18em]"
              style={{ color: "var(--foreground)", fontFamily: "'Inter', sans-serif" }}
            >
              DERO MEBEL
            </span>
            <span
              className="text-2xl md:text-3xl font-black tracking-[0.18em] mt-0.5"
              style={{ color: "var(--swiss-yellow)", fontFamily: "'Inter', sans-serif" }}
            >
              MARKET
            </span>
          </div>
        </div>

        <div className="container flex items-center justify-center gap-8 h-14 border-t border-foreground/30">
          <nav className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold uppercase tracking-wider transition-colors duration-150 border-b-2 pb-0.5 ${
                  location === item.href
                    ? "border-swiss-yellow text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex border border-foreground text-xs font-bold uppercase">
            <button
              onClick={() => setLang("kk")}
              className={`px-2.5 py-1 transition-colors duration-150 ${
                lang === "kk" ? "bg-foreground text-background" : "hover:bg-muted"
              }`}
            >
              KZ
            </button>
            <button
              onClick={() => setLang("ru")}
              className={`px-2.5 py-1 transition-colors duration-150 border-l border-foreground ${
                lang === "ru" ? "bg-foreground text-background" : "hover:bg-muted"
              }`}
            >
              RU
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 md:py-8">{children}</main>
      <ChatTrigger />

      <footer className="border border-foreground bg-foreground text-background">
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
