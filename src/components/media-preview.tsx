const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".ogg"];

function isVideoSrc(src: string) {
  return VIDEO_EXTENSIONS.some((ext) => src.toLowerCase().endsWith(ext));
}

export function MediaPreview({
  src,
  alt,
  className,
  emojiClassName,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  emojiClassName?: string;
}) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-sand ${emojiClassName ?? "text-4xl"} ${className ?? ""}`}>
        🏺
      </div>
    );
  }

  if (isVideoSrc(src)) {
    return <video src={src} className={`object-cover ${className ?? ""}`} controls muted playsInline />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`object-cover ${className ?? ""}`} />;
}
