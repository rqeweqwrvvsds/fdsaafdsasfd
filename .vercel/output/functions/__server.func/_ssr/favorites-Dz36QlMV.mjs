import { C as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as getEvent } from "./catalog-iRSqga2c.mjs";
import { d as useUi, o as EventCard } from "./router-CZQS19vZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/favorites-Dz36QlMV.js
var import_jsx_runtime = require_jsx_runtime();
function FavoritesPage() {
	const events = useUi((state) => state.favs).map((id) => getEvent(id)).filter((event) => event != null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "page-enter mx-auto max-w-6xl px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-4xl font-medium tracking-tight",
				children: "Избранное"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted",
				children: "Список хранится в этом браузере."
			}),
			events.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4",
				children: events.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventCard, { event }, event.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-8 text-muted",
				children: [
					"Пока пусто. Нажмите сердце на карточке.",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "font-semibold text-fg",
						children: "Перейти к афише"
					})
				]
			})
		]
	});
}
//#endregion
export { FavoritesPage as component };
