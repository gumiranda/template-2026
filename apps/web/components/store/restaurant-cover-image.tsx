import Image from "next/image";

interface RestaurantCoverImageProps {
  name: string;
  coverImageUrl: string | null;
  logoUrl: string | null;
}

export function RestaurantCoverImage({
  name,
  coverImageUrl,
  logoUrl,
}: RestaurantCoverImageProps) {
  return (
    <div className="relative h-48 bg-muted md:h-64">
      {coverImageUrl ? (
        <Image
          src={coverImageUrl}
          alt={name}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      ) : logoUrl ? (
        <Image
          src={logoUrl}
          alt={name}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      ) : null}
    </div>
  );
}
