type SchoolVerificationSectionProps = {
  schoolName: string
  email: string
}

const LABEL_CLASS = 'w-30 shrink-0 text-label1 font-semibold text-neutral-subtle'
const VALUE_CLASS = 'min-w-0 flex-1 text-body2 break-words text-neutral'

function SchoolVerificationSection({ schoolName, email }: SchoolVerificationSectionProps) {
  return (
    <section className="flex flex-col gap-gap-l py-padding-m">
      <h2 className="text-headline1 font-semibold text-neutral">학교 인증</h2>
      <dl className="flex flex-col gap-gap-s">
        <div className="flex items-center gap-gap-l">
          <dt className={LABEL_CLASS}>인증 학교</dt>
          <dd className={VALUE_CLASS}>{schoolName}</dd>
        </div>
        <div className="flex items-center gap-gap-l">
          <dt className={LABEL_CLASS}>인증 이메일</dt>
          <dd className={VALUE_CLASS}>{email}</dd>
        </div>
      </dl>
    </section>
  )
}

export { SchoolVerificationSection }
