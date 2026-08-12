import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "kk" | "ru";

const translations = {
  kk: {
    brand: "Dero Mebel",
    nav: {
      home: "Басты бет",
      catalog: "Каталог",
      faq: "Сұрақ-жауап",
      contact: "Байланыс",
    },
    home: {
      heroLabel: "Ас үй & Шкафтар — өз өндірісімізден",
      heroTitle: "Ас үйіңіз — ең басты бөлме.",
      heroTitleAccent: "Біз оны мықты етеміз.",
      heroSub: "Dero Mebel Market — Астанада ас үй жиһаздары мен шкафтарды өлшеміңізге сай жасаймыз. AI консультант бірнеше минутта шамамен баға шығарып береді.",
      heroCta1: "AI-дан сұрау",
      heroCta2: "Каталогты көру",
      stats: [
        ["Өз өндіріс", "Сырттан емес, цехта жасаймыз"],
        ["Тапсырыс бойынша", "Кез келген өлшемде, түсте"],
        ["Кепілдік", "Жасалған жұмысқа"],
      ],
      introLabel: "Компания туралы",
      introTitle: "Жиһаз — бұл инженерия, әрі өнер",
      introText: "Dero Mebel — Астанадағы жиһаз өндірісі. Біз ас үйлер мен гардеробтарды тапсырыс берушінің нақты өлшемдеріне сай жасаймыз: өлшем алу, дизайн, өндіріс, жеткізу және монтаж — бір қолдан. Каталогтағы үлгілер — бастау нүктесі ғана: кез келген өлшем, түс және конфигурацияны өзгерте аламыз.",
      catsLabel: "Санаттар",
      catsTitle: "Не жасаймыз",
      catKitchen: "Ас үй",
      catKitchenDesc: "Сызықты, бұрыштық, U-тәрізді ас үйлер — кез келген конфигурацияда",
      catWardrobe: "Шкафтар",
      catWardrobeDesc: "Гардеробтар, шкаф-купе, киім бөлмелері — толық жабдықталған ішкі кеңістікпен",
      advLabel: "Артықшылықтар",
      advTitle: "Неге біз",
      adv1: ["Өз цехымыз", "Өндіріс бізде — делдалдарсыз, баға әділ әрі уақытты нақты айтамыз."],
      adv2: ["Өлшемге сай", "Қабырғаңызға миллиметрлік дәлдікпен: еденге дейін, төбеге дейін."],
      adv3: ["Толық цикл", "Өлшем → дизайн → өндіріс → жеткізу → монтаж — бір команда."],
      adv4: ["Кепілдік", "Фурнитура мен жиналған жұмысқа кепілдік береміз."],
      stepsLabel: "Тапсырыс беру",
      stepsTitle: "4 қадамда жұмыс істейтін жиһаз",
      step1: ["AI-дан бастаңыз", "Чатта сұрақтарыңызға жауап алыңыз, шамамен бағасын есептеңіз, контактіңізді қалдырыңыз."],
      step2: ["Өлшем алу", "Маман үйіңізге келіп нақты өлшемдерді алады — тегін немесе қызмет ретінде."],
      step3: ["Дизайн", "Эскиз пен нақты бағаны бекітеміз, келісімшарт жасаймыз."],
      step4: ["Өндіріс + монтаж", "Цехта жасалып, үйіңізге жеткізіліп, орнатылады."],
      faqPreviewLabel: "Жиі сұралатын сұрақтар",
      faqPreviewTitle: "Сұрағыңыз бар ма?",
      faqSeeAll: "Барлығын көру",
      galleryLabel: "Біздің жұмыстар",
      galleryTitle: "Нақты жобалар — Kaspi-дан",
      gallerySub: "Kaspi-да сатылатын нақты тауарлар — барлығын тапсырыс беруші алып кетті немесе қазір сатылымда. Тауарға басып, Kaspi-дан бірден сатып алыңыз.",
      galleryOpen: "Kaspi-да қарау",
      aiBanner: "AI консультант сіздің сұрақтарыңызға 24/7 жауап береді — баға, материал, жеткізу туралы сұраңыз.",
      aiOpen: "AI консультантты ашу",
      contactLabel: "Байланыс",
      contactTitle: "Бізбен байланысыңыз",
      contactNote: "Байланыс деректері: Instagram, WhatsApp, қоңырау және Kaspi-дағы дүкеніміз. Тауарды Kaspi-дан бірден сатып алуға болады.",
      footerRights: "Барлық құқықтар қорғалған",
      footerNote: "Барлық бағалар — шамамен. Нақты баға өлшем алу соңында бекітіледі.",
    },
    catalog: {
      title: "Каталог",
      subtitle: "Барлық үлгілер тапсырыс бойынша жасалады",
      filters: "Сүзгілер",
      category: "Санат",
      all: "Барлығы",
      style: "Стиль",
      material: "Материал",
      price: "Баға (₸-ден бастап)",
      maxPrice: "Максимум",
      results: "нәтиже",
      noResults: "Ештеңе табылмады. Сүзгілерді өзгертіп көріңіз немесе AI-дан сұраңыз.",
      styleTags: {
        modern: "Заманауи",
        classic: "Классикалық",
        minimalist: "Минималистік",
        loft: "Лофт",
        classicModern: "Классикалық-заманауи",
      },
      askAi: "Осы өнім туралы AI-дан сұрау",
      startingFrom: "бағадан",
      perMeter: "/ метр",
      perM2: "/ м²",
      buyKaspi: "Kaspi-дан сатып алу",
      buyKaspiNote: "Төлем, кредит және Kaspi Red бөліп төлеу",
      kaspiReviews: "пікір Kaspi-да",
      kaspiRating: "Kaspi-дағы рейтинг",
      kaspiMerchantNote: "Kaspi-дағы сатушының рейтингі 5.0 (111 пікір, 2000+ тапсырыс)",
      kaspiBadge: "Kaspi-да сатылады",
      kaspiBadgeNote: "Тікелей Kaspi-дан сатып алыңыз",
    },
    product: {
      back: "Каталогқа",
      description: "Сипаттама",
      materials: "Материалдар",
      dimensions: "Өлшемдер",
      colors: "Түстер",
      features: "Ерекшеліктер",
      delivery: "Жеткізу",
      installation: "Монтаж",
      warranty: "Кепілдік",
      estimatedPrice: "Шамамен баға",
      estimatedNote: "Бұл — бастапқы баға. Нақты баға өлшем алу соңында есептеледі. AI чатта дәлірек есептей аласыз.",
      orderAi: "AI-дан сұрау",
      orderButton: "Тапсырыс беру",
      leadTime: "Өндіріс мерзімі",
      days: "күн",
    },
    faqPage: {
      title: "Сұрақ-жауап",
      subtitle: "Компания, баға, жеткізу, монтаж және кепілдік туралы",
    },
    chat: {
      placeholder: "Хабарлама жазыңыз...",
      send: "Жіберу",
      title: "AI консультант",
      subtitle: "Dero Mebel — сұрақтарыңызға жауап беремін",
      quickPrice: "Баға есептеу",
      quickCatalog: "Каталог",
      quickDelivery: "Жеткізу",
      quickWarranty: "Кепілдік",
      close: "Жабу",
      leadName: "Атыңыз",
      leadPhone: "Телефон (+7...)",
      leadSubmit: "Заявка қалдыру",
      leadThanks: "Рақмет! Менеджер сізге жақын арада байланысады.",
      managerHandoff: "Сіздің сұрағыңызды менеджерге жібердім. Ол сізге жақын арада хабарласады.",
      scoreBadge: "Сіздің өтініміңіз:",
      scores: { hot: "Ыстық 🔥", warm: "Жылы 🟡", cold: "Салқын ⚪" },
      typing: "Жазып жатыр...",
    },
  },
  ru: {
    brand: "Dero Mebel",
    nav: {
      home: "Главная",
      catalog: "Каталог",
      faq: "Вопрос-ответ",
      contact: "Контакты",
    },
    home: {
      heroLabel: "Кухни & Шкафы — собственное производство",
      heroTitle: "Ваша кухня — самое важное место в доме.",
      heroTitleAccent: "Мы сделаем её надёжной.",
      heroSub: "Dero Mebel Market — изготавливаем кухни и шкафы в Астане по вашим точным размерам. AI-консультант за пару минут рассчитает примерную цену.",
      heroCta1: "Спросить у AI",
      heroCta2: "Смотреть каталог",
      stats: [
        ["Своё производство", "Делаем в цехе, не перепродаём"],
        ["На заказ", "Любой размер, любой цвет"],
        ["Гарантия", "На работу и сборку"],
      ],
      introLabel: "О компании",
      introTitle: "Мебель — это и инженерия, и искусство",
      introText: "Dero Mebel — мебельное производство в Астане. Мы делаем кухни и гардеробы точно под размеры заказчика: замер, дизайн, производство, доставка и монтаж — в одних руках. Модели в каталоге — только отправная точка: любой размер, цвет и конфигурацию мы меняем под вас.",
      catsLabel: "Категории",
      catsTitle: "Что мы делаем",
      catKitchen: "Кухни",
      catKitchenDesc: "Линейные, угловые, П-образные кухни — в любой конфигурации",
      catWardrobe: "Шкафы",
      catWardrobeDesc: "Гардеробы, шкафы-купе, гардеробные — с полной внутренней комплектацией",
      advLabel: "Преимущества",
      advTitle: "Почему мы",
      adv1: ["Свой цех", "Производим сами — без посредников, цена честная, сроки точные."],
      adv2: ["По вашим размерам", "Миллиметровая точность до стены: от пола до потолка."],
      adv3: ["Полный цикл", "Замер → дизайн → производство → доставка → монтаж — одна команда."],
      adv4: ["Гарантия", "Даём гарантию на фурнитуру и сборку."],
      stepsLabel: "Как заказать",
      stepsTitle: "Рабочая мебель за 4 шага",
      step1: ["Начните с AI", "Получите ответы на вопросы в чате, рассчитайте примерную цену, оставьте контакт."],
      step2: ["Замер", "Специалист приедет и снимет точные размеры — бесплатно или как услуга."],
      step3: ["Дизайн", "Утверждаем эскиз и точную цену, подписываем договор."],
      step4: ["Производство + монтаж", "Изготовим в цехе, привезём и установим у вас дома."],
      faqPreviewLabel: "Частые вопросы",
      faqPreviewTitle: "Остались вопросы?",
      faqSeeAll: "Смотреть все",
      galleryLabel: "Наши работы",
      galleryTitle: "Реальные проекты — с Kaspi",
      gallerySub: "Реальные товары, которые продаются на Kaspi — их уже купили клиенты или они сейчас в продаже. Нажмите на товар, чтобы купить напрямую на Kaspi.",
      galleryOpen: "Смотреть на Kaspi",
      aiBanner: "AI-консультант отвечает на ваши вопросы 24/7 — спрашивайте о цене, материалах, доставке.",
      aiOpen: "Открыть AI-консультанта",
      contactLabel: "Контакты",
      contactTitle: "Свяжитесь с нами",
      contactNote: "Наши контакты: Instagram, WhatsApp, звонок и магазин на Kaspi.kz. Товары можно купить напрямую на Kaspi.",
      footerRights: "Все права защищены",
      footerNote: "Все цены — примерные. Точная цена фиксируется после замера.",
    },
    catalog: {
      title: "Каталог",
      subtitle: "Все модели изготавливаются на заказ",
      filters: "Фильтры",
      category: "Категория",
      all: "Все",
      style: "Стиль",
      material: "Материал",
      price: "Цена (от, ₸)",
      maxPrice: "Максимум",
      results: "результ.",
      noResults: "Ничего не найдено. Измените фильтры или спросите у AI.",
      styleTags: {
        modern: "Современный",
        classic: "Классический",
        minimalist: "Минимализм",
        loft: "Лофт",
        classicModern: "Неоклассика",
      },
      askAi: "Спросить у AI об этой модели",
      startingFrom: "от",
      perMeter: "/ метр",
      perM2: "/ м²",
      buyKaspi: "Купить на Kaspi",
      buyKaspiNote: "Оплата, кредит и рассрочка Kaspi Red",
      kaspiReviews: "отзыв(ов) на Kaspi",
      kaspiRating: "Рейтинг на Kaspi",
      kaspiMerchantNote: "Рейтинг продавца на Kaspi 5.0 (111 отзывов, 2000+ заказов)",
      kaspiBadge: "Продаётся на Kaspi",
      kaspiBadgeNote: "Покупайте напрямую на Kaspi",
    },
    product: {
      back: "В каталог",
      description: "Описание",
      materials: "Материалы",
      dimensions: "Размеры",
      colors: "Цвета",
      features: "Особенности",
      delivery: "Доставка",
      installation: "Монтаж",
      warranty: "Гарантия",
      estimatedPrice: "Примерная цена",
      estimatedNote: "Это стартовая цена. Точная цена рассчитывается после замера. Можно точнее посчитать в AI-чате.",
      orderAi: "Спросить у AI",
      orderButton: "Заказать",
      leadTime: "Срок производства",
      days: "дн.",
    },
    faqPage: {
      title: "Вопрос-ответ",
      subtitle: "О компании, цене, доставке, монтаже и гарантии",
    },
    chat: {
      placeholder: "Напишите сообщение...",
      send: "Отправить",
      title: "AI-консультант",
      subtitle: "Dero Mebel — отвечу на ваши вопросы",
      quickPrice: "Рассчитать цену",
      quickCatalog: "Каталог",
      quickDelivery: "Доставка",
      quickWarranty: "Гарантия",
      close: "Закрыть",
      leadName: "Ваше имя",
      leadPhone: "Телефон (+7...)",
      leadSubmit: "Оставить заявку",
      leadThanks: "Спасибо! Менеджер свяжется с вами в ближайшее время.",
      managerHandoff: "Передал ваш вопрос менеджеру. Он свяжется с вами в ближайшее время.",
      scoreBadge: "Ваша заявка:",
      scores: { hot: "Горячая 🔥", warm: "Тёплая 🟡", cold: "Холодная ⚪" },
      typing: "печатает...",
    },
  },
} as const;

type TranslationRoot = (typeof translations)[Lang];

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TranslationRoot;
}>({
  lang: "kk",
  setLang: () => {},
  t: translations.kk,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem("dero-lang");
      if (stored === "kk" || stored === "ru") return stored;
    } catch {
      // localStorage unavailable (SSR/privacy mode) — fall back to default
    }
    return "kk";
  });

  const setLangPersisted = (next: Lang) => {
    setLang(next);
    try {
      localStorage.setItem("dero-lang", next);
    } catch {
      // ignore
    }
  };

  const t = translations[lang];
  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangPersisted, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}

export function styleTag(style: string, t: TranslationRoot): string {
  const map = t.catalog.styleTags as Record<string, string>;
  return map[style] ?? style;
}
