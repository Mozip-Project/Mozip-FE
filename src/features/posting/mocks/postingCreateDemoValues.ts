import {
  EMPTY_POSTING_CREATE,
  type PostingCreateValues,
} from '@/features/posting/schemas/postingCreateValues'
import { TIMETABLE_SLOT_TIMES, toSlotKey } from '@/features/posting/utils/interviewTimetable'
import { addDaysToIsoDate } from '@/utils/date'

// 전시회 시연용 공고 작성 기본값. NEXT_PUBLIC_POSTING_DEMO_MODE를 켤 때만 사용하고 전시회 후 이 파일과 호출부 삭제

// 오늘 기준 일정, 면접 공고는 서류 발표 다음 날부터 최종 발표 전날까지 면접
const DEMO_SCHEDULE_DAYS = {
  recruitEnd: 7,
  documentResult: 9,
  finalResult: 14,
  activityStart: 30,
  activityEnd: 180,
}
const DEMO_INTERVIEW_DAYS = [10, 11]
const DEMO_INTERVIEW_HOURS = { start: '14:00', end: '17:00' }

const DEMO_CONTENT_HTML = [
  '<p>안녕하세요! 디자인과 개발을 좋아하는 사람들이 모인 동아리예요 🙌</p>',
  '<p>매주 목요일 저녁에 모여 작은 프로젝트를 만들고, 끝나면 맛있는 걸 먹으러 가요 🍕</p>',
  '<p>잘하지 않아도 괜찮아요. 함께 배우고 싶은 마음만 챙겨 오세요!</p>',
].join('')

const DEMO_POSITION_NAMES = ['기획', '디자인', '프론트엔드', '백엔드']

function getDemoSlotKeys(dates: string[]) {
  const times = TIMETABLE_SLOT_TIMES.filter(
    (time) => time >= DEMO_INTERVIEW_HOURS.start && time < DEMO_INTERVIEW_HOURS.end,
  )
  return dates.flatMap((date) => times.map((time) => toSlotKey(date, time)))
}

// 제목과 대표 이미지는 시연하는 사람이 직접 입력, 지원서 문항은 템플릿으로 추가
function createDemoPostingValues(hasInterview: boolean, today: string): PostingCreateValues {
  const afterDays = (days: number) => addDaysToIsoDate(today, days)
  const interviewDates = DEMO_INTERVIEW_DAYS.map(afterDays)

  return {
    ...EMPTY_POSTING_CREATE,
    publicItems: ['region', 'fee'],
    region: '서울 지역',
    fee: '20000',
    qualifications: ['student', 'leaveOfAbsence'],
    content: DEMO_CONTENT_HTML,
    recruitStartDate: today,
    recruitEndDate: afterDays(DEMO_SCHEDULE_DAYS.recruitEnd),
    documentResultDate: hasInterview ? afterDays(DEMO_SCHEDULE_DAYS.documentResult) : null,
    finalResultDate: afterDays(DEMO_SCHEDULE_DAYS.finalResult),
    activityStartDate: afterDays(DEMO_SCHEDULE_DAYS.activityStart),
    activityEndDate: afterDays(DEMO_SCHEDULE_DAYS.activityEnd),
    recruitType: 'position',
    positions: DEMO_POSITION_NAMES.map((name) => ({ name })),
    ...(hasInterview && {
      interviewDuration: '30',
      interviewBreak: '10',
      interviewDates,
      interviewSlots: getDemoSlotKeys(interviewDates),
      interviewApplicantCount: '2',
      interviewRoomCount: '2',
    }),
  }
}

export { createDemoPostingValues }
