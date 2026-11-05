import MailIcon from '@/assets/icons/mail.svg'
import PhoneIcon from '@/assets/icons/phone.svg'
import { Avatar } from '@/components/ui/Avatar/avatar'
import { Badge } from '@/components/ui/Badge/badge'

type ApplicantInfoCardProps = {
  name: string
  education: string
  position: string
  phone: string
  email: string
}

function ApplicantInfoCard({ name, education, position, phone, email }: ApplicantInfoCardProps) {
  return (
    <section className="flex min-w-70 flex-col gap-gap-l rounded-l border border-neutral-muted bg-layer-default p-padding-xl">
      <div className="flex items-start gap-gap-m">
        <Avatar size={48} />
        <div className="flex min-w-0 flex-1 flex-col gap-gap-xxs">
          <h2 className="truncate text-headline1 font-semibold text-neutral">{name}</h2>
          <p className="line-clamp-3 text-label1 font-medium break-words text-neutral-subtle">
            {education}
          </p>
        </div>
        <Badge tone="neutral" variant="weak">
          {position}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-x-gap-xl gap-y-gap-xs border-t border-neutral-subtle pt-padding-m">
        <p className="flex min-w-0 items-center gap-gap-xs text-label1 font-medium text-neutral-muted">
          <PhoneIcon role="img" aria-label="전화번호" className="size-4 shrink-0" />
          <span className="max-w-55 truncate">{phone}</span>
        </p>
        <p className="flex min-w-0 items-center gap-gap-xs text-label1 font-medium text-neutral-muted">
          <MailIcon role="img" aria-label="이메일" className="size-4 shrink-0" />
          <span className="max-w-55 truncate">{email}</span>
        </p>
      </div>
    </section>
  )
}

export { ApplicantInfoCard }
