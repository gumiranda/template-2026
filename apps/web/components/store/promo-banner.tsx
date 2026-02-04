"use client";

import Image from "next/image";
import Link from "next/link";
import type { Id } from "@workspace/backend/_generated/dataModel";

function isSafeHref(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.protocol === "https:" || parsed.protocol === "http:" || url.startsWith("/");
  } catch {
    return false;
  }
}

interface PromoBannerProps {
  banner: {
    _id: Id<"promoBanners">;
    title: string;
    imageUrl: string | null;
    linkUrl?: string;
  };
}

export function PromoBanner({ banner }: PromoBannerProps) {
  const content = (
    <div className="relative aspect-[8/3] overflow-hidden rounded-lg bg-muted">
      {banner.imageUrl ? (
        <Image
          src={banner.imageUrl}
          alt={banner.title}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center p-6 text-lg font-semibold text-muted-foreground">
          {banner.title}
        </div>
      )}
    </div>
  );

  if (banner.linkUrl && isSafeHref(banner.linkUrl)) {
    return <Link href={banner.linkUrl}>{content}</Link>;
  }

  return content;
}
