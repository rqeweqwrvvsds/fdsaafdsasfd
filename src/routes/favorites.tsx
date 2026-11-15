import { createFileRoute, Link } from "@tanstack/react-router";
import { EventCard } from "@/components/site";
import { getEvent } from "@/lib/catalog";
import { useUi } from "@/lib/store";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const ids = useUi((state) => state.favs);
  const events = ids.map((id) => getEvent(id)).filter((event) => event != null);

  return (
    <main className="page-enter mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-medium tracking-tight">Избранное</h1>
      <p className="mt-3 text-muted">Список хранится в этом браузере.</p>
      {events.length ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-muted">
          Пока пусто. Нажмите сердце на карточке.{" "}
          <Link to="/" className="font-semibold text-fg">
            Перейти к афише
          </Link>
        </p>
      )}
    </main>
  );
}
