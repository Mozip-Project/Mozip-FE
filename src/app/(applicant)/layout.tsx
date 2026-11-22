import { ApplicantGnb } from '@/features/user/components/gnb/applicantGnb'
import { ToastProvider } from '@/providers/toastProvider'

export default function ApplicantLayout({ children }: LayoutProps<'/'>) {
  return (
    <ToastProvider>
      <ApplicantGnb />
      <div className="px-page-padding pt-(--page-padding-top) pb-(--page-padding-bottom)">
        <div className="mx-auto w-full max-w-page">{children}</div>
      </div>
    </ToastProvider>
  )
}
