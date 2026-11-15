import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { City } from "@/lib/catalog";

type State = {
  city: City;
  setCity: (city: City) => void;
  favs: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
};

export const useUi = create<State>()(
  persist(
    (set, get) => ({
      city: "Уфа",
      setCity: (city) => set({ city }),
      favs: [],
      toggle: (id) => {
        const favs = get().favs;
        set({ favs: favs.includes(id) ? favs.filter((item) => item !== id) : [...favs, id] });
      },
      has: (id) => get().favs.includes(id),
    }),
    { name: "afisha-ui", skipHydration: true },
  ),
);
