"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";
import type { ComponentProps } from "react";

type ClerkAuthViewProps = {
  mode: "sign-in" | "sign-up";
};

const CLERK_APPEARANCE: ComponentProps<typeof SignIn>["appearance"] = {
  elements: {
    cardBox: "rounded-lg! border! shadow-none!",
  },
};

export function ClerkAuthView({ mode }: ClerkAuthViewProps) {
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === "dark" || theme === "light" ? theme : systemTheme;
  const appearance = {
    ...CLERK_APPEARANCE,
    baseTheme: resolvedTheme === "dark" ? dark : undefined,
  };

  const AuthComponent = mode === "sign-in" ? SignIn : SignUp;

  return (
    <div className="flex flex-col max-w-3xl mx-auto w-full">
      <section className="space-y-6 pt-[16vh] 2xl:pt-48">
        <div className="flex flex-col items-center">
          <AuthComponent routing="hash" appearance={appearance} />
        </div>
      </section>
    </div>
  );
}
