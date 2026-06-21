"use client";

import Image from "next/image";
import { useMediaUrl } from "./MediaProvider";

type Props = {
    imageKey: string;
    alt: string;
    className?: string;
    sizes?: string;
    priority?: boolean;
    fill?: boolean;
    width?: number;
    height?: number;
};

// Bild, dessen Quelle aus der Medien-Config kommt (live aktualisierbar).
export default function EditableImage({
    imageKey,
    alt,
    className,
    sizes,
    priority,
    fill = true,
    width,
    height,
}: Props) {
    const src = useMediaUrl(imageKey);
    if (!src) return null;

    return (
        <Image
            src={src}
            alt={alt}
            fill={fill}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            sizes={sizes}
            priority={priority}
            className={className}
        />
    );
}
