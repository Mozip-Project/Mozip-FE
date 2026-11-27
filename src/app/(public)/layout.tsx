import { PublicGnb } from '@/features/user/components/gnb/publicGnb'
import { LogoutNoticeToast } from '@/features/user/components/logoutNotice/logoutNoticeToast'
import { ToastProvider } from '@/providers/toastProvider'

export default function PublicLayout({ children }: LayoutProps<'/'>) {
  return (
    <ToastProvider>
      <PublicGnb />
      <LogoutNoticeToast />
      <div className="px-page-padding pt-(--page-padding-top) pb-(--page-padding-bottom)">
        <div className="mx-auto w-full max-w-page">{children}</div>
      </div>
    </ToastProvider>
  )
}
