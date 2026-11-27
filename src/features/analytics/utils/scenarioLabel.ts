import type { ScenarioStep } from './scenarioStep'

// Mixpanel 보드에서 읽기 쉽도록 영어 값과 함께 보내는 한글 이름
const SCENARIO_STEP_LABEL = {
  manage_home: '운영진 홈',
  posting_info: '공고 작성 - 공고 정보',
  posting_schedule: '공고 작성 - 모집 일정',
  posting_method: '공고 작성 - 모집 방식',
  posting_form: '공고 작성 - 지원서 양식',
  posting_interview: '공고 작성 - 면접 시간 설정',
  posting_review: '공고 작성 - 검토 및 게시',
  document_review: '서류 평가 목록',
  document_evaluation: '서류 평가',
  document_result: '서류 평가 취합',
  interview_timetable: '면접 타임테이블',
} satisfies Record<ScenarioStep, string>

const SCENARIO_ACTION_LABEL: Partial<Record<string, string>> = {
  home_new_posting: '새 공고 만들기',
  start_interview_option: '면접 여부 선택',
  start_next: '면접 여부 다음',
  posting_image_upload: '대표 이미지 업로드',
  posting_next: '다음',
  question_template_open: '템플릿으로 추가 열기',
  question_template_select: '템플릿 선택',
  posting_publish_open: '공고 게시',
  posting_publish_confirm: '게시하기',
  doc_applicant_select: '평가할 지원자 선택',
  doc_opinion: '의견 선택',
  doc_score: '점수 선택',
  doc_save: '평가 저장',
  doc_result_change: '최종 결과 변경',
  doc_result_confirm_open: '결과 확정하기',
  doc_result_confirm: '결과 확정',
  timetable_unassigned_select: '미배정 지원자 선택',
  timetable_slot_assign: '빈 시간에 배치',
  timetable_confirm_open: '타임테이블 확정하기',
  timetable_confirm: '타임테이블 확정',
  timetable_location_open: '장소 한 번에 입력',
  timetable_location_apply: '최근 쓴 장소 선택',
  timetable_notice: '서류 결과 및 면접 정보 안내하기',
}

function getStepLabel(step: ScenarioStep) {
  return SCENARIO_STEP_LABEL[step]
}

// 표에 없는 새 행동은 영어 이름 그대로
function getActionLabel(action: string) {
  return SCENARIO_ACTION_LABEL[action] ?? action
}

export { getActionLabel, getStepLabel }
