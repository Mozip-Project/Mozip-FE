import { PublicGnb } from '@/features/user/components/gnb/publicGnb'
import { ToastProvider } from '@/providers/toastProvider'

export default function PublicLayout({ children }: LayoutProps<'/'>) {
  return (
    <ToastProvider>
      <PublicGnb />
      <div className="px-page-padding pt-(--page-padding-top) pb-(--page-padding-bottom)">
        <div className="mx-auto w-full max-w-page">{children}</div>
      </div>
    </ToastProvider>
  )
}
