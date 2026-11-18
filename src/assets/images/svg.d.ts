declare module '@/assets/images/*.svg' {
  import type { StaticImageData } from 'next/image'

  const image: StaticImageData
  export default image
}
