import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Search,
  Send,
  Ticket,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { askAfisha, type AskCard } from "@/lib/ask";
import {
  CITIES,
  NAV,
  ageLabel,
  coverFor,
  dayNumber,
  daysFrom,
  effectiveAge,
  excerpt,
  formatDayLong,
  formatPrice,
  formatWhen,
  headingFor,
  interpret,
  isWeekend,
  kindLabel,
  listingSearch,
  monthTitle,
  moscowToday,
  searchEvents,
  weekdayShort,
  type AfishaEvent,
  type City,
  type Kind,
  type ListingSearch,
} from "@/lib/catalog";
import { useUi } from "@/lib/store";

export function HydrateStore() {
  useEffect(() => {
    void useUi.persist.rehydrate();
  }, []);
  return null;
}

function Mark({ className = "size-9" }: { className?: string }) {
  return (
    <span className={`grid ${className} place-items-center rounded-xl bg-accent text-accent-fg`}>
      <svg viewBox="0 0 32 32" className="size-6" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7 6.5h10.2c3.6 0 5.9 2.1 5.9 5.2 0 2.3-1.3 4.1-3.4 4.9L24.6 26h-4.6l-4.2-7.4H11.4V26H7V6.5Zm4.4 3.2v4.6h5.4c1.5 0 2.4-.8 2.4-2s-.9-2-2.4-2h-5.4Z"
        />
      </svg>
    </span>
  );
}

export function Header() {
  const city = useUi((state) => state.city);
  const setCity = useUi((state) => state.setCity);
  const favs = useUi((state) => state.favs.length);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const search = useRouterState({ select: (state) => state.location.search as { kind?: Kind; q?: string } });
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [suggest, setSuggest] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const onHome = pathname === "/";
  const onList = pathname === "/events";
  const kind = onHome ? "all" : onList ? (search.kind ?? "all") : undefined;

  const parsed = useMemo(() => {
    const text = query.trim();
    if (text.length < 2) return null;
    return interpret(text, city);
  }, [city, query]);

  const results = useMemo(() => {
    if (!parsed) return [];
    return searchEvents({ ...parsed, city: parsed.city || city }).slice(0, 6);
  }, [city, parsed]);

  const expanded = searchOpen || query.trim().length > 0;

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) {
        setSuggest(false);
        if (!query.trim()) setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [query]);

  function go(partial: Partial<ListingSearch>) {
    setSuggest(false);
    setCityOpen(false);
    void navigate({ to: "/events", search: listingSearch(partial) });
  }

  function submitSearch() {
    const text = query.trim();
    if (text.length < 2) return;
    const filters = interpret(text, city);
    const lowered = text.toLowerCase();
    let date: string | undefined;
    let when: ListingSearch["when"];
    if (filters.from && filters.to && filters.from === filters.to) date = filters.from;
    else if (lowered.includes("выходн")) when = "weekend";
    else if (lowered.includes("недел")) when = "week";
    go({
      q: filters.q,
      kind: filters.kind ?? "all",
      free: Boolean(filters.free),
      ageMax: filters.ageMax,
      date,
      when,
    });
    setQuery("");
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="flag-bar" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link
          to="/"
          aria-label="Уфа Протрузия — на главную"
          aria-hidden={expanded}
          tabIndex={expanded ? -1 : 0}
          className={`logo-slot flex shrink-0 items-center overflow-hidden ${expanded ? "logo-slot-closed" : ""}`}
        >
          <img
            src="/logo-ufa.png"
            alt=""
            className="h-11 w-auto max-w-none object-contain object-left sm:h-14"
          />
        </Link>
        <div ref={boxRef} className={`relative z-20 min-w-0 flex-1 ${expanded ? "search-slot-open" : ""}`}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
          >
            <label
              className={`search-field flex min-w-0 items-center gap-2 rounded-full bg-soft px-4 py-2.5 ${expanded ? "search-field-open" : ""}`}
            >
              <Search className="size-5 shrink-0 text-muted" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSuggest(true);
                  setSearchOpen(true);
                }}
                onFocus={() => {
                  setSearchOpen(true);
                  setSuggest(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setSuggest(false);
                    if (!query.trim()) setSearchOpen(false);
                    event.currentTarget.blur();
                  }
                }}
                placeholder="Событие, площадка или «9 грамм»"
                className="w-full bg-transparent text-sm font-normal outline-none placeholder:text-faint"
                aria-label="Поиск событий"
              />
              {expanded ? (
                <button
                  type="button"
                  aria-label="Закрыть поиск"
                  className="grid size-7 shrink-0 place-items-center rounded-full text-muted"
                  onClick={() => {
                    setQuery("");
                    setSuggest(false);
                    setSearchOpen(false);
                  }}
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </label>
          </form>
          {suggest && query.trim().length >= 2 ? (
            <div className="search-pop absolute top-[calc(100%+0.5rem)] right-0 left-0 z-50 overflow-hidden rounded-2xl border border-line bg-bg shadow-xl">
              {results.length ? (
                <ul>
                  {results.map((event) => (
                    <li key={event.id}>
                      <Link
                        to="/events/$id"
                        params={{ id: event.id }}
                        className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-soft"
                        onClick={() => setSuggest(false)}
                      >
                        <img src={coverFor(event)} alt="" className="size-12 rounded-xl object-cover" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{event.title}</span>
                          <span className="block truncate text-xs text-muted">
                            {formatWhen(event.date_start)} · {event.venue} · {effectiveAge(event)}+
                          </span>
                          <span className="block truncate text-xs text-faint">{excerpt(event, 96)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-3 text-sm text-muted">Ничего не нашлось. Пробел в названии не обязателен — попробуйте «9грамм» или площадку.</p>
              )}
              <button type="button" className="press w-full border-t border-line px-4 py-3 text-left text-sm font-semibold" onClick={submitSearch}>
                Все результаты
              </button>
            </div>
          ) : null}
        </div>
        <div className="relative">
          <button
            type="button"
            className="press flex items-center gap-1 rounded-full px-2 py-2 text-sm font-medium"
            onClick={() => setCityOpen((value) => !value)}
            aria-expanded={cityOpen}
          >
            <MapPin className="size-4" />
            <span className="hidden sm:inline">{city}</span>
            <ChevronDown className="size-4 text-muted" />
          </button>
          {cityOpen ? (
            <div className="search-pop absolute right-0 z-40 mt-1 w-44 rounded-2xl border border-line bg-bg p-1 shadow-lg">
              {CITIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="press block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-soft"
                  onClick={() => {
                    setCity(item);
                    setCityOpen(false);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <Link
          to="/favorites"
          className="press inline-flex items-center gap-2 rounded-full bg-ink px-3 py-2.5 text-sm font-semibold text-accent-fg sm:px-4"
        >
          <Heart className="size-4" />
          <span className="hidden sm:inline">Избранное</span>
          {favs ? <span className="text-xs text-accent-fg/80">{favs}</span> : null}
        </Link>
      </div>
      <nav className="mx-auto max-w-6xl px-4 sm:px-6">
        <ul className="no-scrollbar flex gap-5 overflow-x-auto">
          {NAV.map((item) => {
            const active = kind === item.kind && (item.kind === "all" ? onHome || onList : onList);
            return (
              <li key={item.kind} className="shrink-0">
                {item.kind === "all" ? (
                  <Link
                    to="/"
                    className={`inline-block border-b-2 py-3 text-sm transition-colors ${active ? "border-accent font-semibold text-accent" : "border-transparent text-fg/80"}`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    to="/events"
                    search={listingSearch({ kind: item.kind })}
                    className={`inline-block border-b-2 py-3 text-sm transition-colors ${active ? "border-accent font-semibold text-accent" : "border-transparent text-fg/80"}`}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:px-6">
        <p>
          Независимый информационный сервис. Не является официальным сайтом Министерства культуры Республики
          Башкортостан и не продаёт билеты.
        </p>
        <p>
          Спросить афишу в Telegram:{" "}
          <a className="font-semibold text-fg" href="https://t.me/afisha_bash_demo_bot">
            @afisha_bash_demo_bot
          </a>
        </p>
      </div>
    </footer>
  );
}

export function DateStrip({
  value,
  onChange,
}: {
  value?: string;
  onChange: (day?: string) => void;
}) {
  const today = moscowToday();
  const days = daysFrom(today, 40);
  const scroller = useRef<HTMLDivElement>(null);
  const [calendar, setCalendar] = useState(false);
  const groups: { month: string; days: string[] }[] = [];
  for (const day of days) {
    const month = monthTitle(day);
    const last = groups[groups.length - 1];
    if (!last || last.month !== month) groups.push({ month, days: [day] });
    else last.days.push(day);
  }

  return (
    <div className="relative flex items-end gap-2">
      <button
        type="button"
        aria-label="Календарь"
        className="mb-1 grid size-11 shrink-0 place-items-center rounded-2xl bg-soft"
        onClick={() => setCalendar((open) => !open)}
      >
        <Calendar className="size-5" />
      </button>
      <div ref={scroller} className="no-scrollbar min-w-0 flex-1 overflow-x-auto">
        <div className="flex w-max gap-2">
          {groups.map((group) => (
            <div key={group.month}>
              <div className="mb-1 text-center text-sm text-faint">{capitalize(group.month)}</div>
              <div className="flex">
                {group.days.map((day) => {
                  const weekend = isWeekend(day);
                  const selected = value === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => onChange(selected ? undefined : day)}
                      className="flex w-11 flex-col items-center rounded-xl py-1"
                    >
                      <span
                        className={`text-base ${selected ? "font-medium" : "font-normal"} ${weekend ? "text-accent" : "text-fg"} ${selected ? "underline decoration-2 underline-offset-4" : ""}`}
                      >
                        {dayNumber(day)}
                      </span>
                      <span className={`text-xs ${weekend ? "text-accent" : "text-faint"}`}>{weekdayShort(day)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        aria-label="Дальше по датам"
        className="mb-1 grid size-11 shrink-0 place-items-center rounded-full bg-soft"
        onClick={() => scroller.current?.scrollBy({ left: 320, behavior: "smooth" })}
      >
        <ChevronRight className="size-5" />
      </button>
      {calendar ? (
        <div className="absolute top-14 left-0 z-20 w-72 rounded-3xl border border-line bg-bg p-4 shadow-lg">
          <MiniCalendar
            selected={value}
            onPick={(day) => {
              onChange(day);
              setCalendar(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function MiniCalendar({ selected, onPick }: { selected?: string; onPick: (day: string) => void }) {
  const today = moscowToday();
  const [year, month] = today.split("-").map(Number);
  const months = [0, 1].map((offset) => {
    const date = new Date(Date.UTC(year, month - 1 + offset, 1));
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
  });
  return (
    <div className="space-y-4">
      {months.map((item) => {
        const first = new Date(Date.UTC(item.year, item.month, 1));
        const startPad = (first.getUTCDay() + 6) % 7;
        const count = new Date(Date.UTC(item.year, item.month + 1, 0)).getUTCDate();
        const cells = [...Array(startPad).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)];
        const label = monthTitle(
          `${item.year}-${String(item.month + 1).padStart(2, "0")}-01`,
        );
        return (
          <div key={`${item.year}-${item.month}`}>
            <div className="mb-2 text-sm font-semibold">{capitalize(label)}</div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-faint">
              {["пн", "вт", "ср", "чт", "пт", "сб", "вс"].map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((day, index) => {
                if (!day) return <span key={`e-${index}`} />;
                const key = `${item.year}-${String(item.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const past = key < today;
                const weekend = isWeekend(key);
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={past}
                    onClick={() => onPick(key)}
                    className={`rounded-lg py-1 text-sm ${selected === key ? "bg-ink text-accent-fg" : weekend ? "text-accent" : "text-fg"} disabled:text-faint`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

export function EventCard({
  event,
  className = "",
  style,
}: {
  event: AfishaEvent;
  className?: string;
  style?: CSSProperties;
}) {
  const fav = useUi((state) => state.favs.includes(event.id));
  const toggle = useUi((state) => state.toggle);
  return (
    <article className={`event-card ${className}`} style={style}>
      <div className="relative">
        <Link to="/events/$id" params={{ id: event.id }} className="block overflow-hidden rounded-3xl">
          <img src={coverFor(event)} alt="" className="event-cover aspect-video w-full object-cover" />
          <span className="absolute bottom-3 left-3 rounded-full bg-bg px-3 py-1 text-xs font-medium tabular-nums shadow-sm">
            {formatPrice(event)}
          </span>
          <span className="absolute bottom-3 right-3 rounded-full bg-bg px-2.5 py-1 text-xs font-medium tabular-nums shadow-sm">
            {effectiveAge(event)}+
          </span>
        </Link>
        <button
          type="button"
          aria-label={fav ? "Убрать из избранного" : "В избранное"}
          onClick={() => toggle(event.id)}
          className="press absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-bg shadow-sm"
        >
          <Heart className={fav ? "size-5 fill-gold text-gold" : "size-5"} />
        </button>
      </div>
      <Link to="/events/$id" params={{ id: event.id }} className="mt-3 block">
        <h3 className="line-clamp-2 text-base font-medium leading-snug">{event.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm font-normal leading-relaxed text-muted">{excerpt(event, 140)}</p>
        <p className="mt-1 text-sm text-muted">{formatWhen(event.date_start)}</p>
        <p className="line-clamp-1 text-sm text-muted">{event.venue}</p>
      </Link>
    </article>
  );
}

export function Rail({
  title,
  events,
  more,
}: {
  title: string;
  events: AfishaEvent[];
  more: ListingSearch;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  if (!events.length) return null;
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">{title}</h2>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/events"
            search={more}
            className="hidden rounded-full bg-chip px-4 py-2 text-xs font-semibold tracking-wide sm:inline"
          >
            ПОКАЗАТЬ ЕЩЁ
          </Link>
          <button
            type="button"
            aria-label="Листать назад"
            className="grid size-11 place-items-center rounded-full bg-chip"
            onClick={() => scroller.current?.scrollBy({ left: -320, behavior: "smooth" })}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Листать вперёд"
            className="grid size-11 place-items-center rounded-full bg-chip"
            onClick={() => scroller.current?.scrollBy({ left: 320, behavior: "smooth" })}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
      <div ref={scroller} className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {events.map((event) => (
          <EventCard key={event.id} event={event} className="w-64 shrink-0 sm:w-72" />
        ))}
      </div>
    </section>
  );
}

export function InfoRow({
  icon,
  title,
  text,
}: {
  icon: "pin" | "date" | "ticket" | "age";
  title: string;
  text?: string;
}) {
  const Icon = icon === "pin" ? MapPin : icon === "date" ? Calendar : Ticket;
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div>
        <div className="font-semibold">{title}</div>
        {text ? <div className="text-sm text-muted">{text}</div> : null}
      </div>
    </div>
  );
}

export function pageTitle(kind: Kind, city: City): string {
  return headingFor(kind, city);
}

export function kindLead(kind: Kind): string | null {
  if (kind === "kids") return "Куда сходить с детьми: 0+ и 6+. События 12+ и старше сюда не попадают.";
  if (kind === "excursion") return "Прогулки и обзорные маршруты. Время и цена — как в каталоге.";
  return null;
}

type ChatMessage = { role: "user" | "assistant"; content: string; events?: AskCard[] };

const PROMPTS = [
  "Сыну 8 лет, куда сходить?",
  "Что сегодня в Уфе?",
  "Спектакль до 1000 рублей",
  "Бесплатно на выходных",
];

export function Assistant() {
  const city = useUi((state) => state.city);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Спросите про дату, цену или жанр — отвечу только событиями из каталога Уфы и Стерлитамака.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, open]);

  async function send(value: string) {
    const message = value.trim();
    if (!message || pending) return;
    const history = messages
      .filter((item) => item.content && item.role)
      .slice(-4)
      .map((item) => ({ role: item.role, content: item.content }));
    setMessages((current) => [...current, { role: "user", content: message }]);
    setText("");
    setPending(true);
    try {
      const result = await askAfisha({ data: { message, city, history } });
      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.text, events: result.events },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "Не получилось спросить модель. Попробуйте ещё раз или откройте каталог." },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`press fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-accent-fg shadow-lg ${open ? "hidden" : ""}`}
      >
        <Send className="size-4" />
        Спросить
      </button>
      {open ? (
        <section className="chat-pop fixed right-3 bottom-3 z-40 flex h-[32rem] max-h-[80vh] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border border-line bg-bg shadow-2xl">
          <header className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <div className="font-medium">Спросить афишу</div>
              <div className="text-xs text-muted">Каталог {city} · тот же ответ, что у бота</div>
            </div>
            <button type="button" aria-label="Закрыть" className="grid size-10 place-items-center" onClick={() => setOpen(false)}>
              <X className="size-5" />
            </button>
          </header>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === "user" ? "text-right" : ""}>
                <div
                  className={`inline-block max-w-[95%] rounded-2xl px-3 py-2 text-left text-sm whitespace-pre-wrap ${message.role === "user" ? "bg-ink text-accent-fg" : "bg-soft"}`}
                >
                  {message.content}
                </div>
                {message.events?.length ? (
                  <ul className="mt-2 space-y-2 text-left">
                    {message.events.map((event) => (
                      <li key={event.id}>
                        <Link
                          to="/events/$id"
                          params={{ id: event.id }}
                          className="flex gap-2 rounded-2xl bg-soft p-2"
                          onClick={() => setOpen(false)}
                        >
                          <img src={event.cover} alt="" className="size-14 rounded-xl object-cover" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{event.title}</span>
                            <span className="mt-0.5 block line-clamp-2 text-xs font-normal leading-relaxed text-muted">{event.blurb}</span>
                            <span className="block text-xs text-faint">
                              {event.when} · {event.price}
                            </span>
                            <span className="block truncate text-xs text-muted">{event.venue}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
            {pending ? <p className="text-sm text-muted">Ищу в каталоге…</p> : null}
            <div ref={endRef} />
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 pb-2">
            {PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="shrink-0 rounded-full bg-chip px-3 py-1.5 text-xs"
                onClick={() => void send(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
          <form
            className="flex items-center gap-2 border-t border-line p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void send(text);
            }}
          >
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Например, опера на выходных"
              className="min-w-0 flex-1 rounded-full bg-soft px-4 py-2.5 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={pending || !text.trim()}
              className="grid size-11 place-items-center rounded-full bg-accent text-accent-fg disabled:opacity-40"
              aria-label="Отправить"
            >
              <Send className="size-4" />
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}

export function detailFacts(event: AfishaEvent) {
  return {
    when: formatDayLong(event.date_start.slice(0, 10)) + (event.date_start.slice(11, 16) !== "00:00" ? `, ${event.date_start.slice(11, 16)}` : ""),
    price: formatPrice(event),
    age: ageLabel(event),
    label: kindLabel(event.category === "other" ? "all" : event.category),
  };
}
