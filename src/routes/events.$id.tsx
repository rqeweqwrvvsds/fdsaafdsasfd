import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Minus, Plus, Ticket } from "lucide-react";
import { useMemo, useState } from "react";
import { EventCard, InfoRow } from "@/components/site";
import { coverFor, describeEvent, effectiveAge, formatPrice, formatWhen, getEvent, similarEvents } from "@/lib/catalog";
import { useUi } from "@/lib/store";

export const Route = createFileRoute("/events/$id")({
  component: EventPage,
});

function EventPage() {
  const { id } = Route.useParams();
  const event = getEvent(id);
  const fav = useUi((state) => state.favs.includes(id));
  const toggle = useUi((state) => state.toggle);
  const [count, setCount] = useState(1);

  const total = useMemo(() => {
    if (!event) return null;
    if (event.is_free || event.price_min === 0) return "бесплатно";
    if (event.price_min == null) return null;
    return new Intl.NumberFormat("ru-RU").format(event.price_min * count) + " ₽";
  }, [event, count]);

  if (!event) {
    return (
      <main className="page-enter mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-medium">Событие не найдено</h1>
        <p className="mt-3 text-muted">Возможно, ссылка устарела.</p>
        <Link to="/" className="mt-6 inline-block font-semibold">
          На афишу
        </Link>
      </main>
    );
  }

  const clock = event.date_start.slice(11, 16);
  const when = formatWhen(event.date_start);
  const similar = similarEvents(event);
  const age = effectiveAge(event);

  return (
    <main className="page-enter mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-sm font-normal text-muted">{event.city}</p>
      <h1 className="mt-2 max-w-4xl text-4xl font-medium tracking-tight text-balance sm:text-5xl">{event.title}</h1>
      <p className="mt-4 max-w-3xl text-base font-normal leading-relaxed text-pretty text-fg/90">{describeEvent(event)}</p>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_22rem]">
        <div className="relative">
          <img src={coverFor(event)} alt="" className="hero-card aspect-video w-full rounded-3xl object-cover" />
          <button
            type="button"
            aria-label={fav ? "Убрать из избранного" : "В избранное"}
            onClick={() => toggle(event.id)}
            className="press absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-bg shadow-sm"
          >
            <Heart className={fav ? "size-5 fill-gold text-gold" : "size-5"} />
          </button>
        </div>
        <aside className="ticket-panel space-y-5 rounded-3xl bg-soft p-6">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-accent">
            <Ticket className="size-4" />
            Покупка билета
          </div>
          <InfoRow icon="pin" title={event.venue || event.city} text={event.address || undefined} />
          <InfoRow icon="date" title={when} text={clock && clock !== "00:00" ? clock : "Время на странице не указано"} />
          <InfoRow icon="ticket" title={formatPrice(event)} text={`${age}+`} />
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Количество</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="press grid size-11 place-items-center rounded-full bg-bg"
                aria-label="Меньше"
                onClick={() => setCount((value) => Math.max(1, value - 1))}
              >
                <Minus className="size-4" />
              </button>
              <span className="w-6 text-center font-semibold">{count}</span>
              <button
                type="button"
                className="press grid size-11 place-items-center rounded-full bg-bg"
                aria-label="Больше"
                onClick={() => setCount((value) => Math.min(8, value + 1))}
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
          {total ? <p className="text-sm text-muted">Ориентир: {total} за {count} шт. Точную сумму покажет касса.</p> : null}
          {event.source_url ? (
            <a
              className="press flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3.5 text-sm font-semibold text-accent-fg"
              href={event.source_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Ticket className="size-4" />
              Купить билет
            </a>
          ) : (
            <p className="text-sm text-muted">Ссылка на кассу для этого события не указана.</p>
          )}
          <p className="text-xs leading-relaxed text-muted">
            Оплата открывается в новой вкладке на странице площадки. Этот сервис билеты не проводит.
          </p>
        </aside>
      </div>
      <p className="mt-4 max-w-3xl text-sm font-normal text-muted">
        Карточка собрана из открытого каталога. Перед походом сверьте время на сайте площадки.
      </p>
      {similar.length ? (
        <section className="mt-12">
          <h2 className="text-2xl font-medium">Похожие события</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((item) => (
              <EventCard key={item.id} event={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
