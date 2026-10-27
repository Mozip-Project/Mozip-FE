import Link from 'next/link'
import BellIcon from '@/assets/icons/bell.svg'
import { Button } from '@/components/ui/Button/button'
import { GnbNav, type GnbNavItem } from './gnbNav'
import { OrganizationSelector } from './organizationSelector'
import { ProfileMenu } from './profileMenu'
import type { Route } from 'next'

type SignedInProps = {
  navItems: GnbNavItem[]
  userName: string
  myPageHref: Route
}

type GnbProps =
  | {
      type: 'loggedOut'
      navItems: GnbNavItem[]
      loginHref: Route
      signupHref: Route
    }
  | ({ type: 'applicant' } & SignedInProps)
  | ({ type: 'organizer'; organizationName: string } & SignedInProps)

function Gnb(props: GnbProps) {
  return (
    <header
      data-slot="gnb"
      className="border-b border-neutral-subtle bg-layer-default px-page-padding"
    >
      <div className="mx-auto flex h-16 w-full max-w-page items-center gap-gap-xl">
        <div className="flex min-w-0 items-center gap-8">
          {/* TODO: 실제 로고로 교체 */}
          <Link
            href="/"
            aria-label="MOZIP. 홈"
            className="flex h-8 w-24 shrink-0 items-center rounded-s text-heading2 font-bold text-neutral outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
          >
            LOGO
          </Link>

          <GnbNav items={props.navItems} />
        </div>
        <div className="ml-auto flex min-w-0 items-center gap-gap-m">
          <GnbActions {...props} />
        </div>
      </div>
    </header>
  )
}

function GnbActions(props: GnbProps) {
  if (props.type === 'loggedOut') {
    return (
      <>
        <Button asChild variant="tertiary" size="m">
          <Link href={props.loginHref}>로그인</Link>
        </Button>
        <Button asChild variant="primary" size="m">
          <Link href={props.signupHref}>회원가입</Link>
        </Button>
      </>
    )
  }

  return (
    <>
      {props.type === 'organizer' && <OrganizationSelector name={props.organizationName} />}
      {/* TODO: 알림 패널 디자인 확정 후 동작 연결 */}
      <Button variant="tertiary" size="m" aria-label="알림" className="size-10 text-neutral">
        <BellIcon aria-hidden className="size-4.5" />
      </Button>
      <ProfileMenu name={props.userName} mode={props.type} myPageHref={props.myPageHref} />
    </>
  )
}

export { Gnb }
