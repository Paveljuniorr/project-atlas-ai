"use client";

import { ClerkProvider } from "@clerk/nextjs";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          socialButtonsPlacement: "top",
          socialButtonsVariant: "blockButton",
          logoPlacement: "inside",
        },
        variables: {
          colorPrimary: "#4f46e5",
          colorText: "#0f172a",
          borderRadius: "0.75rem",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
