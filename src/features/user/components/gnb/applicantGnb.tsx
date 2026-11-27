import { Gnb } from '@/components/ui/Gnb/gnb'
import { NotificationPanel } from '@/features/notification/components/notificationPanel/notificationPanel'
import { MyProfileMenu } from './myProfileMenu'

function ApplicantGnb() {
  return (
    <Gnb
      actions={
        <>
          <NotificationPanel settingsHref="/mypage/notifications" />
          <MyProfileMenu
            mode="applicant"
            myPageHref="/mypage"
            applicationsHref="/applications"
            switchModeHref="/manage"
          />
        </>
      }
    />
  )
}

export { ApplicantGnb }
