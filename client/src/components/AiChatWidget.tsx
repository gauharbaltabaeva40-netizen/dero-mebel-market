import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, MessageCircle, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { isBudgetQuickReply, isColorQuickReply, isMaterialQuickReply, resolveChatProductAction } from "@/lib/chatProductActions";
import { remainingTypingDuration } from "@/lib/chatTyping";
import { useLang } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RecommendedProduct = {
  id: number;
  nameKk: string;
  nameRu: string;
  descriptionKk?: string;
  descriptionRu?: string;
  photoUrl?: string | null;
  basePriceKzt?: number | null;
  priceUnit?: string | null;
  kaspiUrl?: string | null;
};

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  meta?: {
    recommendedProducts?: RecommendedProduct[];
    productAction?: "buy" | "select";
    quickReplies?: string[];
  };
}

interface ChatContextValue {
  openChat: (opts?: { initialMessage?: string }) => void;
  closeChat: () => void;
  contextProduct?: { id: number; nameKk: string; nameRu: string };
  setContextProduct: (product: { id: number; nameKk: string; nameRu: string } | undefined) => void;
}

const ChatContext = createContext<ChatContextValue>({
  openChat: () => {},
  closeChat: () => {},
  setContextProduct: () => {},
});

const greetings = {
  kk: "Сәлем! Мен Dero Mebel сату ассистентімін. Ас үй немесе шкафты таңдап, сізді Kaspi-дегі нақты сатып алу бетіне апарамын. Нені іздеп жүрсіз?",
  ru: "Здравствуйте! Я ассистент по продажам Dero Mebel. Помогу выбрать кухню или шкаф и переведу на страницу покупки конкретного товара в Kaspi. Что вы ищете?",
};

const starterActions = {
  kk: ["Ас үй", "Шкаф", "Түсті таңдау", "Материалды таңдау", "Бюджетті таңдау", "Каталогты көрсету"],
  ru: ["Кухня", "Шкаф", "Выбрать цвет", "Выбрать материал", "Выбрать бюджет", "Показать каталог"],
};

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | undefined>();
  const [contextProduct, setContextProduct] = useState<ChatContextValue["contextProduct"]>();

  const openChat = useCallback((options?: { initialMessage?: string }) => {
    setPendingMessage(options?.initialMessage);
    setOpen(true);
  }, []);
  const closeChat = useCallback(() => setOpen(false), []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("dero-chat-state", { detail: { open } }));
  }, [open]);

  return (
    <ChatContext.Provider value={{ openChat, closeChat, contextProduct, setContextProduct }}>
      {children}
      <AiChatWidget open={open} onClose={closeChat} pendingMessage={pendingMessage} onConsumed={() => setPendingMessage(undefined)} />
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}

export function useOpenChat(): (options?: { initialMessage?: string }) => void {
  return useChat().openChat;
}

function useChatBackend() {
  const chatMutation = trpc.ai.chat.useMutation();
  return { chatMutation };
}

function formatPrice(price: number | null | undefined, lang: "kk" | "ru") {
  if (price == null) return lang === "kk" ? "Бағасы Kaspi-де" : "Цена на Kaspi";
  return `${price.toLocaleString(lang === "kk" ? "kk-KZ" : "ru-RU")} ₸`;
}

function ProductPreviewCarousel({
  products,
  actionType,
  lang,
}: {
  products: RecommendedProduct[];
  actionType: "buy" | "select" | undefined;
  lang: "kk" | "ru";
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: -1 | 1) => trackRef.current?.scrollBy({ left: direction * 248, behavior: "smooth" });
  const title = lang === "kk" ? "Тауарды суреттерімен қарап шығыңыз" : "Посмотрите товары с фотографиями";

  return (
    <section className="mt-3 border-t border-foreground/20 pt-3" aria-label={title}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-foreground/65">{title}</p>
        {products.length > 1 && (
          <div className="flex gap-1">
            <button type="button" onClick={() => scroll(-1)} aria-label={lang === "kk" ? "Алдыңғы тауарлар" : "Предыдущие товары"} className="flex size-6 items-center justify-center border border-foreground/35 transition-colors hover:bg-foreground hover:text-background"><ChevronLeft className="size-3" /></button>
            <button type="button" onClick={() => scroll(1)} aria-label={lang === "kk" ? "Келесі тауарлар" : "Следующие товары"} className="flex size-6 items-center justify-center border border-foreground/35 transition-colors hover:bg-foreground hover:text-background"><ChevronRight className="size-3" /></button>
          </div>
        )}
      </div>
      <div ref={trackRef} className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        {products.map((product) => {
          const action = resolveChatProductAction(product, actionType);
          const name = lang === "kk" ? product.nameKk : product.nameRu;
          const description = lang === "kk" ? product.descriptionKk : product.descriptionRu;
          return (
            <article key={product.id} className="w-[212px] shrink-0 snap-start overflow-hidden border border-foreground/30 bg-muted/20">
              {product.photoUrl ? <img src={product.photoUrl} alt={name} className="aspect-[4/3] w-full object-cover" loading="lazy" /> : <div className="aspect-[4/3] bg-muted" aria-hidden="true" />}
              <div className="p-2.5">
                <p className="line-clamp-2 text-xs font-bold leading-snug">{name}</p>
                {description && <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-foreground/65">{description}</p>}
                <p className="mt-2 text-[11px] font-black" style={{ color: "var(--swiss-yellow-dark)" }}>{formatPrice(product.basePriceKzt, lang)}</p>
                <a href={action.href} target={action.target} rel={action.isPurchase ? "noopener noreferrer" : undefined} className="mt-2 flex h-8 items-center justify-center gap-1 bg-foreground px-2 text-[10px] font-black uppercase tracking-wide text-background transition-opacity hover:opacity-75">
                  {action.isPurchase ? (lang === "kk" ? "Kaspi-дан сатып алу" : "Купить на Kaspi") : (lang === "kk" ? "Үлгіні таңдау" : "Выбрать модель")}
                  {action.isPurchase && <ExternalLink className="size-3" />}
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AiChatWidget({
  open,
  onClose,
  pendingMessage,
  onConsumed,
}: {
  open: boolean;
  onClose: () => void;
  pendingMessage?: string;
  onConsumed: () => void;
}) {
  const { t, lang } = useLang();
  const { chatMutation } = useChatBackend();
  const { contextProduct } = useChat();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingStartedAt = useRef(0);

  const restart = useCallback(() => {
    setInput("");
    setIsTyping(false);
    setMessages([{ role: "assistant", content: greetings[lang] }]);
  }, [lang]);

  useEffect(() => {
    if (open && messages.length === 0) restart();
  }, [open, messages.length, restart]);

  useEffect(() => {
    if (open && pendingMessage) {
      sendMessage(pendingMessage);
      onConsumed();
    }
    // sendMessage intentionally reads current state; this runs only for an explicit opening action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pendingMessage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || chatMutation.isPending) return;
    setInput("");
    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const history = [...messages, userMessage];
    setMessages(history);
    typingStartedAt.current = Date.now();
    setIsTyping(true);
    const completeReply = (appendReply: () => void) => {
      window.setTimeout(() => {
        setIsTyping(false);
        appendReply();
      }, remainingTypingDuration(typingStartedAt.current));
    };
    chatMutation.mutate(
      { messages: history, lang, productId: contextProduct?.id },
      {
        onSuccess: (response) => {
          const meta = response.meta as ChatMessage["meta"];
          completeReply(() => setMessages((current) => [...current, { role: "assistant", content: response.text, meta }]));
        },
        onError: () => {
          completeReply(() => setMessages((current) => [
            ...current,
            {
              role: "assistant",
              content: lang === "kk" ? "Қазір жауапты дайындау мүмкін болмады. Қайта жазыңыз немесе каталогтан тауарды таңдаңыз." : "Сейчас не удалось подготовить ответ. Напишите ещё раз или выберите товар из каталога.",
            },
          ]));
        },
      },
    );
  }

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex flex-col items-end transition-all duration-300 ${open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
      style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
    >
      {open && (
        <section className="mb-3 flex h-[min(600px,calc(100vh-7rem))] w-[min(430px,calc(100vw-2rem))] flex-col border-2 border-foreground bg-background shadow-[6px_6px_0_0_rgba(0,0,0,0.9)]" aria-label={t.chat.title}>
          <header className="flex items-center justify-between border-b-2 border-foreground bg-foreground px-4 py-3 text-background">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-5 items-center justify-center" style={{ backgroundColor: "var(--swiss-yellow)" }}><Sparkles className="size-3 text-background" /></span>
              <div>
                <p className="text-sm font-black uppercase tracking-wide">{t.chat.title}</p>
                <p className="text-[10px] opacity-70">{lang === "kk" ? "Kaspi-ге тікелей сатып алу" : "Прямая покупка через Kaspi"}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={restart} className="p-1.5 transition-colors hover:bg-background/10" aria-label={lang === "kk" ? "Чатты қайта бастау" : "Начать чат заново"}><RotateCcw className="size-4" /></button>
              <button onClick={onClose} className="p-1.5 transition-colors hover:bg-background/10" aria-label={t.chat.close}><X className="size-4" /></button>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && <span className="swiss-square mr-2 mt-1 size-4 shrink-0" />}
                <div className={`max-w-[86%] px-3.5 py-2.5 text-sm leading-relaxed ${message.role === "user" ? "bg-foreground text-background" : "border border-foreground bg-background"}`}>
                  <Streamdown>{message.content}</Streamdown>

                  {message.meta?.recommendedProducts && message.meta.recommendedProducts.length > 0 && (
                    <ProductPreviewCarousel products={message.meta.recommendedProducts} actionType={message.meta.productAction} lang={lang} />
                  )}

                  {message.meta?.quickReplies && message.meta.quickReplies.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-foreground/20 pt-3">
                      {message.meta.quickReplies.map((reply) => {
                        const replyType = isBudgetQuickReply(reply) ? "budget" : isColorQuickReply(reply) ? "color" : isMaterialQuickReply(reply) ? "material" : "general";
                        return <button key={reply} onClick={() => sendMessage(reply)} disabled={chatMutation.isPending} data-chat-reply-type={replyType} className="border border-foreground/50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors hover:bg-foreground hover:text-background disabled:opacity-50">{reply}</button>;
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start" role="status" aria-live="polite">
                <span className="swiss-square mr-2 mt-1 size-4 shrink-0" />
                <div className="flex items-center gap-2 border border-foreground bg-muted/45 px-3.5 py-2.5 text-xs font-medium text-foreground">
                  <span>{t.chat.typing}</span>
                  <span className="chat-typing-dots" aria-hidden="true"><i /><i /><i /></span>
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-foreground/30 px-4 py-2">
              {starterActions[lang].map((action) => <button key={action} onClick={() => sendMessage(action)} disabled={chatMutation.isPending} className="border border-foreground/50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors hover:bg-foreground hover:text-background disabled:opacity-50">{action}</button>)}
            </div>
          )}

          <form onSubmit={(event) => { event.preventDefault(); sendMessage(input); }} className="flex gap-2 border-t-2 border-foreground p-3">
            <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder={t.chat.placeholder} className="h-10 rounded-none text-sm" disabled={chatMutation.isPending} />
            <Button type="submit" size="icon" disabled={chatMutation.isPending || !input.trim()} className="rounded-none text-primary-foreground transition-transform active:scale-95" style={{ backgroundColor: "var(--swiss-yellow)", color: "#000" }}><Send className="size-4" /></Button>
          </form>
        </section>
      )}
    </div>
  );
}

export function ChatTrigger() {
  const { openChat, closeChat } = useChat();
  const { t } = useLang();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleState = (event: Event) => setIsOpen((event as CustomEvent<{ open: boolean }>).detail.open);
    window.addEventListener("dero-chat-state", handleState);
    return () => window.removeEventListener("dero-chat-state", handleState);
  }, []);

  return (
    <button
      onClick={() => isOpen ? closeChat() : openChat()}
      className={`fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center transition-transform duration-200 active:scale-90 ${isOpen ? "bg-foreground text-background" : "text-primary-foreground hover:scale-105"}`}
      style={{ backgroundColor: isOpen ? undefined : "var(--swiss-yellow)", boxShadow: "3px 3px 0 0 rgba(0,0,0,0.9)" }}
      aria-label={t.chat.title}
    >
      {isOpen ? <X className="size-5" /> : <MessageCircle className="size-6" />}
    </button>
  );
}
