import { C as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as weekendRange, b as searchEvents, d as formatWhen, g as listingSearch, i as coverFor, r as addDays, y as moscowToday } from "./catalog-iRSqga2c.mjs";
import { a as DateStrip, c as Rail, d as useUi, i as Route$4, o as EventCard, u as pageTitle } from "./router-CZQS19vZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DXXDLbmO.js
var import_jsx_runtime = require_jsx_runtime();
function HomePage() {
	const { date } = Route$4.useSearch();
	const city = useUi((state) => state.city);
	const navigate = Route$4.useNavigate();
	const today = moscowToday();
	const base = {
		city,
		from: today,
		to: addDays(today, 90)
	};
	const hero = searchEvents({
		...base,
		kind: "concert"
	})[0];
	const [weekendFrom, weekendTo] = weekendRange(today);
	const weekendCount = searchEvents({
		city,
		from: weekendFrom,
		to: weekendTo
	}).length;
	const dated = date ? searchEvents({
		city,
		from: date,
		to: date,
		sort: "date"
	}) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "page-enter mx-auto max-w-6xl px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-4xl font-medium tracking-tight sm:text-5xl",
				children: pageTitle("all", city)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateStrip, {
					value: date,
					onChange: (next) => {
						navigate({ search: { date: next } });
					}
				})
			}),
			date ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-medium",
					children: dated.length ? `События на выбранный день` : "В этот день пусто"
				}), dated.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4",
					children: dated.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventCard, { event }, event.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-xl text-muted",
					children: "На эту дату в каталоге нет показов. Листайте соседние дни или откройте все события."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(16rem,0.8fr)]",
					children: [hero ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/events/$id",
						params: { id: hero.id },
						className: "hero-card relative flex min-h-64 overflow-hidden rounded-3xl bg-ink text-accent-fg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: coverFor(hero),
								alt: "",
								className: "hero-media absolute inset-0 h-full w-full object-cover"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/10" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "relative flex max-w-lg flex-col justify-end p-6 sm:p-8",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-semibold tracking-wide text-accent-fg/80",
										children: "Ближайший концерт"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-2 font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl",
										children: hero.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-3 text-sm text-accent-fg/85",
										children: [
											formatWhen(hero.date_start),
											" · ",
											hero.venue
										]
									})
								]
							})
						]
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/events",
						search: listingSearch({ when: "weekend" }),
						className: "hero-card relative flex min-h-64 overflow-hidden rounded-3xl bg-grove text-accent-fg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/covers/gift.jpg",
								alt: "",
								className: "absolute inset-0 h-full w-full object-cover object-right"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 bg-grove/85" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "relative flex flex-col justify-end p-6 sm:p-8",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-3xl font-medium tracking-tight text-balance",
									children: "Выходные в городе"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-3 max-w-56 text-sm text-accent-fg/90",
									children: weekendCount ? `${weekendCount} событий в каталоге на ближайшие выходные` : "Подборка событий на субботу и воскресенье"
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, {
					title: `Самые ожидаемые концерты в ${city === "Уфа" ? "Уфе" : "Стерлитамаке"}`,
					events: searchEvents({
						...base,
						kind: "concert"
					}).slice(0, 12),
					more: listingSearch({ kind: "concert" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, {
					title: `Стендап в ${city === "Уфа" ? "Уфе" : "Стерлитамаке"}`,
					events: searchEvents({
						...base,
						kind: "standup"
					}).slice(0, 12),
					more: listingSearch({ kind: "standup" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, {
					title: `Лучшие спектакли в ${city === "Уфа" ? "Уфе" : "Стерлитамаке"}`,
					events: searchEvents({
						...base,
						kind: "performance"
					}).slice(0, 12),
					more: listingSearch({ kind: "performance" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, {
					title: "Квизы и вечера",
					events: searchEvents({
						...base,
						kind: "quiz"
					}).slice(0, 12),
					more: listingSearch({ kind: "quiz" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, {
					title: `Экскурсии в ${city === "Уфа" ? "Уфе" : "Стерлитамаке"}`,
					events: searchEvents({
						...base,
						kind: "excursion"
					}).slice(0, 8),
					more: listingSearch({ kind: "excursion" })
				})
			] })
		]
	});
}
//#endregion
export { HomePage as component };
