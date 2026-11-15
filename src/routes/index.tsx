import { createFileRoute, Link } from "@tanstack/react-router";
import { DateStrip, EventCard, Rail, pageTitle } from "@/components/site";
import {
  addDays,
  coverFor,
  formatWhen,
  listingSearch,
  moscowToday,
  searchEvents,
  weekendRange,
} from "@/lib/catalog";
import { useUi } from "@/lib/store";

type HomeSearch = { date?: string };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    date: typeof search.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search.date) ? search.date : undefined,
  }),
  component: HomePage,
});

function HomePage() {
  const { date } = Route.useSearch();
  const city = useUi((state) => state.city);
  const navigate = Route.useNavigate();
  const today = moscowToday();
  const base = { city, from: today, to: addDays(today, 90) };
  const heroPool = searchEvents({ ...base, kind: "concert" });
  const hero = heroPool[0];
  const [weekendFrom, weekendTo] = weekendRange(today);
  const weekendCount = searchEvents({ city, from: weekendFrom, to: weekendTo }).length;

  const dated = date
    ? searchEvents({ city, from: date, to: date, sort: "date" })
    : [];

  return (
    <main className="page-enter mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">{pageTitle("all", city)}</h1>
      <div className="mt-6">
        <DateStrip
          value={date}
          onChange={(next) => {
            void navigate({ search: { date: next } });
          }}
        />
      </div>

      {date ? (
        <section className="mt-8">
          <h2 className="text-2xl font-medium">{dated.length ? `События на выбранный день` : "В этот день пусто"}</h2>
          {dated.length ? (
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {dated.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="mt-3 max-w-xl text-muted">
              На эту дату в каталоге нет показов. Листайте соседние дни или откройте все события.
            </p>
          )}
        </section>
      ) : (
        <>
          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(16rem,0.8fr)]">
            {hero ? (
              <Link
                to="/events/$id"
                params={{ id: hero.id }}
                className="hero-card relative flex min-h-64 overflow-hidden rounded-3xl bg-ink text-accent-fg"
              >
                <img src={coverFor(hero)} alt="" className="hero-media absolute inset-0 h-full w-full object-cover" />
                <span className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/10" />
                <span className="relative flex max-w-lg flex-col justify-end p-6 sm:p-8">
                  <span className="text-sm font-semibold tracking-wide text-accent-fg/80">Ближайший концерт</span>
                  <span className="mt-2 font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl">{hero.title}</span>
                  <span className="mt-3 text-sm text-accent-fg/85">
                    {formatWhen(hero.date_start)} · {hero.venue}
                  </span>
                </span>
              </Link>
            ) : null}
            <Link
              to="/events"
              search={listingSearch({ when: "weekend" })}
              className="hero-card relative flex min-h-64 overflow-hidden rounded-3xl bg-grove text-accent-fg"
            >
              <img src="/covers/gift.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-right" />
              <span className="absolute inset-0 bg-grove/85" />
              <span className="relative flex flex-col justify-end p-6 sm:p-8">
                <span className="font-display text-3xl font-medium tracking-tight text-balance">Выходные в городе</span>
                <span className="mt-3 max-w-56 text-sm text-accent-fg/90">
                  {weekendCount
                    ? `${weekendCount} событий в каталоге на ближайшие выходные`
                    : "Подборка событий на субботу и воскресенье"}
                </span>
              </span>
            </Link>
          </div>

          <Rail
            title={`Самые ожидаемые концерты в ${city === "Уфа" ? "Уфе" : "Стерлитамаке"}`}
            events={searchEvents({ ...base, kind: "concert" }).slice(0, 12)}
            more={listingSearch({ kind: "concert" })}
          />
          <Rail
            title={`Стендап в ${city === "Уфа" ? "Уфе" : "Стерлитамаке"}`}
            events={searchEvents({ ...base, kind: "standup" }).slice(0, 12)}
            more={listingSearch({ kind: "standup" })}
          />
          <Rail
            title={`Лучшие спектакли в ${city === "Уфа" ? "Уфе" : "Стерлитамаке"}`}
            events={searchEvents({ ...base, kind: "performance" }).slice(0, 12)}
            more={listingSearch({ kind: "performance" })}
          />
          <Rail
            title="Квизы и вечера"
            events={searchEvents({ ...base, kind: "quiz" }).slice(0, 12)}
            more={listingSearch({ kind: "quiz" })}
          />
          <Rail
            title={`Экскурсии в ${city === "Уфа" ? "Уфе" : "Стерлитамаке"}`}
            events={searchEvents({ ...base, kind: "excursion" }).slice(0, 8)}
            more={listingSearch({ kind: "excursion" })}
          />
        </>
      )}
    </main>
  );
}
