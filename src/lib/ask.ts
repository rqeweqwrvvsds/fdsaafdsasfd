import { createServerFn } from "@tanstack/react-start";
import {
  coverFor,
  excerpt,
  formatPrice,
  formatWhen,
  interpret,
  localAnswer,
  searchEvents,
  type AfishaEvent,
} from "@/lib/catalog";

export type AskCard = {
  id: string;
  title: string;
  when: string;
  venue: string;
  price: string;
  cover: string;
  blurb: string;
};

export type AskResult = {
  text: string;
  events: AskCard[];
  mode: "llm" | "catalog";
};

function cards(events: AfishaEvent[]): AskCard[] {
  return events.slice(0, 4).map((event) => ({
    id: event.id,
    title: event.title,
    when: formatWhen(event.date_start),
    venue: event.venue,
    price: formatPrice(event),
    cover: coverFor(event),
    blurb: excerpt(event, 140),
  }));
}

export const askAfisha = createServerFn({ method: "POST" })
  .validator((data: { message?: string; city?: string; history?: { role?: string; content?: string }[] }) => {
    const message = String(data?.message ?? "").trim().slice(0, 400);
    if (!message) throw new Error("Напишите вопрос");
    const city = data?.city === "Стерлитамак" ? "Стерлитамак" : "Уфа";
    return { message, city };
  })
  .handler(async ({ data }): Promise<AskResult> => {
    const filters = interpret(data.message, data.city);
    const found = searchEvents(filters);
    return { text: localAnswer(filters, found), events: cards(found), mode: "catalog" };
  });
