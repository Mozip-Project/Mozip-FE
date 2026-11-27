import { ApplicantGnb } from '@/features/user/components/gnb/applicantGnb'
import { LoginRequired } from '@/features/user/components/loginRequired/loginRequired'
import { ToastProvider } from '@/providers/toastProvider'

export default function ApplicantLayout({ children }: LayoutProps<'/'>) {
  return (
    <ToastProvider>
      <LoginRequired>
        <ApplicantGnb />
        <div className="px-page-padding pt-(--page-padding-top) pb-(--page-padding-bottom)">
          <div className="mx-auto w-full max-w-page">{children}</div>
        </div>
      </LoginRequired>
    </ToastProvider>
  )
}
