import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DateStrip, EventCard, kindLead, pageTitle } from "@/components/site";
import {
  addDays,
  listingSearch,
  moscowToday,
  searchEvents,
  weekendRange,
  type Kind,
  type ListingSearch,
  type SortKey,
} from "@/lib/catalog";
import { useUi } from "@/lib/store";

const KINDS: Kind[] = ["all", "concert", "performance", "exhibition", "excursion", "standup", "kids", "quiz"];

export const Route = createFileRoute("/events/")({
  validateSearch: (search: Record<string, unknown>): ListingSearch => {
    const kind = KINDS.includes(search.kind as Kind) ? (search.kind as Kind) : "all";
    const sort: SortKey =
      search.sort === "price" || search.sort === "price-desc" ? search.sort : "date";
    const when = search.when === "weekend" || search.when === "week" ? search.when : undefined;
    const date = typeof search.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search.date) ? search.date : undefined;
    const q = typeof search.q === "string" ? search.q.trim().slice(0, 80) : "";
    const rawAge = search.ageMax;
    const ageMax =
      typeof rawAge === "number" && rawAge >= 0 && rawAge <= 17
        ? rawAge
        : typeof rawAge === "string" && /^\d{1,2}$/.test(rawAge)
          ? Number(rawAge)
          : undefined;
    return listingSearch({
      kind,
      sort,
      free: search.free === true || search.free === "true" || search.free === "1",
      date,
      q: q || undefined,
      when,
      ageMax,
    });
  },
  component: EventsPage,
});

function EventsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const city = useUi((state) => state.city);
  const today = moscowToday();
  let from = today;
  let to = addDays(today, 120);
  if (search.date) {
    from = search.date;
    to = search.date;
  } else if (search.when === "weekend") {
    [from, to] = weekendRange(today);
  } else if (search.when === "week") {
    to = addDays(today, 6);
  }
  const kind = search.kind ?? "all";
  const sort = search.sort ?? "date";
  const free = Boolean(search.free);
  const events = searchEvents({
    city,
    kind,
    q: search.q,
    from,
    to,
    free,
    sort,
    ageMax: search.ageMax,
  });
  const [sortOpen, setSortOpen] = useState(false);
  const lead = kindLead(kind);
  const sortLabel = sort === "price" ? "Сначала дешевле" : sort === "price-desc" ? "Сначала дороже" : "По дате";

  function patch(next: Partial<ListingSearch>) {
    void navigate({ search: listingSearch({ ...search, ...next }) });
  }

  return (
    <main className="page-enter mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">{pageTitle(kind, city)}</h1>
      {lead ? <p className="mt-3 max-w-2xl text-muted">{lead}</p> : null}
      {search.q ? <p className="mt-3 text-sm text-muted">Запрос: {search.q}</p> : null}
      {search.ageMax != null ? (
        <p className="mt-3 text-sm font-medium text-fg">
          Возраст до {search.ageMax} лет — события 12+, 16+ и 18+ скрыты, если они старше.
        </p>
      ) : null}
      <div className="mt-6">
        <DateStrip value={search.date} onChange={(date) => patch({ date, when: undefined })} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <div className="relative">
          <button
            type="button"
            className="press rounded-full bg-chip px-4 py-2 text-sm font-medium"
            onClick={() => setSortOpen((open) => !open)}
          >
            {sortLabel}
          </button>
          {sortOpen ? (
            <div className="search-pop absolute z-20 mt-2 w-48 rounded-2xl border border-line bg-bg p-1 shadow-lg">
              {(
                [
                  ["date", "По дате"],
                  ["price", "Сначала дешевле"],
                  ["price-desc", "Сначала дороже"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className="press block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-soft"
                  onClick={() => {
                    patch({ sort: value });
                    setSortOpen(false);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className={`press rounded-full px-4 py-2 text-sm font-medium ${free ? "bg-grove text-accent-fg" : "bg-chip"}`}
          onClick={() => patch({ free: !free })}
        >
          Бесплатно
        </button>
        {kind !== "kids" ? (
          <button
            type="button"
            className="press rounded-full bg-chip px-4 py-2 text-sm font-medium"
            onClick={() => patch({ kind: "kids", ageMax: undefined })}
          >
            Детям
          </button>
        ) : null}
        {search.ageMax != null ? (
          <button
            type="button"
            className="press rounded-full bg-ink px-4 py-2 text-sm font-medium text-accent-fg"
            onClick={() => patch({ ageMax: undefined, kind: kind === "kids" ? "all" : kind })}
          >
            Возраст до {search.ageMax}
          </button>
        ) : null}
      </div>
      {events.length ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }} />
          ))}
        </div>
      ) : (
        <p className="mt-8 max-w-xl text-muted">
          Ничего не нашлось. Снимите фильтр цены или выберите другой день — каталог собран по открытым страницам
          ноября 2026 года.
        </p>
      )}
    </main>
  );
}
