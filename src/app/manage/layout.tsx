import { OrganizerGnb } from '@/features/user/components/gnb/organizerGnb'
import { LoginRequired } from '@/features/user/components/loginRequired/loginRequired'
import { ToastProvider } from '@/providers/toastProvider'

export default function ManageLayout({ children }: LayoutProps<'/manage'>) {
  return (
    <ToastProvider>
      <LoginRequired>
        <OrganizerGnb />
        <div className="px-page-padding pt-(--page-padding-top) pb-(--page-padding-bottom)">
          <div className="mx-auto w-full max-w-page">{children}</div>
        </div>
      </LoginRequired>
    </ToastProvider>
  )
}
