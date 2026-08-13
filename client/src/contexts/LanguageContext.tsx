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
      heroLabel: "Астана • өз өндірісіміз",
      heroTitle: "Үйіңізге арналған",
      heroTitleAccent: "жеке жиһаз.",
      heroSub: "Dero Mebel Market ас үй, шкаф, гардероб, кіреберіс және жеке жобаға арналған жиһазды өлшеміңізге сай жасайды. DERO AI параметрлеріңізді жинап, лайықты үлгілерді ұсынады.",
      heroCta1: "DERO AI-дан сұрау",
      heroCta2: "Каталогты көру",
      stats: [
        ["Өз өндіріс", "Сырттан емес, цехта жасаймыз"],
        ["Тапсырыс бойынша", "Кез келген өлшемде, түсте"],
        ["Кепілдік", "Жасалған жұмысқа"],
      ],
      introLabel: "Компания туралы",
      introTitle: "Жиһаз — бұл инженерия, әрі өнер",
      introText: "Dero Mebel — Астанадағы жиһаз өндірісі. Біз ас үй, шкаф, гардероб, кіреберіс және өзге де жеке жобаларды тапсырыс берушінің нақты өлшемдеріне сай жасаймыз: өлшем алу, дизайн, өндіріс, жеткізу және монтаж — бір қолдан. Каталогтағы үлгілер — бастау нүктесі ғана: кез келген өлшем, түс және конфигурацияны өзгерте аламыз.",
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
      galleryTitle: "Нақты жиһаз үлгілері",
      gallerySub: "Dero Mebel жобаларының нақты үлгілері. Әр нұсқаны өлшеміңізге, түсіңізге және материалыңызға бейімдеуге болады.",
      galleryOpen: "Үлгі",
      aiBanner: "DERO AI сіздің сұрақтарыңызға жауап береді және параметрлер бойынша лайықты үлгілерді іріктейді.",
      aiOpen: "DERO AI-ды ашу",
      contactLabel: "Байланыс",
      contactTitle: "Бізбен байланысыңыз",
      contactNote: "Байланыс деректері: Instagram, WhatsApp және қоңырау. Жоба параметрлерін DERO AI арқылы іріктеп, кейін нақтылай аласыз.",
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
      dimensions: "Өлшемдер (мм)",
      width: "Ені",
      height: "Биіктігі",
      depth: "Тереңдігі",
      clearSize: "Өлшемді өшіру",
      unitMm: "мм",
      unitCm: "см",
      availability: "Қолжетімділік",
      availableOnly: "Тек тапсырысқа қолжетімді",
      inStock: "Қоймада бар",
      madeToOrder: "Тапсырыс бойынша жасалады",
      unavailable: "Қазір қолжетімсіз",
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
      kaspiMerchantNote: "Рейтинг пен пікір саны Kaspi каталогынан алынды.",
      kaspiReadReviews: "Kaspi-дағы пікірлерді оқу",
      kaspiNoReviews: "Kaspi-да пікірлер әзірге жоқ",
      kaspiNoRating: "Kaspi рейтингті әлі көрсетпейді",
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
      orderAi: "DERO AI-дан сұрау",
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
      title: "DERO AI",
      subtitle: "Dero Mebel — жеке параметрлер бойынша іріктеу",
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
      heroLabel: "Астана • собственное производство",
      heroTitle: "Индивидуальная мебель",
      heroTitleAccent: "для вашего дома.",
      heroSub: "Dero Mebel Market изготавливает в Астане кухни, шкафы, гардеробные, мебель для прихожих и индивидуальных проектов по вашим размерам. DERO AI соберёт параметры и предложит подходящие модели.",
      heroCta1: "Спросить DERO AI",
      heroCta2: "Смотреть каталог",
      stats: [
        ["Своё производство", "Делаем в цехе, не перепродаём"],
        ["На заказ", "Любой размер, любой цвет"],
        ["Гарантия", "На работу и сборку"],
      ],
      introLabel: "О компании",
      introTitle: "Мебель — это и инженерия, и искусство",
      introText: "Dero Mebel — мебельное производство в Астане. Мы делаем кухни, шкафы, гардеробные, мебель для прихожих и другие индивидуальные проекты точно под размеры заказчика: замер, дизайн, производство, доставка и монтаж — в одних руках. Модели в каталоге — только отправная точка: любой размер, цвет и конфигурацию мы меняем под вас.",
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
      galleryTitle: "Реальные образцы мебели",
      gallerySub: "Реальные образцы проектов Dero Mebel. Любую модель можно адаптировать по вашим размерам, цвету и материалу.",
      galleryOpen: "Образец",
      aiBanner: "DERO AI отвечает на вопросы и подбирает подходящие модели по вашим параметрам.",
      aiOpen: "Открыть DERO AI",
      contactLabel: "Контакты",
      contactTitle: "Свяжитесь с нами",
      contactNote: "Наши контакты: Instagram, WhatsApp и звонок. Параметры проекта можно подобрать через DERO AI, а затем уточнить детали.",
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
      dimensions: "Размеры (мм)",
      width: "Ширина",
      height: "Высота",
      depth: "Глубина",
      clearSize: "Сбросить размеры",
      unitMm: "мм",
      unitCm: "см",
      availability: "Доступность",
      availableOnly: "Только доступные для заказа",
      inStock: "Есть на складе",
      madeToOrder: "Изготавливается на заказ",
      unavailable: "Сейчас недоступно",
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
      kaspiMerchantNote: "Рейтинг и число отзывов взяты из каталога Kaspi.",
      kaspiReadReviews: "Читать отзывы на Kaspi",
      kaspiNoReviews: "Отзывов на Kaspi пока нет",
      kaspiNoRating: "Kaspi пока не показывает рейтинг",
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
      orderAi: "Спросить DERO AI",
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
      title: "DERO AI",
      subtitle: "Dero Mebel — подбор по индивидуальным параметрам",
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
