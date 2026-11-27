import { describe, expect, it } from 'vitest'
import {
  EMPTY_POSTING_CREATE,
  type PostingCreateValues,
} from '@/features/posting/schemas/postingCreateValues'
import {
  formatRecruitStart,
  getPostingInfoRows,
  getQualificationText,
  getScheduleItems,
} from './postingReview'

const VALUES: PostingCreateValues = {
  ...EMPTY_POSTING_CREATE,
  title: ' UXUX 14기 신입 부원 모집 ',
  publicItems: ['region', 'fee'],
  region: '신촌, 온라인 병행',
  fee: '30000',
  qualifications: ['student', 'leaveOfAbsence', 'custom'],
  customQualification: '1~3학년, 졸업 예정자 가능',
  recruitStartDate: '2026-10-01',
  recruitEndDate: '2026-10-15',
  documentResultDate: '2026-10-18',
  finalResultDate: '2026-10-27',
  interviewDates: ['2026-10-21', '2026-10-22', '2026-10-23'],
}

describe('postingReview', () => {
  it('지원 자격은 선택 항목을 /로 잇고 직접 입력은 괄호, 직접 입력만이면 그 문구', () => {
    expect(getQualificationText(['student', 'leaveOfAbsence', 'custom'], '1~3학년')).toBe(
      '대학생/휴학생 (1~3학년)',
    )
    expect(getQualificationText(['custom'], ' 누구나 ')).toBe('누구나')
    expect(getQualificationText(['student'], '무시')).toBe('대학생')
  })

  it('공고 정보는 공개하기로 한 항목만', () => {
    expect(getPostingInfoRows(VALUES)).toEqual([
      { label: '공고명', value: 'UXUX 14기 신입 부원 모집' },
      { label: '활동 지역', value: '신촌, 온라인 병행' },
      { label: '회비', value: '30,000원' },
      { label: '지원 자격', value: '대학생/휴학생 (1~3학년, 졸업 예정자 가능)' },
    ])
    expect(getPostingInfoRows({ ...VALUES, publicItems: [] }).map(({ label }) => label)).toEqual([
      '공고명',
      '지원 자격',
    ])
  })

  it('면접 공고는 모집·서류 결과·면접·최종 발표, 비면접은 모집·최종 발표', () => {
    expect(getScheduleItems(VALUES, true)).toEqual([
      { label: '모집', value: '10/1 (목) ~ 10/15 (목)', caption: '23:59 마감' },
      { label: '서류 결과 발표', value: '10/18 (일)' },
      { label: '면접', value: '10/21 (수) ~ 10/23 (금)' },
      { label: '최종 발표', value: '10/27 (화)' },
    ])
    expect(getScheduleItems(VALUES, false).map(({ label }) => label)).toEqual(['모집', '최종 발표'])
    expect(getScheduleItems({ ...VALUES, interviewDates: ['2026-10-21'] }, true)[2]?.value).toBe(
      '10/21 (수)',
    )
  })

  it('게시 안내 시작 일시는 시간 미선택이면 00:00', () => {
    expect(formatRecruitStart('2026-10-01', null)).toBe('10/1(목) 00:00')
    expect(formatRecruitStart('2026-10-01', '09:30')).toBe('10/1(목) 09:30')
  })
})
