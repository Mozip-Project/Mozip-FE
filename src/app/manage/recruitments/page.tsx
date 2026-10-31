import { redirect } from 'next/navigation'

// TODO: 임시 ID 대신 최근 모집으로 이동, 모집이 없으면 모집 없음 상태 표시
export default function RecruitmentsPage() {
  redirect('/manage/recruitments/1/documents')
}
