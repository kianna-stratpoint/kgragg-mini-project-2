import { create } from "zustand";

type ModalType =
  | "login"
  | "signup"
  | "forgot-password"
  | "delete-post"
  | "delete-comment";

interface ModalStore {
  isOpen: boolean;
  view: ModalType;
  openModal: (view: ModalType) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  view: "login", // Default view
  openModal: (view) => set({ isOpen: true, view }),
  closeModal: () => set({ isOpen: false }),
}));
