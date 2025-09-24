// store/useTasteStore.ts
"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
type Fit = "COCOK" | "KURANG_COCOK";

interface TasteState {
  branchCode?: string;
  branchName?: string;
  stationCode?: string;
  stationName?: string;
  sauceId?: number | string;
  sauceName?: string;
  fit?: Fit;
  stars?: number;
  comment?: string;
  setBranch: (code: string, name: string) => void;
  setStation: (code: string, name: string) => void;
  setSauce: (id: number | string, name: string) => void;
  setFit: (f: Fit) => void;
  setStars: (n: number) => void;
  setComment: (s: string) => void;
  reset: () => void;
}

export const useTasteStore = create<TasteState>()(
  persist(
    (set) => ({
      setBranch: (branchCode, branchName) => set({ branchCode, branchName }),
      setStation: (stationCode, stationName) =>
        set({ stationCode, stationName }),
      setSauce: (sauceId, sauceName) => set({ sauceId, sauceName }),
      setFit: (fit) => set({ fit }),
      setStars: (n) => set({ stars: n }),
      setComment: (s) => set({ comment: s }),
      reset: () =>
        set({
          sauceId: undefined,
          sauceName: undefined,
          fit: undefined,
          stars: undefined,
          comment: "",
        }),
    }),
    { name: "taste-state", storage: createJSONStorage(() => sessionStorage) }
  )
);
