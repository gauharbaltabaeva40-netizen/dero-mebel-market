# Dero Mebel — Product & Business Specification

**Деректер базасы нұсқасы:** 1.0
**Құрылған күні:** 11 тамыз 2026
**Күйі:** Draft — нақты бизнес деректерін толтыруды күтіп тұр
**Дайындаған:** Manus AI + жоба иесі

---

## 1. Құжаттың мақсаты

Бұл құжат **Dero Mebel AI Sales Manager** өнімінің бірыңғай спецификациясы болып табылады. Ол мына бөлімдерден тұрады:

| № | Бөлім | Сипаттамасы |
|---|-------|-------------|
| 1 | Business data dictionary | Компанияның нақты деректері (толықтырылуы керек) |
| 2 | Product schema | Өнім деректерінің құрылымы |
| 3 | Lead schema | Лидтердің құрылымы және scoring |
| 4 | Pricing schema | Баға есептеу ережелерінің құрылымы |
| 5 | Database schema (SQL) | Production database кестелері |
| 6 | Website page structure | Барлық беттердің картасы |
| 7 | API endpoints | Backend API спецификациясы |
| 8 | Project folder structure | Жоба файлдарының құрылымы |
| 9 | Development phases | MVP құрудың қадамдық жоспары |

**Маңызды принцип:** Бұл құжатта нақты бизнес мәліметі болмаған жерде `UNKNOWN` белгісі қойылған. Ешқандай баға, өлшем, мекенжай немесе уақыт ойдан шығарылмайды. Нақты мәндер ағаңыздан алынған соң `UNKNOWN` орындарын толтырамыз.

---

## 2. Business Data Dictionary

Бұл бөлім — жобаның жүрегі. AI-дың дұрыс жұмыс істеуі үшін мына 21 сұраққа жауап қажет. Әр жолға `UNKNOWN` деп белгіленген — жауапты берген сайын, сол жерге нақты мәнді жазамыз.

### 2.1 Компания туралы

| # | Сұрақ | Мән | Статус |
|---|-------|-----|--------|
| 1 | Нақты компания атауы | `UNKNOWN` — жоба атауы "Dero Mebel", бірақ заңды атау/бренд дәлелденуі керек | ⬜ |
| 2 | Мекенжай (шоурум/салон) | `UNKNOWN` | ⬜ |
| 3 | Жұмыс уақыты | `UNKNOWN` | ⬜ |
| 4 | Телефон / WhatsApp | `UNKNOWN` | ⬜ |
| 5 | Instagram сілтемесі | `UNKNOWN` | ⬜ |
| 6 | Kaspi сілтемесі/дүкені | `UNKNOWN` | ⬜ |
| 7 | Өндіріс/цех мекенжайы | `UNKNOWN` | ⬜ |
| 8 | Компания туралы қысқа мәтін (тарихы, артықшылықтары) | `UNKNOWN` | ⬜ |

### 2.2 Өнім және өндіріс

| # | Сұрақ | Мән | Статус |
|---|-------|-----|--------|
| 9 | Нақты өнім каталогы (атауы, фото, сипаттама) | `UNKNOWN` | ⬜ |
| 10 | Қолжетімді материалдар тізімі (ДСП, МДФ, массив, ЛДСП...) | `UNKNOWN` | ⬜ |
| 11 | Фасад түрлері | `UNKNOWN` | ⬜ |
| 12 | Жұмыс беті (countertop) түрлері | `UNKNOWN` | ⬜ |
| 13 | Фурнитура брендтері (Blum, т.б.) | `UNKNOWN` | ⬜ |
| 14 | Қолжетімді түстер палитрасы | `UNKNOWN` | ⬜ |

### 2.3 Бағалар және ережелер

| # | Сұрақ | Мән | Статус |
|---|-------|-----|--------|
| 15 | Кухня баға формуласы (мысалы: ₸/метр, немесе ₸/метр²) | `UNKNOWN` | ⬜ |
| 16 | Шкаф баға формуласы | `UNKNOWN` | ⬜ |
| 17 | Жеткізу бағасы (қалаға, облысқа) | `UNKNOWN` | ⬜ |
| 18 | Орнату (монтаж) бағасы | `UNKNOWN` | ⬜ |
| 19 | Минималды тапсырыс сомасы | `UNKNOWN` | ⬜ |
| 20 | Жеңілдіктер/акциялар | `UNKNOWN` | ⬜ |
| 21 | Кепілдік мерзімі мен шарттары | `UNKNOWN` | ⬜ |

### 2.4 Сату процесі

| # | Сұрақ | Мән | Статус |
|---|-------|-----|--------|
| 22 | Төлем түрлері (наличный, Kaspi, аударым, бөліп төлеу) | `UNKNOWN` | ⬜ |
| 23 | Алдын ала төлем (депозит) мөлшері | `UNKNOWN` | ⬜ |
| 24 | Өндіріс мерзімі (ortasha қанша күн) | `UNKNOWN` | ⬜ |
| 25 | Өлшем алу қызметі бар ма? тегін бе? | `UNKNOWN` | ⬜ |
| 26 | Жобалық дизайн/3D эскиз қызметі | `UNKNOWN` | ⬜ |
| 27 | Менеджерлер қандай сұрақтарды әдетте қояды? | `UNKNOWN` | ⬜ |
| 28 | "Hot lead" анықтамасы — компания бойынша | `UNKNOWN` | ⬜ |

> **Әрекет:** Осы кестелерді Google Docs немесе Google Sheets-ке көшіріп, ағаңызға жіберіңіз. Ол жауап берген сайын құжатты жаңартамыз. Барлық 28 жол толғанға дейін `UNKNOWN` мәндер UI-да "дәл ақпарат менеджерден" деп беріледі — AI ешқашан ойдан шығармайды.

---

## 3. Product Schema

Әр өнімнің стандартты құрылымы. Бұл құрылым database, каталог API және AI-дың `search_products()` құралы үшін бірыңғай.

```
Product
├── id                  UUID
├── sku                 STRING  — ішкі артикул (мысалы: KM-001)
├── name                STRING  — атауы (кз / ру / екі тілде)
├── category            ENUM    — kitchen | wardrobe | other
├── subcategory         STRING  — мысалы: linear, corner, sliding-door
├── description         TEXT    — сипаттама
├── photos              LIST[URL]
├── materials           LIST[STRING]
├── facade              STRING  | NULL
├── countertop          STRING  | NULL
├── hardware            STRING  | NULL
├── dimensions          OBJECT  — width, height, depth, custom_units (mm)
├── colors              LIST[STRING]
├── price               OBJECT  — base_price, price_unit (per_meter / fixed / per_m2), currency
├── features            LIST[STRING]
├── style               ENUM    — modern | classic | minimalist | loft | classic_modern
├── is_customizable     BOOLEAN — тапсырыс бойынша өлшем өзгерту мүмкін бе
├── lead_time_days      INTEGER | NULL
├── is_published        BOOLEAN
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

### 3.1 Баға ұсынысының маңызды ережесі

`price` өрісі **ешқашан LLM-ге "ойлануға" берілмейді**. AI тек параметрлерді жинайды да, `calculate_price()` құралын шақырады. Backend бағаны нақты формуламен есептейді. Бұл ереже архитектураның темірбетон принципі.

---

## 4. Lead Schema

### 4.1 Lead объектісі

```
Lead
├── id                  UUID
├── name                STRING  | NULL
├── phone               STRING  | NULL   — формат: +7XXXXXXXXXX
├── source              ENUM    — website_ai | instagram | whatsapp | kaspi | manager
├── conversation_id     STRING   — AI сессиясымен байланыс
├── product             ENUM    — kitchen | wardrobe | unknown
├── score               ENUM    — hot | warm | cold | unqualified
├── score_reason        TEXT     — AI неліктен осы балды қойды
├── fields              JSON     — гибридті ақпарат жинақтағышы (төменде):
│     ├── size_meters       FLOAT | NULL
│     ├── layout            STRING | NULL   — linear / corner / u-shape / island
│     ├── style             STRING | NULL
│     ├── material          STRING | NULL
│     ├── facade            STRING | NULL
│     ├── countertop        STRING | NULL
│     ├── hardware          STRING | NULL
│     ├── lighting          STRING | NULL
│     ├── width_m           FLOAT | NULL   (wardrobe)
│     ├── height_m          FLOAT | NULL
│     ├── depth_m           FLOAT | NULL
│     ├── sections          INT    | NULL
│     ├── door_type         STRING | NULL  — sliding / hinged
│     ├── internal_config   STRING | NULL
│     ├── color             STRING | NULL
│     ├── budget_tenge      INT    | NULL
│     ├── location          STRING | NULL  — city/district
│     ├── deadline          STRING | NULL  — "this month", "next month", NULL
│     ├── estimated_total   INT    | NULL   — calculate_price() нәтижесі
│     └── notes             TEXT   | NULL   — қосымша, AI-дың байқаған ақпарат
├── needs_human           BOOLEAN  — human handoff қажет пе
├── human_reason          TEXT     | NULL   — неге менеджерге беру керек
├── status                ENUM     — new | contacted | measuring | quote_sent | closed | lost
├── assigned_manager      STRING   | NULL
├── created_at            TIMESTAMP
└── updated_at            TIMESTAMP
```

### 4.2 Lead Scoring ережелері (дәлелдемелермен)

AI лидті тек мына критерийлер жиынтығы бойынша ғана бағалайды, ойдан шығармайды:

| Score | Критерийлер (барлығы дерлік сәйкесуі керек) | Мысал |
|-------|---------------------------------------------|-------|
| 🔥 **Hot** | нақты өлшем + нақты бюджет + жақын мерзім + контакті бар | "Маған осы айда кухня керек, бюджет 700 мың, өлшем алуға келе аласыздар ма?" |
| 🟡 **Warm** | қызығушылық + шамамен бюджет немесе мерзім | "Келесі айда алғым келеді, бағаларды қарап жатырмын" |
| ⚪ **Cold** | жалпы қызығушылық, өлшем/мерзім жоқ | "Жай қарап жүрмін" |
| 🚫 **Unqualified** | бизнес аумағынан тыс сұрақ | "Сіздер диван сатасыыздар ма?" |

---

## 5. Pricing Schema

### 5.1 Формуланың абстрактілі түрі

Баға ережесі backend-те мынадай құрылымда сақталады (нақты сандар UNKNOWN):

```yaml
pricing_rules:
  kitchen:
    unit: "per_meter"                 # X ₸ × ұзындығы (метр)
    base_rate_tenge_per_meter: UNKNOWN
    installation_rate_tenge_per_meter: UNKNOWN
    delivery_fixed_tenge: UNKNOWN     # Астана қаласы бойынша
    delivery_out_of_city_rate: UNKNOWN # ₸/км
    minimum_order_tenge: UNKNOWN
    optional_addons:                  # қосымша опциялар
      - lighting_led_strip: UNKNOWN ₸/метр
      - countertop_stone: UNKNOWN ₸/метр
    formula: |
      total = (length_m * base_rate)
            + (length_m * installation_rate)
            + delivery
            + SUM(addons)
      total = MAX(total, minimum_order)

  wardrobe:
    unit: "per_m2"                    # X ₸ × (ені × биіктігі) м²
    base_rate_tenge_per_m2: UNKNOWN
    sliding_door_surcharge_tenge_per_m2: UNKNOWN
    installation_fixed_tenge: UNKNOWN
    delivery_fixed_tenge: UNKNOWN
    formula: |
      area = width_m * height_m
      total = area * base_rate
            + (door_type == 'sliding' ? area * sliding_surcharge : 0)
            + installation_fixed
            + delivery
```

### 5.2 Ережелер

1. LLM ешқашан арифметика жасамайды — тек `calculate_price(params)` шақырады.
2. Параметр жеткіліксіз болса, AI алдымен толықтырады; `calculate_price()` қате қайтарса, AI клиентке "дәл ақпарат үшін менеджерге хабарласыңыз" дейді.
3. Баға әрқашан "шамамен / бастапқы бағадан" деген формулировкамен беріледі — финалды баға өлшем алу соңында ғана.
4. Нақты сандар backend конфигурация файлында (немесе DB `pricing_rules` кестесінде) сақталады — кодта хардкод емес.

---

## 6. Database Schema (SQL — Supabase/PostgreSQL)

Production кезеңі үшін негізгі схема. Даму басталғанда Google Sheets → backend sync қолданылады.

```sql
-- ============================================================
-- COMPANY SETTINGS
-- ============================================================
CREATE TABLE company_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key             TEXT UNIQUE NOT NULL,   -- 'phone', 'address', 'working_hours'...
  value           JSONB NOT NULL,         -- мәтін, сан немесе тізім болуы мүмкін
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku             TEXT UNIQUE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN ('kitchen','wardrobe','other')),
  subcategory     TEXT,
  description     TEXT,
  photos          JSONB DEFAULT '[]',
  materials       JSONB DEFAULT '[]',
  facade          TEXT,
  countertop      TEXT,
  hardware        TEXT,
  dimensions      JSONB,                  -- {"width_mm":3000,"height_mm":2400,...}
  colors          JSONB DEFAULT '[]',
  price           JSONB NOT NULL,         -- {"base_price":500000,"unit":"per_meter","currency":"KZT"}
  features        JSONB DEFAULT '[]',
  style           TEXT,
  is_customizable BOOLEAN DEFAULT true,
  lead_time_days  INT,
  is_published    BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_style ON products(style);

-- ============================================================
-- FAQ
-- ============================================================
CREATE TABLE faqs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question        TEXT NOT NULL,
  answer          TEXT NOT NULL,
  category        TEXT NOT NULL,          -- delivery | payment | warranty | ordering | company | products
  language        TEXT DEFAULT 'kk',      -- kk / ru
  is_active       BOOLEAN DEFAULT true
);
-- AI semantic search үшін embedding
ALTER TABLE faqs ADD COLUMN embedding vector(1024);

-- ============================================================
-- PRICING RULES
-- ============================================================
CREATE TABLE pricing_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type    TEXT NOT NULL CHECK (product_type IN ('kitchen','wardrobe')),
  rule_name       TEXT NOT NULL,          -- 'base_rate', 'installation_rate', 'delivery_city'...
  value           JSONB NOT NULL,         -- сан немесе объект
  is_active       BOOLEAN DEFAULT true
);

-- ============================================================
-- LEADS
-- ============================================================
CREATE TABLE leads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT,
  phone             TEXT,
  source            TEXT NOT NULL DEFAULT 'website_ai',
  conversation_id   TEXT,
  product           TEXT CHECK (product IN ('kitchen','wardrobe','unknown')),
  score             TEXT CHECK (score IN ('hot','warm','cold','unqualified')),
  score_reason      TEXT,
  fields            JSONB DEFAULT '{}',
  needs_human       BOOLEAN DEFAULT false,
  human_reason      TEXT,
  status            TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new','contacted','measuring','quote_sent','closed','lost')),
  assigned_manager  TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_score ON leads(score);
CREATE INDEX idx_leads_created ON leads(created_at DESC);

-- ============================================================
-- CONVERSATIONS (AI сессия тарихы)
-- ============================================================
CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         UUID REFERENCES leads(id) ON DELETE SET NULL,
  channel         TEXT NOT NULL DEFAULT 'website',
  state           JSONB DEFAULT '{}',     -- жиналған параметрлер: {size, style, budget...}
  messages        JSONB DEFAULT '[]',     -- толық тарих
  is_escalated    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### 6.1 Google Sheets синхронизациясы

Google Sheets production database емес, **менеджер көрінетін CRM-кесте** ретінде жұмыс істейді:

| Сынақ | Мәні |
|-------|------|
| Бағыт | DB `leads` → Google Sheets (тек жазу/жаңарту) |
| Триггер | Жаңа лид немесе статус өзгергенде |
| Әдіс | Backend Apps Script Web App немесе Google Sheets API |
| Кесте беттері | `Leads`, `Settings (оқу ғана)` |

Ағаңызға бұл дегеніміз: ол ешқандай жаңа админ панель үйренбейді — күнделікті жұмысын бұрынғыдай Google Sheets-те жалғастырады.

---

## 7. Website Page Structure

### 7.1 Беттер картасы

```
deromebel.kz (уақытша домен)
├── /                      Homepage
│    ├── Hero (ас үй + CTA: "Тегін өлшем алу" / "AI-дан сұра")
│    ├── Company intro
│    ├── Categories (Kitchen / Wardrobe карточкалары)
│    ├── Advantages (өз өндіріс, кепілдік, т.б. — UNKNOWN-дер кейін)
│    ├── Materials
│    ├── How to order (4 қадам: AI/заявка → өлшем → дизайн → өндіріс+монтаж)
│    ├── Reviews (UNKNOWN)
│    ├── FAQ-тың қысқартылған нұсқасы
│    └── Contact + карта + мессенджерлер
├── /catalog               Catalog (filter sidebar: style/material/color/price)
├── /catalog/kitchen
├── /catalog/wardrobe
├── /products/[id]         Product page
│    ├── Photos gallery
│    ├── Description, materials, dimensions, colors, features
│    ├── "Бастапқы бағадан: X ₸" (calculate_price() бекіткен)
│    ├── Delivery & installation блоктары
│    ├── AI assistant CTA: "Осы өнім туралы AI-дан сұрау"
│    └── Order CTA → lead form
├── /faq                   Толық FAQ
├── /contact               Байланыс
└── AI-виджет              Барлық бетте (оң жақ төмен бұрыш, chat toggle)
```

### 7.2 AI-виджеттің UX ағыны

1. Виджет-батырма ("🤖 AI консультант") барлық бетте көрінеді.
2. Басқанда → chat панелі ашылады, AI сәлемдеседі.
3. Product бетінде ашылса → AI сол өнімді контекст ретінде қабылдайды ("Осы [өнім] туралы сұрағыңыз келе ме?").
4. Chat ішінде: сұрақ → жауап, өнім ұсынысы карточкасы, баға, contact жинау, lead формасы.
5. Human handoff болғанда → чатта "Менеджер сізге жақын арада байланысады" + WhatsApp батырмасы.

---

## 8. API Endpoints

### 8.1 Chat / AI

```
POST   /api/chat
        Body:   { conversation_id?, message, context?: {page, product_id?} }
        Returns:{ reply, tool_calls?: [...], state, lead_id?, needs_human }

        Мұнда: AI бір сұрау ішінде бірнеше құрал шақыра алады
               (мысалы: search_products + search_faq), содан кейін
               бірыңғай жауап құрастырады.
```

### 8.2 Tools (AI backend ішінде)

```
POST   /api/tools/search_products    { category?, style?, material?, price_max?, query? }
POST   /api/tools/get_product        { product_id }
POST   /api/tools/search_faq         { query, language? }
POST   /api/tools/calculate_price    { product_type, params }        → { estimate, breakdown, disclaimer }
POST   /api/tools/create_lead        { fields }                      → { lead_id, score }
POST   /api/tools/update_lead        { lead_id, fields }
POST   /api/tools/notify_manager     { lead_id, reason }             → { ok }
```

### 8.3 Catalog

```
GET    /api/products                  ?category=&style=&material=&min_price=&max_price=&q=
GET    /api/products/:id
GET    /api/faqs                      ?category=&q=
GET    /api/company-settings
```

### 8.4 Admin (кейін)

```
POST   /api/admin/leads/:id/status    статус өзгерту (менеджер Sheets-тен де жасай алады)
POST   /api/admin/sync/sheets         қолмен Sheets-ке синхрондау
```

---

## 9. Project Folder Structure

```
dero-mebel/
├── docs/                          ← спецификациялар осында
│   ├── 01_product_and_business_specification.md
│   ├── 02_ai_system_prompt_and_tools.md
│   └── test-scenarios.md          (кейін: 120 сұрақ тестілері)
├── frontend/
│   ├── src/
│   │   ├── pages/                 → /, /catalog, /products, /faq, /contact
│   │   ├── components/
│   │   │   ├── AiWidget/          → chat UI + виджет
│   │   │   ├── catalog/           → ProductCard, Filters, CatalogGrid
│   │   │   └── home/              → Hero, Advantages, HowToOrder...
│   │   ├── lib/
│   │   │   └── api.ts             → /api/chat, /api/products клиенті
│   │   └── types/
│   └── public/
├── backend/
│   ├── app/
│   │   ├── main.py                → API router
│   │   ├── chat/
│   │   │   ├── agent.py           → LLM loop + tool dispatch
│   │   │   ├── prompt.py          → system prompt (02-құжаттан)
│   │   │   └── state.py           → conversation state жинау логикасы
│   │   ├── tools/                 → search_products, search_faq, calculate_price...
│   │   ├── pricing/
│   │   │   └── calculator.py      → таза функция: params → estimate
│   │   ├── db/                    → Supabase клиент
│   │   └── integrations/
│   │       └── google_sheets.py   → leads → Sheets sync
│   ├── config/
│   │   └── pricing_rules.yaml     → UNKNOWN мәндер осында
│   └── tests/                     → Phase 6 сценарийлері
└── README.md
```

---

## 10. AI System Design (қысқаша — толығы 02-құжатта)

| Компонент | Шешім |
|-----------|-------|
| LLM шақыру | Tool-calling (function calling) режимі; AI өзі тек мәтін + құрал шақыру қайтарады |
| Knowledge | RAG: FAQs embedding-і + company settings + pricing_rules контекстке құйылады |
| State | `conversations.state` JSON-ында жиналған параметрлер сақталады; AI қайта сұрамайды |
| Pricing | LLM арифметика жасамайды — `calculate_price()` backend функциясы ғана |
| Lead | Ақпарат жеткілікті болғанда `create_lead()`; score + reason AI қайтарады |
| Handoff | Escalation триггерлері (02-құжат, 6-бөлім) қосылғанда → менеджерге |
| Тіл | Қазақ/орыс — клиент қай тілде жазса, сол тілде жауап |

---

## 11. Development Phases (MVP жол картасы)

| Фаза | Мақсат | Біткендегі критерий |
|------|--------|---------------------|
| 0 | Business data жинау | 28 жолдық кесте толтырылады (UNKNOWN → мәндер) |
| 1 | UI: homepage + catalog + product page + AI chat UI | Mock AI-мен толық жұмыс істейтін frontend |
| 2 | Database: products, faqs, leads, pricing, settings | Supabase кестелері құрылып, seed деректер енгізіледі |
| 3 | AI: prompt + tools + state | Нақты LLM-мен жұмыс істейтін assistant |
| 4 | Lead pipeline: create_lead → DB → Google Sheets | Лид Sheets-те автоматты көрінеді |
| 5 | Pricing engine: calculate_price() | Баға тек формула арқылы, hallucination жоқ |
| 6 | Testing: 120 сұрақ сценарийі | Әр санат бойынша PASS/FAIL есеп |
| 7 | Deploy + бақылау | Ағаңыз нақты сайтты көреді, алғашқы клиент сөйлесулері |

---

## 12. Келесі қадамдар (не істеу керек)

1. **Сіз:** 2-бөлімдегі 28 сұраққа ағаңыздан жауап жинайсыз (Google Forms немесе жай тізім — қалай болса да).
2. **Мен:** 02-құжатты (AI system prompt + tool definitions) дайындаймын.
3. **Екеуіміз:** Деректер толыққан сайын Phase 1-ден бастап MVP-ны біртіндеп құрамыз — әр фазада кодты түсіндіріп отырамын (принцип #11: "Explain code while vibe coding").

Ережелер бойынша ең бастысы — **біз 28 сұрақтың жауабынсыз Phase 1-ді бастай аламыз** (UI mock деректермен), бірақ **Phase 3 (AI) және Phase 5 (pricing) ешқашан UNKNOWN мәндермен іске қосылмайды**.
