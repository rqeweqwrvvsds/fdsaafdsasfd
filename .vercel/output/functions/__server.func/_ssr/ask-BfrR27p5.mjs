import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { _ as localAnswer, b as searchEvents, d as formatWhen, i as coverFor, l as excerpt, m as interpret, u as formatPrice } from "./catalog-iRSqga2c.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ask-BfrR27p5.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function cards(events) {
	return events.slice(0, 4).map((event) => ({
		id: event.id,
		title: event.title,
		when: formatWhen(event.date_start),
		venue: event.venue,
		price: formatPrice(event),
		cover: coverFor(event),
		blurb: excerpt(event, 140)
	}));
}
var askAfisha_createServerFn_handler = createServerRpc({
	id: "77f7c3438155bcecea347c717cf3acc2ac1c4c0f42fce09a34e1fa90a9140689",
	name: "askAfisha",
	filename: "src/lib/ask.ts"
}, (opts) => askAfisha.__executeServer(opts));
var askAfisha = createServerFn({ method: "POST" }).validator((data) => {
	const message = String(data?.message ?? "").trim().slice(0, 400);
	if (!message) throw new Error("Напишите вопрос");
	return {
		message,
		city: data?.city === "Стерлитамак" ? "Стерлитамак" : "Уфа"
	};
}).handler(askAfisha_createServerFn_handler, async ({ data }) => {
	const filters = interpret(data.message, data.city);
	const found = searchEvents(filters);
	return {
		text: localAnswer(filters, found),
		events: cards(found),
		mode: "catalog"
	};
});
//#endregion
export { askAfisha_createServerFn_handler };
