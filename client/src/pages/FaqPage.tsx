import { trpc } from "@/lib/trpc";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLang } from "@/contexts/LanguageContext";

export default function FaqPage() {
  const { t, lang } = useLang();
  const { data: faqs } = trpc.faqs.list.useQuery();

  const categories = [
    { key: "company", label: lang === "kk" ? "Компания" : "Компания" },
    { key: "products", label: lang === "kk" ? "Өнімдер" : "Продукция" },
    { key: "materials", label: lang === "kk" ? "Материалдар" : "Материалы" },
    { key: "price", label: lang === "kk" ? "Баға" : "Цена" },
    { key: "ordering", label: lang === "kk" ? "Тапсырыс" : "Заказ" },
    { key: "payment", label: lang === "kk" ? "Төлем" : "Оплата" },
    { key: "delivery", label: lang === "kk" ? "Жеткізу" : "Доставка" },
    { key: "installation", label: lang === "kk" ? "Монтаж" : "Монтаж" },
    { key: "warranty", label: lang === "kk" ? "Кепілдік" : "Гарантия" },
  ];

  return (
    <div className="container py-12 md:py-16">
      <p className="swiss-label mb-4">Dero Mebel</p>
      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3">{t.faqPage.title}</h1>
      <p className="text-muted-foreground mb-10 max-w-xl">{t.faqPage.subtitle}</p>

      <div className="space-y-10">
        {categories.map((cat) => {
          const items = (faqs ?? []).filter((f) => f.category === cat.key);
          if (items.length === 0) return null;
          return (
            <section key={cat.key}>
              <h2 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="swiss-square w-3 h-3 inline-block" />
                {cat.label}
              </h2>
              <Accordion type="single" collapsible className="border border-foreground">
                {items.map((f, i) => (
                  <AccordionItem key={f.id} value={`faq-${f.id}`} className="px-4">
                    <AccordionTrigger className="text-left font-semibold hover:no-underline hover:text-swiss-yellow">
                      {lang === "kk" ? f.questionKk : f.questionRu}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {lang === "kk" ? f.answerKk : f.answerRu}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          );
        })}
      </div>
    </div>
  );
}
