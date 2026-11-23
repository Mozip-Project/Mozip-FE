import { Gnb } from '@/components/ui/Gnb/gnb'
import { ProfileMenu } from '@/components/ui/Gnb/profileMenu'
import { NotificationPanel } from '@/features/notification/components/notificationPanel/notificationPanel'

function ApplicantGnb() {
  return (
    <>
      {/* TODO: 로그인 사용자 정보 연결 */}
      {/* TODO: 마이페이지가 임시로 운영진 영역(/manage/mypage)에만 있어 지원자도 그쪽으로 이동. 모드 저장 방식 결정 후 재검토 */}
      <Gnb
        actions={
          <>
            <NotificationPanel settingsHref="/manage/mypage/notifications" />
            <ProfileMenu
              name="김모집"
              mode="applicant"
              myPageHref="/manage/mypage"
              applicationsHref="/applications"
              switchModeHref="/manage"
              logoutHref="/"
            />
          </>
        }
      />
    </>
  )
}

export { ApplicantGnb }
