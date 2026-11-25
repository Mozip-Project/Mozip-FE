import MailIcon from '@/assets/icons/mail.svg'
import PhoneIcon from '@/assets/icons/phone.svg'
import { Avatar } from '@/components/ui/Avatar/avatar'
import { Badge } from '@/components/ui/Badge/badge'

type ApplicantInfoCardProps = {
  name: string
  // 학교 미인증이면 null
  school: string | null
  // 포지션 없는 모집은 null
  position: string | null
  phone: string | null
  email: string | null
}

// 제출 시점 프로필에 없는 항목은 칸을 비움
function ApplicantInfoCard({ name, school, position, phone, email }: ApplicantInfoCardProps) {
  const hasContact = Boolean(phone || email)

  return (
    <section className="flex min-w-70 flex-col gap-gap-l rounded-l border border-neutral-muted bg-layer-default p-padding-xl">
      <div className="flex items-start gap-gap-m">
        <Avatar size={48} />
        <div className="flex min-w-0 flex-1 flex-col gap-gap-xxs">
          <h2 className="truncate text-headline1 font-semibold text-neutral">{name}</h2>
          {school && (
            <p className="line-clamp-3 text-label1 font-medium break-words text-neutral-subtle">
              {school}
            </p>
          )}
        </div>
        {position && (
          <Badge tone="neutral" variant="weak">
            {position}
          </Badge>
        )}
      </div>

      {hasContact && (
        <div className="flex flex-wrap gap-x-gap-xl gap-y-gap-xs border-t border-neutral-subtle pt-padding-m">
          {phone && (
            <p className="flex min-w-0 items-center gap-gap-xs text-label1 font-medium text-neutral-muted">
              <PhoneIcon role="img" aria-label="전화번호" className="size-4 shrink-0" />
              <span className="max-w-55 truncate">{phone}</span>
            </p>
          )}
          {email && (
            <p className="flex min-w-0 items-center gap-gap-xs text-label1 font-medium text-neutral-muted">
              <MailIcon role="img" aria-label="이메일" className="size-4 shrink-0" />
              <span className="max-w-55 truncate">{email}</span>
            </p>
          )}
        </div>
      )}
    </section>
  )
}

export { ApplicantInfoCard }
