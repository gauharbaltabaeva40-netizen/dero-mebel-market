import { Link, useLocation } from "wouter";
import type { ReactNode } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { ChatTrigger } from "@/components/AiChatWidget";

/**
 * Swiss-style layout: top thin black border, uppercase navigation,
 * red square as the brand mark.
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
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-foreground">
        {/* Centered branding: logo square + DERO MEBEL MARKET */}
        <div className="container flex items-center justify-center py-3 gap-3">
          <span className="swiss-square w-5 h-5 md:w-6 md:h-6 inline-block shrink-0" />
          <span className="font-black text-lg md:text-2xl uppercase tracking-[0.14em] md:tracking-[0.18em] whitespace-nowrap">
            Dero <span className="text-swiss-red">Mebel</span> Market
          </span>
        </div>

        <div className="container flex items-center justify-center gap-8 h-14 border-t border-foreground/30">
          <nav className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold uppercase tracking-wider transition-colors duration-150 border-b-2 pb-0.5 ${
                  location === item.href
                    ? "border-swiss-red text-foreground"
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

      <main className="flex-1">{children}</main>
      <ChatTrigger />

      <footer className="border-t border-foreground mt-0">
        <div className="container py-10 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="swiss-square w-4 h-4 inline-block" />
              <span className="font-black uppercase tracking-wider">Dero Mebel Market</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              {lang === "kk"
                ? "Астанада ас үй жиһаздары мен шкафтарды өз өндірісімізде жасаймыз."
                : "Изготавливаем кухни и шкафы в собственном производстве в Астане."}
            </p>
          </div>
          <div>
            <p className="swiss-label mb-4">{t.nav.catalog}</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/catalog?category=kitchen" className="hover:text-swiss-red transition-colors" style={{ color: "var(--swiss-yellow-dark)" }}>
                {t.home.catKitchen}
              </Link>
              <Link href="/catalog?category=wardrobe" className="hover:text-swiss-red transition-colors">
                {t.home.catWardrobe}
              </Link>
            </div>
          </div>
          <div>
            <p className="swiss-label mb-4">{t.home.contactLabel}</p>
            <p className="text-sm text-muted-foreground">
              {t.home.contactNote}
            </p>
          </div>
        </div>
        <div className="border-t border-foreground/40">
          <div className="container py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Dero Mebel — {t.home.footerRights}.</span>
            <span>{t.home.footerNote}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
