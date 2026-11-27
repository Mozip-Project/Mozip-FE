import type {
  InterviewTimetable,
  TimetableApplicant,
  TimetableInterview,
  TimetableInterviewer,
} from '@/features/recruitment/types'

const DAY_1 = '2026-10-21'
const DAY_2 = '2026-10-22'
const DAY_3 = '2026-10-23'

const TIMES = ['13:00', '13:25', '13:50', '14:15', '14:40', '15:05', '15:30']

type SampleAssignment = [
  id: string,
  name: string,
  positionName: string,
  date: string,
  time: string,
  track: number,
]

// Figma 면접 타임테이블 기본 화면(4312:149251)과 같은 배정
const SAMPLE_ASSIGNMENTS: SampleAssignment[] = [
  ['applicant-1', '서하린', '기획', DAY_1, '13:00', 1],
  ['applicant-2', '백도윤', '개발', DAY_1, '13:00', 2],
  ['applicant-3', '유채원', '디자인', DAY_1, '13:25', 1],
  ['applicant-4', '권지호', '개발', DAY_1, '13:50', 2],
  ['applicant-5', '신예린', '디자인', DAY_1, '14:15', 1],
  ['applicant-6', '조은우', '기획', DAY_1, '14:40', 2],
  ['applicant-7', '김모집', '디자인', DAY_2, '13:00', 1],
  ['applicant-8', '이지원', '개발', DAY_2, '13:00', 2],
  ['applicant-9', '정세나', '디자인', DAY_2, '13:25', 1],
  ['applicant-10', '한결', '개발', DAY_2, '13:25', 2],
  ['applicant-11', '오다은', '기획', DAY_2, '14:15', 1],
  ['applicant-12', '박서윤', '개발', DAY_2, '14:15', 2],
  ['applicant-13', '윤가람', '개발', DAY_2, '14:40', 1],
  ['applicant-14', '장민', '디자인', DAY_2, '14:40', 2],
  ['applicant-15', '강하늘', '기획', DAY_2, '15:05', 2],
  ['applicant-16', '송이', '디자인', DAY_2, '15:30', 1],
  ['applicant-17', '홍시우', '개발', DAY_3, '13:00', 1],
  ['applicant-18', '배나연', '디자인', DAY_3, '13:25', 2],
  ['applicant-19', '류건', '기획', DAY_3, '13:50', 1],
  ['applicant-20', '표하은', '개발', DAY_3, '14:40', 2],
  ['applicant-21', '탁윤서', '디자인', DAY_3, '15:05', 1],
  ['applicant-22', '진서준', '기획', DAY_3, '15:30', 2],
]

const UNASSIGNED_APPLICANTS: TimetableApplicant[] = [
  {
    id: 'applicant-23',
    name: '최두리',
    positionName: '개발',
    availableTimes: [
      { date: DAY_1, time: '15:05' },
      { date: DAY_2, time: '13:50' },
    ],
  },
  {
    id: 'applicant-24',
    name: '임하윤',
    positionName: '개발',
    availableTimes: [
      { date: DAY_2, time: '13:25' },
      { date: DAY_3, time: '14:15' },
    ],
  },
  {
    id: 'applicant-25',
    name: '문서아',
    positionName: '디자인',
    availableTimes: [
      { date: DAY_2, time: '13:50' },
      { date: DAY_2, time: '15:30' },
    ],
  },
]

const SAMPLE_TIMETABLE_APPLICANTS: TimetableApplicant[] = [
  ...SAMPLE_ASSIGNMENTS.map(([id, name, positionName, date, time]) => ({
    id,
    name,
    positionName,
    availableTimes: [{ date, time }],
  })),
  ...UNASSIGNED_APPLICANTS,
]

const SAMPLE_TIMETABLE_INTERVIEWERS: TimetableInterviewer[] = [
  { id: 'member-1', name: '김하준', teamName: '디자인팀', isRepresentative: true },
  { id: 'member-2', name: '최서연', teamName: '기획팀', isRepresentative: false },
  { id: 'member-3', name: '이도현', teamName: '기획팀', isRepresentative: false },
  { id: 'member-4', name: '정다은', teamName: '디자인팀', isRepresentative: false },
  { id: 'member-5', name: '박지훈', teamName: '개발팀', isRepresentative: false },
  { id: 'member-6', name: '도하늘', teamName: '개발팀', isRepresentative: false },
  { id: 'member-7', name: '윤서아', teamName: '개발팀', isRepresentative: false },
  { id: 'member-8', name: '오민재', teamName: '개발팀', isRepresentative: false },
  { id: 'member-9', name: '한유진', teamName: '디자인팀', isRepresentative: false },
  { id: 'member-10', name: '나지우', teamName: '기획팀', isRepresentative: false },
]

const SAMPLE_INTERVIEWS: TimetableInterview[] = SAMPLE_ASSIGNMENTS.map(
  ([applicantId, , , date, time, track]) => ({
    id: `interview-${applicantId}`,
    date,
    time,
    track,
    applicantIds: [applicantId],
    interviewerIds: [],
  }),
)

const SAMPLE_INTERVIEW_TIMETABLE: InterviewTimetable = {
  days: [DAY_1, DAY_2, DAY_3].map((date) => ({ date, times: TIMES, trackCount: 2 })),
  interviews: SAMPLE_INTERVIEWS,
  unassignedApplicantIds: UNASSIGNED_APPLICANTS.map(({ id }) => id),
}

const SAMPLE_INTERVIEW_RULE = { interviewMinutes: 20, breakMinutes: 5 }

export {
  SAMPLE_INTERVIEW_RULE,
  SAMPLE_INTERVIEW_TIMETABLE,
  SAMPLE_TIMETABLE_APPLICANTS,
  SAMPLE_TIMETABLE_INTERVIEWERS,
}
