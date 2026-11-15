import raw from "../data/events.json" with { type: "json" };
import coverOverrides from "../data/cover-overrides.json" with { type: "json" };

export type Category = "concert" | "performance" | "exhibition" | "excursion" | "other";

export type Kind = "all" | Category | "standup" | "kids" | "quiz";

export type SortKey = "date" | "price" | "price-desc";

export type AfishaEvent = {
  id: string;
  title: string;
  category: Category;
  tags: string[];
  date_start: string;
  date_end: string;
  city: string;
  venue: string;
  address: string;
  description: string;
  price_min: number | null;
  price_max: number | null;
  is_free: boolean;
  age_limit: number;
  source_url: string;
};

export type Filters = {
  city?: string;
  kind?: Kind;
  q?: string;
  from?: string;
  to?: string;
  free?: boolean;
  priceMax?: number;
  sort?: SortKey;
  /** Child's age: keep events whose rating is this age or younger (8 → 0+, 6+, 8+, not 12+). */
  ageMax?: number;
};

const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const MONTHS_NOM = [
  "январь",
  "февраль",
  "март",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь",
];

const WEEKDAYS = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
const WEEKDAYS_SHORT = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

export const CITIES = ["Уфа", "Стерлитамак"] as const;
export type City = (typeof CITIES)[number];

export const NAV: { kind: Kind; label: string }[] = [
  { kind: "all", label: "Все события" },
  { kind: "concert", label: "Концерты" },
  { kind: "performance", label: "Спектакли" },
  { kind: "exhibition", label: "Выставки" },
  { kind: "excursion", label: "Экскурсии" },
  { kind: "standup", label: "Стендап" },
  { kind: "kids", label: "Детям" },
];

const events = (raw as AfishaEvent[]).slice().sort((a, b) => a.date_start.localeCompare(b.date_start));

export function allEvents(): AfishaEvent[] {
  return events;
}

export function getEvent(id: string): AfishaEvent | undefined {
  return events.find((event) => event.id === id);
}

export function moscowToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow" }).format(new Date());
}

export function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export function addDays(key: string, amount: number): string {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function weekdayIndex(key: string): number {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function isWeekend(key: string): boolean {
  const day = weekdayIndex(key);
  return day === 0 || day === 6;
}

export function monthTitle(key: string): string {
  return MONTHS_NOM[Number(key.slice(5, 7)) - 1] ?? "";
}

export function dayNumber(key: string): string {
  return String(Number(key.slice(8, 10)));
}

export function weekdayShort(key: string): string {
  return WEEKDAYS_SHORT[weekdayIndex(key)];
}

export function formatWhen(iso: string): string {
  const key = dayKey(iso);
  const day = Number(key.slice(8, 10));
  const month = MONTHS[Number(key.slice(5, 7)) - 1];
  const time = iso.slice(11, 16);
  const clock = time && time !== "00:00" ? `, ${time}` : "";
  return `${day} ${month}${clock}`;
}

export function formatDayLong(key: string): string {
  const day = Number(key.slice(8, 10));
  const month = MONTHS[Number(key.slice(5, 7)) - 1];
  return `${day} ${month}, ${WEEKDAYS[weekdayIndex(key)]}`;
}

export function formatPrice(event: AfishaEvent): string {
  if (event.is_free || event.price_min === 0) return "бесплатно";
  const min = event.price_min;
  const max = event.price_max;
  if (min == null && max == null) return "цену уточняйте";
  const fmt = (value: number) => new Intl.NumberFormat("ru-RU").format(value);
  if (min != null && max != null && max > min) return `${fmt(min)} – ${fmt(max)} ₽`;
  const value = min ?? max ?? 0;
  return `от ${fmt(value)} ₽`;
}

export function effectiveAge(event: AfishaEvent): number {
  let age = Number.isFinite(event.age_limit) ? event.age_limit : 18;
  for (const tag of event.tags ?? []) {
    const match = /^(\d{1,2})\+$/.exec(String(tag).trim());
    if (match) age = Math.min(age, Number(match[1]));
  }
  return age;
}

export function ageLabel(event: AfishaEvent): string {
  return `${effectiveAge(event)}+`;
}

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 33 + value.charCodeAt(index)) >>> 0;
  }
  return result;
}

const POOLS: Record<string, string[]> = {
  concert: ["concert1", "concert2", "concert3", "concert4", "guitar", "guitar2", "mic", "rock", "crowd", "jazz", "jazz2", "piano", "spotlight", "folk"],
  performance: ["drama", "stage1", "stage2", "stage3", "actors", "opera", "comedy", "ballet"],
  exhibition: ["museum", "gallery", "gallery2"],
  excursion: ["walk", "citywalk"],
  standup: ["comedy", "mic", "spotlight", "folk"],
  quiz: ["quiz", "talk", "spotlight"],
  kids: ["kids", "puppets", "ballet", "gift"],
  opera: ["opera", "classic", "drama", "ballet"],
  other: ["talk", "quiz", "stage3", "spotlight", "comedy", "gallery"],
};

const KEYWORD_COVERS: [RegExp, string[]][] = [
  [/стендап|stand-?up|комик/, ["comedy", "mic", "spotlight", "folk"]],
  [/квиз/, ["quiz", "talk", "spotlight"]],
  [/опер|травиат|тоска|кармен|богем/, ["opera", "classic", "drama"]],
  [/балет|лебедин|щелкун|жизел|дон\s*кихот/, ["ballet", "dance", "opera"]],
  [/джаз|jazz|саксофон/, ["jazz", "jazz2", "piano"]],
  [/рок|rock|метал|рэп|хип-?хоп|панк/, ["rock", "crowd", "guitar", "guitar2"]],
  [/хор|казач|фольк|народн/, ["choir", "classic", "folk"]],
  [/скрипк|оркестр|филармон|симфон/, ["orchestra", "violin", "violin2", "classic", "strings", "piano"]],
  [/роял|фортепиан|piano/, ["piano", "classic", "violin2"]],
  [/цирк|иллюзион/, ["stage3", "spotlight", "gift", "opera"]],
  [/кукол|сказк|мульт/, ["puppets", "kids", "ballet"]],
  [/выставк|музей|икон|картин|галере/, ["museum", "gallery", "gallery2"]],
  [/экскурс|прогулк|обзорн/, ["walk", "citywalk"]],
  [/танц|dance|брейк/, ["dance", "ballet", "stage3"]],
  [/лекц|поэз|литерат|разговор/, ["talk", "gallery", "quiz"]],
];

export function coverFor(event: AfishaEvent): string {
  const custom = (coverOverrides as Record<string, string>)[event.id];
  if (custom && custom.startsWith("/")) return custom;
  const title = `${event.title} ${event.venue}`.toLowerCase().replace(/ё/g, "е");
  for (const [pattern, pool] of KEYWORD_COVERS) {
    if (pattern.test(title)) return `/covers/${pool[hash(event.id) % pool.length]}.jpg`;
  }
  let key: string = event.category;
  if (effectiveAge(event) <= 6 && event.category === "performance") key = "kids";
  const pool = POOLS[key] ?? POOLS.other;
  return `/covers/${pool[hash(event.id) % pool.length]}.jpg`;
}

export type ListingSearch = {
  kind?: Kind;
  sort?: SortKey;
  free?: boolean;
  date?: string;
  q?: string;
  when?: "weekend" | "week";
  ageMax?: number;
};

export function listingSearch(patch: Partial<ListingSearch> = {}): ListingSearch {
  return {
    kind: patch.kind ?? "all",
    sort: patch.sort ?? "date",
    free: patch.free ?? false,
    ...(patch.date ? { date: patch.date } : {}),
    ...(patch.q ? { q: patch.q } : {}),
    ...(patch.when ? { when: patch.when } : {}),
    ...(patch.ageMax != null ? { ageMax: patch.ageMax } : {}),
  };
}

export function kindLabel(kind: Kind): string {
  return NAV.find((item) => item.kind === kind)?.label ?? "События";
}

export function headingFor(kind: Kind, city: string): string {
  if (kind === "all") return `Афиша ${city === "Уфа" ? "Уфы" : "Стерлитамака"}`;
  if (kind === "concert") return `Концерты в ${city === "Уфа" ? "Уфе" : "Стерлитамаке"}`;
  if (kind === "performance") return `Спектакли в ${city === "Уфа" ? "Уфе" : "Стерлитамаке"}`;
  if (kind === "exhibition") return `Выставки в ${city === "Уфа" ? "Уфе" : "Стерлитамаке"}`;
  if (kind === "excursion") return `Экскурсии в ${city === "Уфа" ? "Уфе" : "Стерлитамаке"}`;
  if (kind === "standup") return `Стендап в ${city === "Уфа" ? "Уфе" : "Стерлитамаке"}`;
  if (kind === "kids") return `Афиша для детей в ${city === "Уфа" ? "Уфе" : "Стерлитамаке"}`;
  if (kind === "quiz") return `Квизы в ${city === "Уфа" ? "Уфе" : "Стерлитамаке"}`;
  return `События в ${city}`;
}

function matchesKind(event: AfishaEvent, kind: Kind | undefined, ageMax?: number): boolean {
  if (!kind || kind === "all") return true;
  const title = event.title.toLowerCase();
  if (kind === "standup") return /стендап|stand-?up/i.test(event.title);
  if (kind === "quiz") return title.includes("квиз");
  if (kind === "kids") {
    if (ageMax != null) return effectiveAge(event) <= ageMax;
    return effectiveAge(event) <= 6 || (event.tags ?? []).includes("дети");
  }
  return event.category === kind;
}

function span(event: AfishaEvent): [string, string] {
  return [dayKey(event.date_start), dayKey(event.date_end || event.date_start)];
}

function isOngoing(event: AfishaEvent): boolean {
  const [start, end] = span(event);
  return addDays(start, 2) < end;
}

function overlaps(event: AfishaEvent, from: string, to: string): boolean {
  const [start, end] = span(event);
  return start <= to && end >= from;
}

function escapeReg(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasToken(hay: string, token: string): boolean {
  const word = new RegExp(`(?:^|[^a-zа-яё0-9])${escapeReg(token)}(?![a-zа-яё0-9])`, "i");
  if (word.test(hay)) return true;
  const stem = token.replace(/(ами|ями|ого|ему|ому|ыми|ими|ов|ев|ом|ем|ой|ий|ый|ая|ое|ее|ые|ие|ую|юю|а|я|ы|и|у|е|о)$/i, "");
  if (stem.length < 4 || stem === token) return false;
  const stemmed = new RegExp(`(?:^|[^a-zа-яё0-9])${escapeReg(stem)}[а-яё]{1,3}(?![а-яё])`, "i");
  return stemmed.test(hay);
}

function compactText(value: string): string {
  return value.toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я0-9]+/gi, "");
}

function looseTokens(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/(\d)([a-zа-я])/gi, "$1 $2")
    .replace(/([a-zа-я])(\d)/gi, "$1 $2")
    .split(/[^a-zа-я0-9+]+/i)
    .filter((token) => token.length > 1);
}

function scoreQuery(event: AfishaEvent, query: string): number {
  const tokens = looseTokens(query);
  const title = event.title.toLowerCase().replace(/ё/g, "е");
  const venue = `${event.venue} ${event.city}`.toLowerCase().replace(/ё/g, "е");
  const blob = `${title} ${venue} ${event.description}`.toLowerCase().replace(/ё/g, "е");
  const compactQuery = compactText(query);
  const compactTitle = compactText(title);
  const compactVenue = compactText(venue);
  const compactBlob = compactText(blob);

  let bonus = 0;
  const gluedQuery = /\d/.test(compactQuery) && compactQuery.length >= 2;
  if (gluedQuery) {
    if (compactTitle.includes(compactQuery)) bonus = 16;
    else if (compactVenue.includes(compactQuery)) bonus = 10;
    else if (compactBlob.includes(compactQuery)) bonus = 6;
    else return 0;
  } else if (compactQuery.length >= 4) {
    if (compactTitle.includes(compactQuery)) bonus = 8;
    else if (compactVenue.includes(compactQuery)) bonus = 4;
  }

  if (!tokens.length) return bonus || 1;
  let score = bonus;
  let hits = 0;
  for (const token of tokens) {
    if (hasToken(title, token)) {
      score += 6;
      hits += 1;
    } else if (hasToken(venue, token)) {
      score += 3;
      hits += 1;
    } else if (hasToken(blob, token)) {
      score += 1;
      hits += 1;
    }
  }
  if (gluedQuery && bonus) return score || bonus;
  if (!hits && !bonus) return 0;
  if (!bonus && tokens.length >= 3 && hits === 1) return 0;
  return score;
}

function childAffinity(event: AfishaEvent): number {
  const blob = `${event.title} ${event.description}`.toLowerCase().replace(/ё/g, "е");
  let score = 0;
  if ((event.tags ?? []).includes("дети")) score += 8;
  if (/сказк|кукол|мульт|малыш|цирк|елк|зоопарк|игров|детск|ребен/.test(blob)) score += 5;
  if (event.category === "performance" && effectiveAge(event) <= 6) score += 4;
  if (event.category === "exhibition" && effectiveAge(event) <= 6) score += 1;
  if (/квиз|стендап|эстрад|рэп|рок|stand-?up/.test(blob) && !/дет|сказк|мульт/.test(blob)) score -= 4;
  return score;
}

function priceValue(event: AfishaEvent): number | null {
  if (event.is_free) return 0;
  return event.price_min ?? event.price_max;
}

function venueWords(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/gi, " ")
    .split(" ")
    .filter((token) => token.length > 3);
}

function venuesAlike(left: string, right: string): boolean {
  const a = venueWords(left);
  const b = venueWords(right);
  if (!a.length || !b.length) return true;
  const set = new Set(a);
  const shared = b.filter((token) => set.has(token)).length;
  if (shared >= 2) return true;
  const ca = compactText(left);
  const cb = compactText(right);
  return Boolean(ca && cb && (ca.includes(cb) || cb.includes(ca)));
}

function sameShow(left: AfishaEvent, right: AfishaEvent): boolean {
  if (left.city !== right.city) return false;
  if (compactText(left.title) !== compactText(right.title)) return false;
  if (left.date_start.slice(0, 16) !== right.date_start.slice(0, 16)) return false;
  return venuesAlike(left.venue, right.venue);
}

export function dedupeEvents(list: AfishaEvent[]): AfishaEvent[] {
  const kept: AfishaEvent[] = [];
  for (const event of list) {
    const index = kept.findIndex((item) => sameShow(item, event));
    if (index === -1) {
      kept.push(event);
      continue;
    }
    const prev = kept[index];
    const richness = (item: AfishaEvent) =>
      (item.description?.trim().length ?? 0) * 2 + (item.venue?.length ?? 0) + (item.source_url ? 30 : 0);
    if (richness(event) > richness(prev)) kept[index] = event;
  }
  return kept;
}

export function searchEvents(filters: Filters): AfishaEvent[] {
  const today = moscowToday();
  const from = filters.from ?? today;
  const to = filters.to ?? addDays(today, 120);
  const query = (filters.q ?? "").trim();

  const found = events.filter((event) => {
    if (filters.city && event.city !== filters.city) return false;
    if (!matchesKind(event, filters.kind, filters.ageMax)) return false;
    if (filters.ageMax != null && effectiveAge(event) > filters.ageMax) return false;
    if (filters.free && !(event.is_free || event.price_min === 0)) return false;
    if (filters.priceMax != null) {
      const price = priceValue(event);
      if (price == null || price > filters.priceMax) return false;
    }
    if (!overlaps(event, from, to)) return false;
    if (query && scoreQuery(event, query) === 0) return false;
    return true;
  });

  const sort = filters.sort ?? (query ? "date" : "date");
  found.sort((left, right) => {
    if ((filters.ageMax != null && filters.ageMax <= 12) || filters.kind === "kids") {
      const affinity = childAffinity(right) - childAffinity(left);
      if (affinity) return affinity;
    }
    if (query) {
      const delta = scoreQuery(right, query) - scoreQuery(left, query);
      if (delta) return delta;
    }
    if (sort === "price" || sort === "price-desc") {
      const lp = priceValue(left);
      const rp = priceValue(right);
      if (lp == null && rp == null) return left.date_start.localeCompare(right.date_start);
      if (lp == null) return 1;
      if (rp == null) return -1;
      const delta = sort === "price" ? lp - rp : rp - lp;
      if (delta) return delta;
    }
    const leftStarts = dayKey(left.date_start) >= from && dayKey(left.date_start) <= to ? 0 : 1;
    const rightStarts = dayKey(right.date_start) >= from && dayKey(right.date_start) <= to ? 0 : 1;
    if (leftStarts !== rightStarts) return leftStarts - rightStarts;
    if (isOngoing(left) !== isOngoing(right)) return isOngoing(left) ? 1 : -1;
    return left.date_start.localeCompare(right.date_start);
  });
  return dedupeEvents(found);
}

export function weekendRange(today = moscowToday()): [string, string] {
  const day = weekdayIndex(today);
  if (day === 6) return [today, addDays(today, 1)];
  if (day === 0) return [today, today];
  const saturday = addDays(today, 6 - day);
  return [saturday, addDays(saturday, 1)];
}

function extractChildAge(source: string): number | null {
  const numeric = source.match(/(?:^|[^\d])(\d{1,2})\s*[-–—]?\s*(?:лет|года|год)[а-я]*/);
  if (numeric) {
    const age = Number(numeric[1]);
    if (age >= 0 && age <= 17) return age;
  }
  const words: [RegExp, number][] = [
    [/одиннадцатилет|одиннадцати лет/, 11],
    [/двенадцатилет|двенадцати лет/, 12],
    [/десятилет|десяти лет/, 10],
    [/девятилет|девяти лет/, 9],
    [/восьмилет|восьми лет/, 8],
    [/семилет|семи лет/, 7],
    [/шестилет|шести лет/, 6],
    [/пятилет|пяти лет/, 5],
    [/четырехлет|четырех лет/, 4],
    [/трехлет|трех лет/, 3],
    [/двухлет|двух лет/, 2],
    [/одного года|одному году|годовал/, 1],
  ];
  for (const [pattern, age] of words) {
    if (pattern.test(source)) return age;
  }
  const beside = source.match(/(?:мальчик\w*|девочк\w*|сын\w*|дочер\w*|дочк\w*|ребен\w*)\D{0,6}(\d{1,2})(?!\d)/);
  if (beside) {
    const age = Number(beside[1]);
    if (age >= 1 && age <= 17) return age;
  }
  return null;
}

const MONTH_INDEX: Record<string, number> = {
  января: 1,
  февраля: 2,
  марта: 3,
  апреля: 4,
  мая: 5,
  июня: 6,
  июля: 7,
  августа: 8,
  сентября: 9,
  октября: 10,
  ноября: 11,
  декабря: 12,
};

export function interpret(text: string, city: string): Filters {
  const today = moscowToday();
  let source = text.toLowerCase().replace(/ё/g, "е");
  const filters: Filters = { city, kind: "all", from: today, to: addDays(today, 45) };

  if (source.includes("стерлитамак")) filters.city = "Стерлитамак";
  else if (/(^|[^а-я])уф/.test(source)) filters.city = "Уфа";

  if (source.includes("стендап") || source.includes("standup") || source.includes("stand-up")) {
    filters.kind = "standup";
  } else if (source.includes("квиз")) filters.kind = "quiz";
  else if (/экскурс/.test(source)) filters.kind = "excursion";
  else if (/выставк/.test(source)) filters.kind = "exhibition";
  else if (/спектак|театр|опер|балет/.test(source)) filters.kind = "performance";
  else if (/концерт/.test(source)) filters.kind = "concert";
  else if (/дет|ребен|малыш|мальчик|девочк|сыно|дочк|дочер|дошкол|школьник|годовал/.test(source)) {
    filters.kind = "kids";
  }

  const childAge = extractChildAge(source);
  if (childAge != null) {
    filters.ageMax = childAge;
    if (!filters.kind || filters.kind === "all") filters.kind = "kids";
  }

  if (/бесплат|вход свобод/.test(source)) filters.free = true;
  if (/недорог/.test(source)) filters.priceMax = 1000;
  const price = source.match(/до\s*(\d{2,6})(?!\s*[-–—]?\s*(?:лет|год))/);
  if (price) filters.priceMax = Number(price[1]);

  if (source.includes("послезавтра")) {
    const day = addDays(today, 2);
    filters.from = day;
    filters.to = day;
  } else if (source.includes("завтра")) {
    const day = addDays(today, 1);
    filters.from = day;
    filters.to = day;
  } else if (source.includes("сегодня")) {
    filters.from = today;
    filters.to = today;
  } else if (source.includes("выходн")) {
    const [from, to] = weekendRange(today);
    filters.from = from;
    filters.to = to;
  } else if (source.includes("недел")) {
    filters.from = today;
    filters.to = addDays(today, 6);
  }

  const named = source.match(/(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/);
  const numeric = source.match(/(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?/);
  if (named) {
    const year = today.slice(0, 4);
    const month = String(MONTH_INDEX[named[2]]).padStart(2, "0");
    const day = named[1].padStart(2, "0");
    const key = `${year}-${month}-${day}`;
    filters.from = key;
    filters.to = key;
  } else if (numeric) {
    const year = numeric[3]
      ? numeric[3].length === 2
        ? `20${numeric[3]}`
        : numeric[3]
      : today.slice(0, 4);
    const key = `${year}-${numeric[2].padStart(2, "0")}-${numeric[1].padStart(2, "0")}`;
    filters.from = key;
    filters.to = key;
  }

  source = source
    .replace(/стерлитамак[а-я]*|уф[аеуы][а-я]*/g, " ")
    .replace(/сегодня|завтра|послезавтра|выходн[а-я]*|недел[а-я]*/g, " ")
    .replace(/концерт[а-я]*|спектак[а-я]*|театр[а-я]*|выставк[а-я]*|экскурс[а-я]*|стендап[а-я]*|квиз[а-я]*|бесплат[а-я]*|недорог[а-я]*/g, " ")
    .replace(/дет[а-я]*|ребен[а-я]*|малыш[а-я]*|мальчик[а-я]*|девочк[а-я]*|сын[а-я]*|дочк[а-я]*|дочер[а-я]*|школьник[а-я]*|дошкол[а-я]*/g, " ")
    .replace(/\d{1,2}\s*[-–—]?\s*(?:лет|года|год)[а-я]*/g, " ")
    .replace(/восьмилет[а-я]*|семилет[а-я]*|шестилет[а-я]*|пятилет[а-я]*|четырехлет[а-я]*|трехлет[а-я]*|двухлет[а-я]*|девятилет[а-я]*|десятилет[а-я]*|одиннадцатилет[а-я]*|двенадцатилет[а-я]*|годовал[а-я]*/g, " ")
    .replace(/событи[а-я]*|мероприят[а-я]*|подходящ[а-я]*|возраст[а-я]*/g, " ")
    .replace(/до\s*\d{2,6}/g, " ")
    .replace(/\d{1,2}\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/g, " ")
    .replace(/\d{1,2}[./]\d{1,2}(?:[./]\d{2,4})?/g, " ");

  const stop = new Set([
    "в",
    "во",
    "на",
    "по",
    "и",
    "или",
    "что",
    "какие",
    "какой",
    "какая",
    "где",
    "мне",
    "хочу",
    "хочется",
    "билеты",
    "билет",
    "афиша",
    "пожалуйста",
    "есть",
    "ли",
    "с",
    "со",
    "к",
    "ко",
    "для",
    "про",
    "это",
    "можно",
    "сходить",
    "пойти",
    "посмотреть",
    "подскажи",
    "скажи",
    "найди",
    "покажи",
    "вечером",
    "утром",
    "днем",
    "ночью",
    "город",
    "городе",
    "куда",
    "рублей",
    "руб",
    "цена",
    "лет",
    "года",
    "год",
    "летнего",
    "летний",
    "мальчика",
    "мальчик",
    "девочки",
    "сына",
    "дочки",
    "событие",
    "найти",
    "подбери",
    "сходить",
    "сходим",
    "пойти",
    "семье",
    "семьей",
    "ребенка",
    "ребёнка",
  ]);
  const query = source
    .replace(/(\d)\s+(?=[a-zа-я])/gi, "$1")
    .split(/[^a-zа-я0-9+]+/i)
    .filter((token) => token.length > 1 && !stop.has(token))
    .join(" ");
  if (query) filters.q = query;
  return filters;
}

export function similarEvents(event: AfishaEvent, limit = 4): AfishaEvent[] {
  return searchEvents({
    city: event.city,
    kind: event.category,
    from: dayKey(event.date_start),
    to: addDays(moscowToday(), 90),
  })
    .filter((item) => item.id !== event.id)
    .slice(0, limit);
}

export function daysFrom(start: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => addDays(start, index));
}

export function pluralRu(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

const KIND_NOUN: Record<string, string> = {
  concert: "Концерт",
  performance: "Спектакль",
  exhibition: "Выставка",
  excursion: "Экскурсия",
  other: "Событие",
};

export function describeEvent(event: AfishaEvent): string {
  const raw = (event.description || "").replace(/\s+/g, " ").trim();
  if (raw.length >= 40) return raw;
  const kind = KIND_NOUN[event.category] ?? "Событие";
  const place = event.venue || event.city;
  const where = event.address ? `${place}, ${event.address}` : place;
  return `${kind} «${event.title}» — ${formatWhen(event.date_start)}, ${where}. ${formatPrice(event)}, ${ageLabel(event)}.`;
}

export function excerpt(event: AfishaEvent, limit = 160): string {
  const text = describeEvent(event);
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit - 1);
  const last = cut.lastIndexOf(" ");
  return `${(last > 70 ? cut.slice(0, last) : cut).trim()}…`;
}

function foundNoun(filters: Filters, count: number): string {
  if (filters.kind === "performance") return pluralRu(count, "спектакль", "спектакля", "спектаклей");
  if (filters.kind === "concert") return pluralRu(count, "концерт", "концерта", "концертов");
  if (filters.kind === "exhibition") return pluralRu(count, "выставку", "выставки", "выставок");
  if (filters.kind === "excursion") return pluralRu(count, "экскурсию", "экскурсии", "экскурсий");
  if (filters.kind === "standup") return pluralRu(count, "стендап", "стендапа", "стендапов");
  if (filters.kind === "quiz") return pluralRu(count, "квиз", "квиза", "квизов");
  if (filters.kind === "kids") return pluralRu(count, "событие для детей", "события для детей", "событий для детей");
  return pluralRu(count, "событие", "события", "событий");
}

export function localAnswer(filters: Filters, found: AfishaEvent[]): string {
  if (!found.length) {
    const query = filters.q ? ` по запросу «${filters.q}»` : "";
    return `Ничего не нашлось${query}. Напишите название иначе или смените дату — пробел между цифрой и словом не обязателен.`;
  }
  const city = filters.city === "Уфа" ? " в Уфе" : filters.city === "Стерлитамак" ? " в Стерлитамаке" : "";
  const when = filters.from && filters.from === filters.to ? ` на ${formatDayLong(filters.from)}` : "";
  const lead = `Нашёл ${found.length} ${foundNoun(filters, found.length)}${when}${city}.`;
  const ageNote =
    filters.ageMax != null ? `\nТолько то, куда можно с ${filters.ageMax} лет: старше этого ограничения не показываю.` : "";
  const lines = found.slice(0, 4).map((event) => {
    return [
      event.title,
      `${formatWhen(event.date_start)} · ${event.venue || event.city}`,
      `${formatPrice(event)} · ${ageLabel(event)}`,
      excerpt(event, 180),
    ].join("\n");
  });
  const more = found.length > 4 ? `\n\nЕщё ${found.length - 4} — в карточках ниже.` : "";
  return `${lead}${ageNote}\n\n${lines.join("\n\n")}${more}`;
}
