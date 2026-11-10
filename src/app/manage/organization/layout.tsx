import { SidebarLayout } from '@/components/ui/Sidebar/sidebarLayout'
import { OrganizationNav } from '@/features/organization/components/organizationNav/organizationNav'

export default function OrganizationLayout({ children }: LayoutProps<'/manage/organization'>) {
  return <SidebarLayout sidebar={<OrganizationNav />}>{children}</SidebarLayout>
}
