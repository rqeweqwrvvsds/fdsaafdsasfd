import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return;
  const contents = readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    if (process.env[key] !== undefined) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }
    process.env[key] = value;
  }
}

loadDotEnv(join(process.cwd(), ".env"));
import {
  addDays,
  effectiveAge,
  formatDayLong,
  formatPrice,
  formatWhen,
  getEvent,
  interpret,
  moscowToday,
  pluralRu,
  searchEvents,
  weekendRange,
} from "../src/lib/catalog.ts";

const fileConfig = JSON.parse(readFileSync(join(process.cwd(), "scripts/runtime-config.json"), "utf8"));
const config = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN || fileConfig.telegramToken || "",
  llmBaseUrl: process.env.LLM_BASE_URL || fileConfig.llmBaseUrl || "",
  llmApiKey: process.env.LLM_API_KEY || fileConfig.llmApiKey || "",
  llmModel: process.env.LLM_MODEL || fileConfig.llmModel || "gpt-4o-mini",
};
const token = config.telegramToken.trim();
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is missing. Set it in the bot service environment.");
  process.exit(1);
}
const api = `https://api.telegram.org/bot${token}`;

const sessions = new Map();

function session(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, { city: "Уфа", filters: null, page: 0, panelMessageId: null, stickerSent: false });
  }
  return sessions.get(chatId);
}

async function call(method, body) {
  const response = await fetch(`${api}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(method === "getUpdates" ? 40000 : 20000),
  });
  const data = await response.json();
  if (!data.ok) {
    const error = new Error(data.description || method);
    error.code = data.error_code;
    throw error;
  }
  return data.result;
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mood(event) {
  const title = event.title.toLowerCase();
  if (/стендап|stand-?up/.test(title)) return "🎤";
  if (title.includes("квиз")) return "❓";
  if (event.category === "concert") return "🎵";
  if (event.category === "performance") return "🎭";
  if (event.category === "exhibition") return "🖼";
  if (event.category === "excursion") return "🚶";
  if (effectiveAge(event) <= 6) return "🧸";
  return "🎫";
}

function menuMarkup(city) {
  return {
    inline_keyboard: [
      [
        { text: "📅 Сегодня", callback_data: "w:today" },
        { text: "🌅 Завтра", callback_data: "w:tomorrow" },
      ],
      [
        { text: "🎉 Выходные", callback_data: "w:weekend" },
        { text: "🧸 Детям", callback_data: "k:kids" },
      ],
      [
        { text: "🎁 Бесплатно", callback_data: "k:free" },
        { text: "🎭 Жанры", callback_data: "more" },
      ],
      [{ text: city === "Уфа" ? "📍 Уфа · сменить" : "📍 Стерлитамак · сменить", callback_data: "c:toggle" }],
    ],
  };
}

function genresMarkup() {
  return {
    inline_keyboard: [
      [
        { text: "🎵 Концерты", callback_data: "k:concert" },
        { text: "🎭 Спектакли", callback_data: "k:performance" },
      ],
      [
        { text: "🖼 Выставки", callback_data: "k:exhibition" },
        { text: "🚶 Экскурсии", callback_data: "k:excursion" },
      ],
      [
        { text: "🎤 Стендап", callback_data: "k:standup" },
        { text: "🏠 Меню", callback_data: "m" },
      ],
    ],
  };
}

function welcome(city) {
  return [
    "🎫 <b>Афиша</b>",
    "",
    `📍 ${esc(city)}`,
    "Напиши, например: <i>сыну 8 лет</i>",
    "Покажу 0+, 6+ и 8+. Старше — спрячу.",
  ].join("\n");
}

function genresText(city) {
  return ["🎭 <b>Жанр</b>", "", `📍 ${esc(city)}`].join("\n");
}

function snippet(event) {
  const raw = String(event.description || "").replace(/\s+/g, " ").trim();
  if (raw.length < 40) return "";
  if (raw.length <= 200) return raw;
  const cut = raw.slice(0, 197);
  const last = cut.lastIndexOf(" ");
  return `${(last > 110 ? cut.slice(0, last) : cut).trim()}…`;
}

function cardText(event) {
  const about = snippet(event);
  const lines = [
    `<b>${esc(event.title)}</b>`,
    esc(event.venue || event.city),
    event.address ? esc(event.address) : "",
    `${esc(formatWhen(event.date_start))} · ${esc(formatPrice(event))} · ${effectiveAge(event)}+`,
  ].filter(Boolean);
  return about ? `${lines.join("\n")}\n\n${esc(about)}` : lines.join("\n");
}

function listText(events, total, page, filters) {
  const city = filters?.city === "Стерлитамак" ? "в Стерлитамаке" : "в Уфе";
  const noun =
    filters?.kind === "performance"
      ? pluralRu(total, "спектакль", "спектакля", "спектаклей")
      : filters?.kind === "concert"
        ? pluralRu(total, "концерт", "концерта", "концертов")
        : filters?.kind === "exhibition"
          ? pluralRu(total, "выставку", "выставки", "выставок")
          : filters?.kind === "kids"
            ? pluralRu(total, "событие для детей", "события для детей", "событий для детей")
            : pluralRu(total, "событие", "события", "событий");
  const when = filters?.from && filters.from === filters.to ? ` на ${formatDayLong(filters.from)}` : "";
  const query = filters?.q ? ` по «${esc(filters.q)}»` : "";
  const from = page * 4 + 1;
  const to = page * 4 + events.length;
  const pageNote = total > events.length ? `\n<i>${from}–${to} из ${total}</i>` : "";
  const blocks = events.map((event) => {
    const about = snippet(event);
    const lines = [
      `<b>${esc(event.title)}</b>`,
      esc(event.venue || event.city),
      `${esc(formatWhen(event.date_start))} · ${esc(formatPrice(event))} · ${effectiveAge(event)}+`,
    ];
    if (about) lines.push(esc(about));
    return lines.join("\n");
  });
  const age =
    filters?.ageMax != null ? `\n<i>Только куда можно с ${filters.ageMax} лет.</i>` : "";
  return [`<b>Нашёл ${total} ${noun}${when}${query} ${city}.</b>${age}${pageNote}`, ...blocks].join("\n\n");
}

function clipTitle(event, number) {
  const title = event.title.length > 34 ? `${event.title.slice(0, 33)}…` : event.title;
  return `${number}. ${title}`;
}

function listMarkup(events, page, total) {
  const rows = events.map((event, index) => [
    { text: clipTitle(event, page * 4 + index + 1), callback_data: `e:${event.id}` },
  ]);
  const nav = [];
  if (page > 0) nav.push({ text: "◀️", callback_data: `p:${page - 1}` });
  if ((page + 1) * 4 < total) nav.push({ text: "▶️", callback_data: `p:${page + 1}` });
  if (nav.length) rows.push(nav);
  rows.push([{ text: "🏠 Меню", callback_data: "m" }]);
  return { inline_keyboard: rows };
}

async function phrase(question, events) {
  if (!events.length || !config.llmApiKey || !config.llmBaseUrl) return null;
  try {
    const brief = events.slice(0, 6).map((event) => ({
      title: event.title,
      when: formatWhen(event.date_start),
      venue: event.venue,
      city: event.city,
      price: formatPrice(event),
      age: `${effectiveAge(event)}+`,
    }));
    const response = await fetch(`${config.llmBaseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.llmApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.llmModel,
        temperature: 0.2,
        max_tokens: 180,
        messages: [
          {
            role: "system",
            content:
              "Ты помощник афиши. Одно короткое предложение по-русски. Только события из JSON. Не предлагай возраст старше запрошенного. Без списков.",
          },
          { role: "user", content: `${question}\n${JSON.stringify(brief)}` },
        ],
      }),
      signal: AbortSignal.timeout(18000),
    });
    if (!response.ok) return null;
    const body = await response.json();
    return body.choices?.[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error("llm", error instanceof Error ? error.message : "fail");
    return null;
  }
}

async function showPanel(chatId, state, text, markup) {
  let bodyText = text.length > 3900 ? `${text.slice(0, 3890)}…` : text;
  const payload = {
    chat_id: chatId,
    text: bodyText,
    parse_mode: "HTML",
    reply_markup: markup,
    disable_web_page_preview: true,
  };
  if (state.panelMessageId) {
    try {
      await call("editMessageText", { ...payload, message_id: state.panelMessageId });
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("message is not modified")) return;
      state.panelMessageId = null;
    }
  }
  const sent = await call("sendMessage", payload);
  state.panelMessageId = sent.message_id;
}

function resolve(filters) {
  const found = filters ? searchEvents(filters) : [];
  return { filters, found };
}

async function showList(chatId, state) {
  const resolved = resolve(state.filters);
  state.filters = resolved.filters;
  const found = resolved.found;
  const page = state.page || 0;
  const slice = found.slice(page * 4, page * 4 + 4);
  if (!slice.length) {
    const q = state.filters?.q;
    const text = q
      ? `По «${esc(q)}» пусто.\nПробел в названии не обязателен. Напиши иначе или выбери дату.`
      : "По этим условиям пусто. Смени дату или город.";
    await showPanel(chatId, state, text, menuMarkup(state.city));
    return;
  }
  await showPanel(chatId, state, listText(slice, found.length, page, state.filters), listMarkup(slice, page, found.length));
}

function preset(code, city) {
  const today = moscowToday();
  const filters = { city, kind: "all", from: today, to: addDays(today, 60) };
  if (code === "today") filters.to = today;
  if (code === "tomorrow") {
    const day = addDays(today, 1);
    filters.from = day;
    filters.to = day;
  }
  if (code === "weekend") {
    const [from, to] = weekendRange(today);
    filters.from = from;
    filters.to = to;
  }
  if (code === "concert") filters.kind = "concert";
  if (code === "performance") filters.kind = "performance";
  if (code === "exhibition") filters.kind = "exhibition";
  if (code === "excursion") filters.kind = "excursion";
  if (code === "kids") filters.kind = "kids";
  if (code === "standup") filters.kind = "standup";
  if (code === "free") filters.free = true;
  return filters;
}

async function sendLogo(chatId) {
  try {
    const file = join(process.cwd(), "public/sticker-logo.webp");
    if (!existsSync(file)) return;
    const bytes = readFileSync(file);
    const form = new FormData();
    form.set("chat_id", String(chatId));
    form.set("sticker", new Blob([bytes], { type: "image/webp" }), "logo.webp");
    const response = await fetch(`${api}/sendSticker`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(20000),
    });
    const data = await response.json();
    if (!data.ok) console.error("sticker", data.description || "fail");
  } catch (error) {
    console.error("sticker", error instanceof Error ? error.message : "fail");
  }
}

async function onCallback(query) {
  const chatId = query.message?.chat?.id;
  const data = query.data || "";
  if (!chatId) return;
  await call("answerCallbackQuery", { callback_query_id: query.id }).catch(() => {});
  const state = session(chatId);
  if (query.message?.message_id) state.panelMessageId = query.message.message_id;
  if (data === "m") {
    await showPanel(chatId, state, welcome(state.city), menuMarkup(state.city));
    return;
  }
  if (data === "more") {
    await showPanel(chatId, state, genresText(state.city), genresMarkup());
    return;
  }
  if (data === "c:toggle" || data.startsWith("c:")) {
    state.city = data === "c:toggle" ? (state.city === "Уфа" ? "Стерлитамак" : "Уфа") : data.slice(2);
    await showPanel(chatId, state, welcome(state.city), menuMarkup(state.city));
    return;
  }
  if (data === "back") {
    await showList(chatId, state);
    return;
  }
  if (data.startsWith("e:")) {
    const event = getEvent(data.slice(2));
    if (!event) {
      await showPanel(chatId, state, "🎫 Карточка не найдена.", menuMarkup(state.city));
      return;
    }
    const rows = [];
    if (event.source_url) rows.push([{ text: "🎟️ Купить билет", url: event.source_url }]);
    rows.push([
      { text: "◀️ К списку", callback_data: "back" },
      { text: "🏠 Меню", callback_data: "m" },
    ]);
    await showPanel(chatId, state, cardText(event), { inline_keyboard: rows });
    return;
  }
  if (data.startsWith("p:")) {
    state.page = Number(data.slice(2)) || 0;
    await showList(chatId, state);
    return;
  }
  if (data.startsWith("w:") || data.startsWith("k:")) {
    state.filters = preset(data.slice(2), state.city);
    state.page = 0;
    await showList(chatId, state);
  }
}

async function onMessage(message) {
  const chatId = message.chat?.id;
  const text = (message.text || "").trim();
  if (!chatId || !text) return;
  const state = session(chatId);
  if (text === "/start" || text === "/help" || text === "/cancel") {
    if (!state.stickerSent) {
      state.stickerSent = true;
      await sendLogo(chatId);
    }
    await showPanel(chatId, state, welcome(state.city), menuMarkup(state.city));
    return;
  }
  await call("deleteMessage", { chat_id: chatId, message_id: message.message_id }).catch(() => {});
  let filters = interpret(text, state.city);
  if (filters.city) state.city = filters.city;
  state.filters = filters;
  state.page = 0;
  state.panelMessageId = null;
  await showList(chatId, state);
}

async function main() {
  await call("deleteWebhook", { drop_pending_updates: false });
  const me = await call("getMe", {});
  console.log(`bot @${me.username} polling`);
  let offset = 0;
  for (;;) {
    try {
      const updates = await call("getUpdates", { offset, timeout: 25, allowed_updates: ["message", "callback_query"] });
      for (const update of updates) {
        offset = update.update_id + 1;
        try {
          if (update.callback_query) await onCallback(update.callback_query);
          else if (update.message) await onMessage(update.message);
        } catch (error) {
          console.error("update", error instanceof Error ? error.message : "fail");
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "fail";
      console.error("poll", message);
      await new Promise((resolve) => setTimeout(resolve, error.code === 409 ? 3000 : 1500));
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
