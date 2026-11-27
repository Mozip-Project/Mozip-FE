import { useController, type Control } from 'react-hook-form'
import { ImageUploadField } from '@/components/ui/ImageUploadField/imageUploadField'
import type { AccountEditValues } from '@/features/mypage/schemas/accountEditSchema'

type ProfileImageSectionProps = {
  control: Control<AccountEditValues>
  // 서버에 저장된 프로필 이미지, 새로 고른 이미지를 초기화하면 이 이미지로 복귀
  savedImageUrl: string | null
}

function ProfileImageSection({ control, savedImageUrl }: ProfileImageSectionProps) {
  const { field } = useController({ control, name: 'profileImage' })

  return (
    <section>
      <ImageUploadField
        value={field.value}
        onChange={field.onChange}
        savedImageUrl={savedImageUrl}
        label="프로필 이미지"
        title={<h2 className="text-headline1 font-semibold text-neutral">프로필</h2>}
      />
    </section>
  )
}

export { ProfileImageSection }
