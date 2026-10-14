"use client";

import React from "react";

interface OpenChatButtonProps {
  className?: string;
  children: React.ReactNode;
  query?: string;
  title?: string;
}

export function OpenChatButton({
  className,
  children,
  query,
  title = "Buka Bantuan Herdi",
}: OpenChatButtonProps) {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-faq-chat", { detail: { query } }));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}
