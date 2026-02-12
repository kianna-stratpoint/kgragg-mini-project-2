"use client";

import { AuthModal } from "@/components/auth/AuthModal";
import { useModalStore } from "@/hooks/use-modal-store";

export const ModalProvider = () => {
  const { isOpen } = useModalStore();

  return <>{isOpen && <AuthModal />}</>;
};
