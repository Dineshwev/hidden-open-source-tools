"use client";

import { create } from "zustand";

export type MysteryReward = {
  title: string;
  rarity: string;
  description: string;
  downloadUrl: string;
  category: string;
  uploader: string;
  tags: string[];
  license: string;
} | null;

type MysteryState = {
  reward: MysteryReward;
  loading: boolean;
  adCountdown: number;
  setLoading: (value: boolean) => void;
  setReward: (value: MysteryReward) => void;
  setAdCountdown: (value: number) => void;
  reset: () => void;
};

export const useMysteryStore = create<MysteryState>((set) => ({
  reward: null,
  loading: false,
  adCountdown: 5,
  setLoading: (loading) => set({ loading }),
  setReward: (reward) => set({ reward }),
  setAdCountdown: (adCountdown) => set({ adCountdown }),
  reset: () => set({ reward: null, loading: false, adCountdown: 5 })
}));
