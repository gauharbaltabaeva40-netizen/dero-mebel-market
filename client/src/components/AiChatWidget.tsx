import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { useLang } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/* ── Types ─────────────────────────────────────────────────────────────── */

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  meta?: {
    score?: "hot" | "warm" | "cold" | "unqualified";
    scoreReason?: string;
    leadSubmitted?: boolean;
    handoff?: boolean;
    productLink?: { id: number; nameKk: string; nameRu: string };
    askContact?: boolean;
    leadCreated?: boolean;
  };
}

interface ChatContextValue {
  openChat: (opts?: { initialMessage?: string }) => void;
  closeChat: () => void;
  contextProduct?: { id: number; nameKk: string; nameRu: string };
  setContextProduct: (p: { id: number; nameKk: string; nameRu: string } | undefined) => void;
}

const ChatContext = createContext<ChatContextValue>({
  openChat: () => {},
  closeChat: () => {},
  setContextProduct: () => {},
});

/* Hook wrapper used by pages to open the widget with an optional first message */
export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | undefined>();
  const [contextProduct, setContextProduct] = useState<ChatContextValue["contextProduct"]>();

  const openChat = useCallback((opts?: { initialMessage?: string }) => {
    setPendingMessage(opts?.initialMessage);
    setOpen(true);
  }, []);

  const closeChat = useCallback(() => setOpen(false), []);

  // Notify ChatTrigger of open-state changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("dero-chat-state", { detail: { open } }));
  }, [open]);

  return (
    <ChatContext.Provider value={{ openChat, closeChat, contextProduct, setContextProduct }}>
      {children}
      <AiChatWidget
        open={open}
        onClose={closeChat}
        pendingMessage={pendingMessage}
        onConsumed={() => setPendingMessage(undefined)}
      />
    </ChatContext.Provider>
  );
}

/* Re-export helper so pages can use useOpenChat consistently */
export function useChat() {
  return useContext(ChatContext);
}

/** Alias kept for pages importing useOpenChat — same as useChat().openChat */
export function useOpenChat(): (opts?: { initialMessage?: string }) => void {
  return useChat().openChat;
}

/* ── Greeting texts ─────────────────────────────────────────────────────── */

const greetings = {
  kk: "Сәлем! Мен Dero Mebel AI-консультантымын. Ас үй немесе шкаф жайлы сұрақтарыңызға жауап беремін, шамамен баға есептеймін, заявканы менеджерге жіберемін. Не жайлы білгіңіз келеді?",
  ru: "Здравствуйте! Я AI-консультант Dero Mebel. Отвечу на вопросы о кухнях и шкафах, рассчитаю примерную цену, отправлю заявку менеджеру. Что вас интересует?",
};

/* ── Chat backend hook ──────────────────────────────────────────────────── */

function useChatBackend() {
  const utils = trpc.useUtils();

  /** Run one LLM turn with tool calling on the server, return assistant text + metadata. */
  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: () => {
      utils.ai.leadList.invalidate();
    },
  });

  return { chatMutation };
}

/* ── Widget ─────────────────────────────────────────────────────────────── */

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
  const [started, setStarted] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (!started) {
      setMessages([{ role: "assistant", content: greetings[lang] }]);
      setStarted(true);
    } else if (messages.length === 0) {
      setMessages([{ role: "assistant", content: greetings[lang] }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && pendingMessage) {
      sendMessage(pendingMessage);
      onConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pendingMessage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

    function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || chatMutation.isPending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setIsTyping(true);
    // Structured lead-form protocol: the chat history carries the parsed lead data
    // (as JSON appended after __LEAD_FORM__) so the LLM calls create_lead with exact values.
    const leadMatch = trimmed.match(/^__LEAD_FORM__\|([^|]*)\|([^|]*)\|(.*)$/);
    const payload: { name?: string; phone: string; productId?: number } = {
      name: leadMatch?.[1] || undefined,
      phone: leadMatch?.[2] ?? "",
      productId: leadMatch?.[3] ? Number(leadMatch[3]) : undefined,
    };
    const userMsg = leadMatch
      ? `${trimmed}\n
[LEAD_DATA] ${JSON.stringify(payload)}
[/LEAD_DATA]`
      : trimmed;
    const history = [...messages, { role: "user" as const, content: userMsg }];
    chatMutation.mutate(
      {
        messages: history,
        lang,
        productId: contextProduct?.id,
      },
      {
        onSuccess: (res: { text: string; meta?: ChatMessage["meta"] & { leadCreated?: boolean } }) => {
          setIsTyping(false);
          setMessages((m) => [
            ...m,
            { role: "assistant", content: res.text, meta: res.meta },
          ]);
          if (res.meta?.leadCreated) {
            toast.success(
              lang === "kk"
                ? "Заявка қабылданды! Менеджер байланысады."
                : "Заявка принята! Менеджер свяжется с вами.",
            );
          }
        },
        onError: () => {
          setIsTyping(false);
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              content:
                lang === "kk"
                  ? "Кешіріңіз, қазір жауап бере алмаймын. Бір сәттен соң қайта көріңіз немесе заявка қалдырыңыз."
                  : "Извините, сейчас не могу ответить. Попробуйте через минуту или оставьте заявку.",
            },
          ]);
        },
      },
    );
  }

  function submitLead() {
    if (!leadPhone.trim() || leadPhone.replace(/\D/g, "").length < 10) {
      toast.error(lang === "kk" ? "Телефон нөмірін дұрыс енгізіңіз" : "Введите корректный номер телефона");
      return;
    }
    // Send a structured handoff message that the backend turns into a lead
    sendMessage(
      `__LEAD_FORM__|${leadName.trim()}|${leadPhone.trim()}|${contextProduct ? contextProduct.id : ""}`,
    );
    setLeadSubmitted(true);
  }

  const quickActions = [
    { label: t.chat.quickPrice, value: lang === "kk" ? "Баға есептеп бер" : "Рассчитайте примерную цену" },
    { label: t.chat.quickCatalog, value: lang === "kk" ? "Каталогты көрсет" : "Покажите каталог" },
    { label: t.chat.quickDelivery, value: lang === "kk" ? "Жеткізу туралы айтыңыз" : "Расскажите о доставке" },
    { label: t.chat.quickWarranty, value: lang === "kk" ? "Кепілдік бар ма?" : "Есть ли гарантия?" },
  ];

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex flex-col items-end transition-all duration-300 ${
        open ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none translate-y-4"
      }`}
      style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
    >
      {open && (
        <div className="w-[min(420px,calc(100vw-2.5rem))] h-[560px] max-h-[75vh] mb-3 flex flex-col bg-background border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]">
          {/* header */}
          <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-3 bg-foreground text-background">
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 inline-flex items-center justify-center" style={{ backgroundColor: "var(--swiss-yellow)" }}>
                <Sparkles className="w-3 h-3 text-background" />
              </span>
              <div>
                <p className="font-black text-sm uppercase tracking-wide">{t.chat.title}</p>
                <p className="text-[10px] opacity-70">{t.chat.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-background/10 transition-colors"
              aria-label={t.chat.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <span className="swiss-square w-4 h-4 shrink-0 mr-2 mt-1" />
                )}
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-foreground text-background"
                      : "border border-foreground bg-background"
                  }`}
                >
                  <Streamdown>{msg.content}</Streamdown>

                  {/* lead score badge */}
                  {msg.meta?.score && msg.meta.score !== "unqualified" && (
                    <div className="mt-2 pt-2 border-t border-foreground/30 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {t.chat.scoreBadge}
                      </span>
                      <span className="text-xs font-black px-2 py-0.5 text-primary-foreground" style={{ backgroundColor: "var(--swiss-yellow)" }}>
                        {t.chat.scores[msg.meta.score]}
                      </span>
                    </div>
                  )}

                  {/* handoff notice */}
                  {msg.meta?.handoff && (
                    <div className="mt-2 pt-2 border-t border-swiss-yellow text-swiss-yellow-dark text-xs font-bold" style={{ color: "var(--swiss-yellow-dark)", borderColor: "var(--swiss-yellow)" }}>
                      {t.chat.managerHandoff}
                    </div>
                  )}

                  {/* product link */}
                  {msg.meta?.productLink && (
                    <a
                      href={`/products/${msg.meta.productLink.id}`}
                      className="mt-2 inline-block text-xs font-bold uppercase tracking-widest hover:opacity-70" style={{ color: "var(--swiss-yellow-dark)" }}
                    >
                      → {lang === "kk" ? msg.meta.productLink.nameKk : msg.meta.productLink.nameRu}
                    </a>
                  )}

                  {/* lead form at end of flow */}
                  {!leadSubmitted && msg.meta?.askContact && (
                    <div className="mt-3 pt-3 border-t border-foreground/30 space-y-2">
                      <Input
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        placeholder={t.chat.leadName}
                        className="rounded-none h-9 text-sm"
                      />
                      <Input
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                        placeholder={t.chat.leadPhone}
                        className="rounded-none h-9 text-sm"
                        type="tel"
                      />
                      <Button
                        size="sm"
                        onClick={submitLead}
                        className="w-full rounded-none text-primary-foreground font-bold uppercase tracking-wider text-xs h-9" style={{ backgroundColor: "var(--swiss-yellow)", color: "#000" }}
                      >
                        {t.chat.leadSubmit}
                      </Button>
                    </div>
                  )}
                  {leadSubmitted && msg.meta?.askContact && (
                    <p className="mt-2 pt-2 border-t border-foreground/30 text-xs font-bold" style={{ color: "var(--swiss-yellow-dark)" }}>
                      {t.chat.leadThanks}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <span className="swiss-square w-4 h-4 shrink-0 mr-2 mt-1" />
                <div className="border border-foreground px-3.5 py-2.5 text-xs text-muted-foreground italic">
                  {t.chat.typing}
                </div>
              </div>
            )}
          </div>

          {/* quick actions (shown when few messages) */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 border-t border-foreground/30 flex flex-wrap gap-1.5">
              {quickActions.map((q) => (
                <button
                  key={q.label}
                  onClick={() => sendMessage(q.value)}
                  disabled={chatMutation.isPending}
                  className="text-[11px] font-semibold uppercase tracking-wide border border-foreground/50 px-2.5 py-1 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* input */}
          <div className="border-t-2 border-foreground p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder={t.chat.placeholder}
              className="rounded-none h-10 text-sm"
              disabled={chatMutation.isPending}
            />
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={chatMutation.isPending || !input.trim()}
              className="rounded-none text-primary-foreground active:scale-95 transition-transform" style={{ backgroundColor: "var(--swiss-yellow)", color: "#000" }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {!open && (
        <button
          onClick={() => {
            if (!started) onConsumed();
            else onConsumed();
            // reopen handled by parent; simply toggle via context open state below
          }}
          className="hidden"
          aria-hidden
        />
      )}
    </div>
  );
}

/* Floating trigger button (always visible) */
export function ChatTrigger() {
  const { openChat, closeChat } = useChat();
  const { t } = useLang();
  const [isOpen, setIsOpen] = useState(false);

  // Keep local mirror of widget open state
  useEffect(() => {
    const handler = (e: CustomEvent) => setIsOpen(e.detail.open);
    window.addEventListener("dero-chat-state", handler as EventListener);
    return () => window.removeEventListener("dero-chat-state", handler as EventListener);
  }, []);

  return (
    <button
      onClick={() => {
        if (isOpen) closeChat();
        else openChat();
        window.dispatchEvent(new CustomEvent("dero-chat-state", { detail: { open: !isOpen } }));
      }}
      className={`fixed bottom-5 right-5 z-50 w-14 h-14 flex items-center justify-center transition-transform duration-200 active:scale-90 ${
        isOpen ? "bg-foreground text-background rotate-0" : "text-primary-foreground hover:scale-105"
      }`}
      style={{ backgroundColor: isOpen ? undefined : "var(--swiss-yellow)", boxShadow: "3px 3px 0 0 rgba(0,0,0,0.9)" }}
      aria-label={t.chat.title}
    >
      {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-6 h-6" />}
    </button>
  );
}
