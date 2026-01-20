"use client";

interface QRCodeSVGProps {
  value: string;
  size?: number;
}

export function QRCodeSVG({ value, size = 150 }: QRCodeSVGProps) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;

  return (
    <img
      src={qrUrl}
      alt={value}
      width={size}
      height={size}
      className="rounded-lg border"
    />
  );
}
