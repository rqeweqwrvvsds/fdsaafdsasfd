import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as effectiveAge, d as formatWhen, f as getEvent, i as coverFor, s as describeEvent, u as formatPrice, x as similarEvents } from "./catalog-iRSqga2c.mjs";
import { l as Heart, o as Plus, r as Ticket, s as Minus } from "../_libs/lucide-react.mjs";
import { d as useUi, n as Route, o as EventCard, s as InfoRow } from "./router-CZQS19vZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/events._id-BAMUtbDE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function EventPage() {
	const { id } = Route.useParams();
	const event = getEvent(id);
	const fav = useUi((state) => state.favs.includes(id));
	const toggle = useUi((state) => state.toggle);
	const [count, setCount] = (0, import_react.useState)(1);
	const total = (0, import_react.useMemo)(() => {
		if (!event) return null;
		if (event.is_free || event.price_min === 0) return "бесплатно";
		if (event.price_min == null) return null;
		return new Intl.NumberFormat("ru-RU").format(event.price_min * count) + " ₽";
	}, [event, count]);
	if (!event) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "page-enter mx-auto max-w-6xl px-4 py-16 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-medium",
				children: "Событие не найдено"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted",
				children: "Возможно, ссылка устарела."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-6 inline-block font-semibold",
				children: "На афишу"
			})
		]
	});
	const clock = event.date_start.slice(11, 16);
	const when = formatWhen(event.date_start);
	const similar = similarEvents(event);
	const age = effectiveAge(event);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "page-enter mx-auto max-w-6xl px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-normal text-muted",
				children: event.city
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 max-w-4xl text-4xl font-medium tracking-tight text-balance sm:text-5xl",
				children: event.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-3xl text-base font-normal leading-relaxed text-pretty text-fg/90",
				children: describeEvent(event)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_22rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: coverFor(event),
						alt: "",
						className: "hero-card aspect-video w-full rounded-3xl object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": fav ? "Убрать из избранного" : "В избранное",
						onClick: () => toggle(event.id),
						className: "press absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-bg shadow-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: fav ? "size-5 fill-gold text-gold" : "size-5" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "ticket-panel space-y-5 rounded-3xl bg-soft p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm font-semibold tracking-wide text-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ticket, { className: "size-4" }), "Покупка билета"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							icon: "pin",
							title: event.venue || event.city,
							text: event.address || void 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							icon: "date",
							title: when,
							text: clock && clock !== "00:00" ? clock : "Время на странице не указано"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							icon: "ticket",
							title: formatPrice(event),
							text: `${age}+`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium",
								children: "Количество"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "press grid size-11 place-items-center rounded-full bg-bg",
										"aria-label": "Меньше",
										onClick: () => setCount((value) => Math.max(1, value - 1)),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-6 text-center font-semibold",
										children: count
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "press grid size-11 place-items-center rounded-full bg-bg",
										"aria-label": "Больше",
										onClick: () => setCount((value) => Math.min(8, value + 1)),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
									})
								]
							})]
						}),
						total ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								"Ориентир: ",
								total,
								" за ",
								count,
								" шт. Точную сумму покажет касса."
							]
						}) : null,
						event.source_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							className: "press flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3.5 text-sm font-semibold text-accent-fg",
							href: event.source_url,
							target: "_blank",
							rel: "noopener noreferrer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ticket, { className: "size-4" }), "Купить билет"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Ссылка на кассу для этого события не указана."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-relaxed text-muted",
							children: "Оплата открывается в новой вкладке на странице площадки. Этот сервис билеты не проводит."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-3xl text-sm font-normal text-muted",
				children: "Карточка собрана из открытого каталога. Перед походом сверьте время на сайте площадки."
			}),
			similar.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-medium",
					children: "Похожие события"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4",
					children: similar.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventCard, { event: item }, item.id))
				})]
			}) : null
		]
	});
}
//#endregion
export { EventPage as component };
