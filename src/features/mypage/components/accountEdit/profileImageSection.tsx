import { useController, type Control } from 'react-hook-form'
import { ImageUploadField } from '@/components/ui/ImageUploadField/imageUploadField'
import type { AccountEditValues } from '@/features/mypage/schemas/accountEditSchema'

type ProfileImageSectionProps = {
  control: Control<AccountEditValues>
}

// TODO: 서버에 저장된 프로필 이미지 표시, 초기화 시 그 이미지로 복귀
function ProfileImageSection({ control }: ProfileImageSectionProps) {
  const { field } = useController({ control, name: 'profileImage' })

  return (
    <section>
      <ImageUploadField
        value={field.value}
        onChange={field.onChange}
        label="프로필 이미지"
        title={<h2 className="text-headline1 font-semibold text-neutral">프로필</h2>}
      />
    </section>
  )
}

export { ProfileImageSection }
