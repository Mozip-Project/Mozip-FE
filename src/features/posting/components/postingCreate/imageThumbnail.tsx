import Image from 'next/image'
import CloseIcon from '@/assets/icons/close.svg'

const THUMBNAIL_SIZE_PX = 106

type ImageThumbnailProps = {
  src: string
  alt: string
  onRemove: () => void
}

function ImageThumbnail({ src, alt, onRemove }: ImageThumbnailProps) {
  return (
    <div className="relative size-26.5 shrink-0 overflow-hidden rounded-m">
      <Image
        src={src}
        alt={alt}
        width={THUMBNAIL_SIZE_PX}
        height={THUMBNAIL_SIZE_PX}
        unoptimized
        className="size-full bg-neutral-weak-pressed object-cover"
      />
      <button
        type="button"
        aria-label={`${alt} 삭제`}
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 flex size-5.5 cursor-pointer items-center justify-center rounded-full bg-neutral-solid text-on-neutral-solid outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring focus-visible:outline-solid"
      >
        <CloseIcon aria-hidden className="size-4" />
      </button>
    </div>
  )
}

export { ImageThumbnail }
export type { ImageThumbnailProps }
