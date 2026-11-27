/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type ActivityField =
  | 'ACHIEVEMENT'
  /** 활동명. 끄면 접힌 제목이 '활동 경험 1, 2...'로 고정 */
  | 'NAME'
  /** 활동 기간 YYYY.MM ~ YYYY.MM */
  | 'PERIOD'
  | 'ROLE';

export type AnswerInput = {
  attachments?: Array<AttachmentInput> | null | undefined;
  /** TEXT는 입력 그대로, ACTIVITY는 JSON 문자열 */
  content?: string | null | undefined;
  questionId: string | number;
};

export type ApplicationInput = {
  answers: Array<AnswerInput>;
  /** 면접 있는 공고만 */
  availableTimes?: Array<string> | null | undefined;
  positionId?: string | number | null | undefined;
};

export type ApplicationSort =
  | 'NAME_ASC'
  | 'NAME_DESC'
  | 'SUBMITTED_ASC'
  | 'SUBMITTED_DESC';

/** 지원서, 답변, 첨부 */
export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED';

/** 면접관 자동 배정 기준 (포지션 없는 모집은 자동 배정 없이 직접 추가) */
export type AssignRule =
  /** 팀 상관없이 운영진 전체 */
  | 'ALL_MEMBERS'
  /** 지원 포지션과 같은 팀 운영진 */
  | 'SAME_TEAM';

/** 명세에 정의 없이 'fileKey 또는 url'만 있어 두 필드로 둠, 백엔드 확인 필요 */
export type AttachmentInput = {
  fileKey?: string | null | undefined;
  url?: string | null | undefined;
};

export type AttachmentType =
  | 'FILE'
  | 'LINK';

export type ChangePasswordInput = {
  currentPassword: string;
  /** 회원가입과 같은 규칙 (8~64자, 영문+숫자) */
  newPassword: string;
};

export type DocEvaluationTab =
  | 'ALL'
  /** 내 평가가 SAVED */
  | 'EVALUATED'
  /** 내 평가가 NONE 또는 DRAFT */
  | 'NOT_EVALUATED';

export type DocResult =
  | 'FAIL'
  /** 보류 (남아 있으면 결과 확정 불가) */
  | 'HOLD'
  | 'PASS'
  /** 평가가 다 끝나지 않아 선택 불가 */
  | 'PENDING';

export type DocResultTab =
  /** PENDING 포함 */
  | 'ALL'
  | 'FAIL'
  | 'HOLD'
  | 'PASS';

export type DocScoreInput = {
  /** 그 지원서 포지션에 적용되는 문항만 */
  questionId: string | number;
  /** 1~5 */
  score: number;
};

export type DocSummarySort =
  | 'NAME_ASC'
  | 'NAME_DESC'
  /** 점수 안 쓰는 공고 기본 */
  | 'PASS_OPINION_DESC'
  | 'SCORE_ASC'
  | 'SCORE_DESC';

export type EmailWarning =
  /** 연락 이메일 없음 */
  | 'MISSING'
  /** 흔한 도메인과 편집 거리 1 이내 */
  | 'SUSPICIOUS_DOMAIN';

export type FileType =
  | 'IMAGE'
  | 'MP4'
  | 'PDF'
  | 'PPT';

export type FinalResult =
  | 'FAIL'
  | 'PASS'
  | 'PENDING';

export type InterviewMethod =
  | 'ONLINE'
  | 'ONSITE';

export type InterviewTimeRangeInput = {
  closedSlots?: Array<string> | null | undefined;
  date: string;
  endTime: string;
  /** null = 포지션 없는 모집 또는 전체 공통 */
  positionId?: string | number | null | undefined;
  startTime: string;
};

export type MemberRole =
  | 'OPERATOR'
  | 'REPRESENTATIVE';

export type MessageDeliveryStatus =
  | 'FAILED'
  | 'PENDING'
  | 'SUCCESS';

export type MessageStatus =
  | 'DRAFT'
  | 'SENDING'
  | 'SENT';

export type MessageTarget =
  | 'ALL'
  | 'FAIL'
  | 'PASS';

/** 지원자 안내 메시지 (공지, 결과 발표), 메일 발송 내역 */
export type MessageType =
  | 'DOC_RESULT'
  | 'FINAL_RESULT'
  | 'INTERVIEW'
  | 'NOTICE';

export type MessageVariable =
  | 'INTERVIEW_AT'
  | 'INTERVIEW_LOCATION'
  | 'INTERVIEW_PERIOD'
  | 'NAME'
  /** 포지션 없는 모집은 안 줌 */
  | 'POSITION';

export type MyDocEvaluationStatus =
  /** 자동 저장만 됨, 목록에서는 평가 전 */
  | 'DRAFT'
  | 'NONE'
  | 'SAVED';

/** 보내지 않은 필드는 그대로 유지 */
export type NotificationSettingsInput = {
  marketingAgreed?: boolean | null | undefined;
  notifyOperator?: boolean | null | undefined;
  notifyResult?: boolean | null | undefined;
  notifyScrap?: boolean | null | undefined;
};

/** 알림 탭(지원자/운영진), 알림 설정 토글, 출처 라벨, 이동 화면을 type으로 정함 */
export type NotificationType =
  | 'DOC_RESULT'
  | 'EVALUATION_DEADLINE'
  | 'EVALUATION_REQUEST'
  | 'FINAL_RESULT'
  | 'INTERVIEW_RESELECT'
  | 'INVITATION'
  | 'POSTING_NOTICE'
  | 'SCRAP_OPEN'
  | 'TRANSFER_APPROVED'
  | 'TRANSFER_REJECTED'
  | 'TRANSFER_REQUEST';

/** 평가 의견 (서류, 면접 공통) */
export type Opinion =
  | 'FAIL'
  | 'HOLD'
  | 'PASS';

export type OrganizationField =
  | 'ACADEMIC_STUDY'
  | 'CULTURE_HOBBY'
  | 'DESIGN_MEDIA'
  | 'ETC'
  | 'IT_DEV'
  | 'LANGUAGE_GLOBAL'
  | 'PERFORMANCE_MUSIC'
  | 'RELIGION'
  | 'SPORTS'
  | 'STARTUP_BUSINESS'
  | 'VOLUNTEER';

export type OrganizationLinkInput = {
  /** http, https만, 500자까지. type은 서버가 도메인으로 판별 */
  url: string;
};

/** 교내 / 연합 (연합이면 학교 없음) */
export type OrganizationScope =
  | 'CAMPUS'
  | 'UNION';

/** 단체, 팀, 운영진, 초대, 대표자 인수 */
export type OrganizationType =
  | 'ACADEMIC'
  | 'CLUB'
  | 'STUDENT_COUNCIL';

export type PositionInput = {
  /** null = 모집 인원 미정, 1 이상 */
  headcount?: number | null | undefined;
  /** 최대 50자 */
  name: string;
  sortOrder: number;
  teamId?: string | number | null | undefined;
};

/**
 * 보내지 않거나 null이면 기존 값 유지
 * 단, semester·region·fee·eligibilityNote·activityStartedOn·activityEndedOn은 생략하면 유지, null이면 지움
 */
export type PostingDraftInput = {
  activityEndedOn?: string | null | undefined;
  activityStartedOn?: string | null | undefined;
  allowEnrolled?: boolean | null | undefined;
  allowOnLeave?: boolean | null | undefined;
  assignRule?: AssignRule | null | undefined;
  /** 0분 이상 */
  breakMinutes?: number | null | undefined;
  content?: string | null | undefined;
  docScorePerQuestion?: boolean | null | undefined;
  /** 최대 200자 */
  eligibilityNote?: string | null | undefined;
  /** 최대 50자 */
  fee?: string | null | undefined;
  hasInterview?: boolean | null | undefined;
  /** 최대 5장, 통째로 교체 */
  images?: Array<PostingImageInput> | null | undefined;
  interviewMethod?: InterviewMethod | null | undefined;
  /** 1분 이상 */
  interviewMinutes?: number | null | undefined;
  /** 통째로 교체, 같은 날짜 안에서 겹치면 COMMON_400 */
  interviewTimeRanges?: Array<InterviewTimeRangeInput> | null | undefined;
  /** 1명 이상 */
  maxApplicantsPerInterview?: number | null | undefined;
  /** 1개 이상 */
  maxParallelInterviews?: number | null | undefined;
  noPosition?: boolean | null | undefined;
  /** 통째로 교체, 저장할 때마다 포지션 id가 새로 생김 */
  positions?: Array<PositionInput> | null | undefined;
  /** 통째로 교체 */
  questions?: Array<QuestionInput> | null | undefined;
  recruitEndAt?: string | null | undefined;
  recruitStartAt?: string | null | undefined;
  /** 최대 100자 */
  region?: string | null | undefined;
  /** 최대 20자 */
  semester?: string | null | undefined;
  /** 최대 100자 */
  title?: string | null | undefined;
};

export type PostingFilter = {
  /** 마감 3일 이내 */
  closingSoon?: boolean | null | undefined;
  fields?: Array<string> | null | undefined;
  hasInterview?: boolean | null | undefined;
  keyword?: string | null | undefined;
  organizationTypes?: Array<OrganizationType> | null | undefined;
  schoolId?: string | number | null | undefined;
};

export type PostingImageInput = {
  /** presigned-url 업로드 응답의 fileKey */
  fileKey: string;
  /** 여러 장에 true면 COMMON_400, 하나도 없으면 첫 번째 사진 */
  isRepresentative?: boolean | null | undefined;
  sortOrder: number;
};

export type PostingSort =
  | 'CLOSING_SOON'
  | 'LATEST'
  | 'POPULAR';

/** 비면접 공고는 INTERVIEW 단계를 건너뜀 */
export type PostingStatus =
  | 'DOC_RESULT_NOTICE'
  | 'DOC_REVIEW'
  | 'DRAFT'
  | 'ENDED'
  | 'FINAL_RESULT'
  | 'INTERVIEW'
  | 'RECRUITING';

export type QuestionInput = {
  /** 최대 500자 */
  description?: string | null | undefined;
  /** TEXT 글자 수 제한, 1 이상 */
  maxLength?: number | null | undefined;
  options?: QuestionOptionsInput | null | undefined;
  /** null = 공통 문항, 같은 저장 이후의 포지션 id */
  positionId?: string | number | null | undefined;
  required: boolean;
  sortOrder: number;
  /** 최대 200자 */
  title: string;
  type: QuestionType;
};

/** 해당 유형 값만 채움 */
export type QuestionOptionsInput = {
  choices?: Array<string> | null | undefined;
  columns?: Array<string> | null | undefined;
  maxFiles?: number | null | undefined;
  maxRows?: number | null | undefined;
};

export type QuestionType =
  | 'ACTIVITY'
  | 'FILE_LINK'
  | 'MULTI_CHOICE'
  | 'SINGLE_CHOICE'
  | 'TABLE'
  | 'TEXT';

export type ReportReason =
  | 'ETC'
  | 'EXCESSIVE_PERSONAL_INFO'
  | 'FALSE_INFO'
  | 'INAPPROPRIATE';

/** 로그인 후 이동할 홈 */
export type Role =
  | 'APPLICANT'
  | 'OPERATOR';

export type SaveDocEvaluationInput = {
  applicationId: string | number;
  /** 최대 300자 */
  memo?: string | null | undefined;
  /** submit true면 필수 */
  opinion?: Opinion | null | undefined;
  /** posting.docScorePerQuestion = true일 때만, submit true면 전 문항 필수 */
  scores?: Array<DocScoreInput> | null | undefined;
};

export type UpdateOrganizationInput = {
  /** 학생회는 빈 배열 */
  fields: Array<OrganizationField>;
  /** 1~10개, 중복 제거 */
  keywords: Array<string>;
  /** 1개 이상 */
  links: Array<OrganizationLinkInput>;
  /** 업로드한 fileUrl, null·빈 문자열이면 기본 이미지로 초기화. 기존 로고를 유지하려면 그 주소를 다시 보냄 */
  logoUrl?: string | null | undefined;
  /** 최대 40자 */
  tagline: string;
};

export type UpdateProfileInput = {
  birthYear?: number | null | undefined;
  /** 아래 4개는 지원자 프로필용, 정보 수정 화면에는 없음 */
  email?: string | null | undefined;
  grade?: number | null | undefined;
  major?: string | null | undefined;
  name?: string | null | undefined;
  /** 로그인 ID가 바뀜 */
  phone?: string | null | undefined;
  /** 업로드한 파일 URL, 빈 문자열이면 기본 아바타 */
  profileImageUrl?: string | null | undefined;
};

export type NotificationsQueryVariables = Exact<{
  role?: Role | null | undefined;
  page?: number | null | undefined;
  size?: number | null | undefined;
}>;


export type NotificationsQuery = { notifications: Array<{ id: string, type: NotificationType, title: string, linkUrl: string | null, isRead: boolean, createdAt: string, organization: { name: string } | null }> };

export type NotificationUnreadCountQueryVariables = Exact<{ [key: string]: never; }>;


export type NotificationUnreadCountQuery = { me: { id: string, unreadNotificationCount: number } };

export type MarkNotificationsReadMutationVariables = Exact<{
  ids: Array<string | number> | string | number;
}>;


export type MarkNotificationsReadMutation = { markNotificationsRead: boolean };

export type OrganizationMembersQueryVariables = Exact<{
  organizationId: string | number;
}>;


export type OrganizationMembersQuery = { members: Array<{ id: string, role: MemberRole, createdAt: string, user: { id: string, name: string }, team: { name: string } | null }> };

export type OrganizationProfileFieldsFragment = { id: string, name: string, type: OrganizationType, scope: OrganizationScope, logoUrl: string | null, tagline: string | null, fields: Array<OrganizationField>, keywords: Array<string>, school: { name: string } | null, links: Array<{ id: string, url: string }> };

export type OrganizationProfileQueryVariables = Exact<{
  id: string | number;
}>;


export type OrganizationProfileQuery = { organization: { id: string, name: string, type: OrganizationType, scope: OrganizationScope, logoUrl: string | null, tagline: string | null, fields: Array<OrganizationField>, keywords: Array<string>, school: { name: string } | null, links: Array<{ id: string, url: string }> } };

export type UpdateOrganizationMutationVariables = Exact<{
  id: string | number;
  input: UpdateOrganizationInput;
}>;


export type UpdateOrganizationMutation = { updateOrganization: { id: string, name: string, type: OrganizationType, scope: OrganizationScope, logoUrl: string | null, tagline: string | null, fields: Array<OrganizationField>, keywords: Array<string>, school: { name: string } | null, links: Array<{ id: string, url: string }> } };

export type KeywordSuggestionsQueryVariables = Exact<{
  query: string;
}>;


export type KeywordSuggestionsQuery = { keywordSuggestions: Array<string> };

export type ReportPostingMutationVariables = Exact<{
  postingId: string | number;
  reason: ReportReason;
  detail?: string | null | undefined;
}>;


export type ReportPostingMutation = { reportPosting: boolean };

export type PostingsQueryVariables = Exact<{
  filter?: PostingFilter | null | undefined;
  sort?: PostingSort | null | undefined;
  page?: number | null | undefined;
  size?: number | null | undefined;
}>;


export type PostingsQuery = { postings: { totalCount: number, items: Array<{ id: string, title: string, thumbnailUrl: string | null, recruitEndAt: string, organization: { name: string, type: OrganizationType }, positions: Array<{ id: string, name: string, sortOrder: number } | null> }> } };

export type PostingQueryVariables = Exact<{
  id: string | number;
}>;


export type PostingQuery = { posting: { id: string, title: string, content: string | null, noPosition: boolean, hasInterview: boolean, allowEnrolled: boolean, allowOnLeave: boolean, eligibilityNote: string | null, region: string | null, fee: string | null, recruitStartAt: string | null, recruitEndAt: string | null, docResultAt: string | null, finalResultAt: string | null, images: Array<{ url: string, isRepresentative: boolean, sortOrder: number }>, positions: Array<{ id: string, name: string, sortOrder: number }>, questions: Array<{ id: string, title: string, sortOrder: number, position: { id: string } | null }>, interviewTimeRanges: Array<{ date: string }>, organization: { name: string, type: OrganizationType, logoUrl: string | null, tagline: string | null, keywords: Array<string>, fields: Array<OrganizationField>, links: Array<{ id: string, url: string }> }, otherActivePostings: Array<{ id: string, title: string, recruitStartAt: string | null, recruitEndAt: string | null }> } };

export type PostingDetailFieldsFragment = { id: string, title: string, content: string | null, noPosition: boolean, hasInterview: boolean, allowEnrolled: boolean, allowOnLeave: boolean, eligibilityNote: string | null, region: string | null, fee: string | null, recruitStartAt: string | null, recruitEndAt: string | null, docResultAt: string | null, finalResultAt: string | null, images: Array<{ url: string, isRepresentative: boolean, sortOrder: number }>, positions: Array<{ id: string, name: string, sortOrder: number }>, questions: Array<{ id: string, title: string, sortOrder: number, position: { id: string } | null }>, interviewTimeRanges: Array<{ date: string }>, organization: { name: string, type: OrganizationType, logoUrl: string | null, tagline: string | null, keywords: Array<string>, fields: Array<OrganizationField>, links: Array<{ id: string, url: string }> }, otherActivePostings: Array<{ id: string, title: string, recruitStartAt: string | null, recruitEndAt: string | null }> };

export type DemoServerOrganizationPostingsQueryVariables = Exact<{
  organizationId: string | number;
}>;


export type DemoServerOrganizationPostingsQuery = { organizationPostings: Array<{ id: string, title: string, status: PostingStatus, hasInterview: boolean, publishedAt: string | null, recruitEndAt: string | null, docResultConfirmedAt: string | null, docResultAt: string | null, finalResultAt: string | null }> };

export type DemoServerDeletePostingMutationVariables = Exact<{
  id: string | number;
}>;


export type DemoServerDeletePostingMutation = { deletePosting: boolean };

export type DemoServerPostingDetailQueryVariables = Exact<{
  id: string | number;
}>;


export type DemoServerPostingDetailQuery = { posting: { id: string, title: string, content: string | null, noPosition: boolean, hasInterview: boolean, allowEnrolled: boolean, allowOnLeave: boolean, eligibilityNote: string | null, region: string | null, fee: string | null, recruitStartAt: string | null, recruitEndAt: string | null, docResultAt: string | null, finalResultAt: string | null, images: Array<{ url: string, isRepresentative: boolean, sortOrder: number }>, positions: Array<{ id: string, name: string, sortOrder: number }>, questions: Array<{ id: string, title: string, sortOrder: number, position: { id: string } | null }>, interviewTimeRanges: Array<{ date: string }>, organization: { id: string, name: string, type: OrganizationType, logoUrl: string | null, tagline: string | null, keywords: Array<string>, fields: Array<OrganizationField>, links: Array<{ id: string, url: string }> } } };

export type ManagedPostingFieldsFragment = { id: string, title: string, status: PostingStatus, hasInterview: boolean, publishedAt: string | null, recruitEndAt: string | null, docResultConfirmedAt: string | null, docResultAt: string | null, finalResultAt: string | null, bumpRank: number | null };

export type OrganizationPostingsQueryVariables = Exact<{
  organizationId: string | number;
  status?: Array<PostingStatus> | PostingStatus | null | undefined;
}>;


export type OrganizationPostingsQuery = { organizationPostings: Array<{ id: string, title: string, status: PostingStatus, hasInterview: boolean, publishedAt: string | null, recruitEndAt: string | null, docResultConfirmedAt: string | null, docResultAt: string | null, finalResultAt: string | null, bumpRank: number | null }> };

export type ManagedPostingSummaryQueryVariables = Exact<{
  organizationId: string | number;
}>;


export type ManagedPostingSummaryQuery = { organization: { id: string, upCredits: number, postingCounts: { published: number, draft: number, ended: number } } };

export type ManagedPostingDetailQueryVariables = Exact<{
  id: string | number;
}>;


export type ManagedPostingDetailQuery = { posting: { applicationCount: number, id: string, title: string, content: string | null, noPosition: boolean, hasInterview: boolean, allowEnrolled: boolean, allowOnLeave: boolean, eligibilityNote: string | null, region: string | null, fee: string | null, recruitStartAt: string | null, recruitEndAt: string | null, docResultAt: string | null, finalResultAt: string | null, organization: { id: string, name: string, type: OrganizationType, logoUrl: string | null, tagline: string | null, keywords: Array<string>, fields: Array<OrganizationField>, links: Array<{ id: string, url: string }> }, images: Array<{ url: string, isRepresentative: boolean, sortOrder: number }>, positions: Array<{ id: string, name: string, sortOrder: number }>, questions: Array<{ id: string, title: string, sortOrder: number, position: { id: string } | null }>, interviewTimeRanges: Array<{ date: string }>, otherActivePostings: Array<{ id: string, title: string, recruitStartAt: string | null, recruitEndAt: string | null }> } };

export type SendNoticeMutationVariables = Exact<{
  postingId: string | number;
  subject: string;
  body: string;
}>;


export type SendNoticeMutation = { sendNotice: { id: string } };

export type BumpPostingMutationVariables = Exact<{
  id: string | number;
}>;


export type BumpPostingMutation = { bumpPosting: { id: string, bumpRank: number | null } };

export type DeletePostingMutationVariables = Exact<{
  id: string | number;
}>;


export type DeletePostingMutation = { deletePosting: boolean };

export type PostingDraftFieldsFragment = { id: string, status: PostingStatus, hasInterview: boolean, updatedAt: string, title: string, region: string | null, fee: string | null, allowEnrolled: boolean, allowOnLeave: boolean, eligibilityNote: string | null, content: string | null, recruitStartAt: string | null, recruitEndAt: string | null, activityStartedOn: string | null, activityEndedOn: string | null, noPosition: boolean, interviewMinutes: number | null, breakMinutes: number | null, maxApplicantsPerInterview: number | null, maxParallelInterviews: number | null, organization: { id: string }, images: Array<{ id: string, url: string, isRepresentative: boolean, sortOrder: number }>, positions: Array<{ id: string, name: string, sortOrder: number }>, questions: Array<{ id: string, type: QuestionType, title: string, description: string | null, required: boolean, maxLength: number | null, sortOrder: number, position: { id: string } | null }>, interviewTimeRanges: Array<{ id: string, date: string, startTime: string, endTime: string }> };

export type PostingDraftQueryVariables = Exact<{
  id: string | number;
}>;


export type PostingDraftQuery = { posting: { id: string, status: PostingStatus, hasInterview: boolean, updatedAt: string, title: string, region: string | null, fee: string | null, allowEnrolled: boolean, allowOnLeave: boolean, eligibilityNote: string | null, content: string | null, recruitStartAt: string | null, recruitEndAt: string | null, activityStartedOn: string | null, activityEndedOn: string | null, noPosition: boolean, interviewMinutes: number | null, breakMinutes: number | null, maxApplicantsPerInterview: number | null, maxParallelInterviews: number | null, organization: { id: string }, images: Array<{ id: string, url: string, isRepresentative: boolean, sortOrder: number }>, positions: Array<{ id: string, name: string, sortOrder: number }>, questions: Array<{ id: string, type: QuestionType, title: string, description: string | null, required: boolean, maxLength: number | null, sortOrder: number, position: { id: string } | null }>, interviewTimeRanges: Array<{ id: string, date: string, startTime: string, endTime: string }> } };

export type SavePostingDraftMutationVariables = Exact<{
  organizationId: string | number;
  id?: string | number | null | undefined;
  input: PostingDraftInput;
}>;


export type SavePostingDraftMutation = { savePostingDraft: { id: string, status: PostingStatus, hasInterview: boolean, updatedAt: string, title: string, region: string | null, fee: string | null, allowEnrolled: boolean, allowOnLeave: boolean, eligibilityNote: string | null, content: string | null, recruitStartAt: string | null, recruitEndAt: string | null, activityStartedOn: string | null, activityEndedOn: string | null, noPosition: boolean, interviewMinutes: number | null, breakMinutes: number | null, maxApplicantsPerInterview: number | null, maxParallelInterviews: number | null, organization: { id: string }, images: Array<{ id: string, url: string, isRepresentative: boolean, sortOrder: number }>, positions: Array<{ id: string, name: string, sortOrder: number }>, questions: Array<{ id: string, type: QuestionType, title: string, description: string | null, required: boolean, maxLength: number | null, sortOrder: number, position: { id: string } | null }>, interviewTimeRanges: Array<{ id: string, date: string, startTime: string, endTime: string }> } };

export type PublishPostingMutationVariables = Exact<{
  id: string | number;
}>;


export type PublishPostingMutation = { publishPosting: { id: string, status: PostingStatus } };

export type PostingApplicationFormQueryVariables = Exact<{
  id: string | number;
}>;


export type PostingApplicationFormQuery = { posting: { id: string, title: string, noPosition: boolean, hasInterview: boolean, profilePhotoRequired: boolean, positions: Array<{ id: string, name: string, sortOrder: number }>, questions: Array<{ id: string, type: QuestionType, title: string, description: string | null, required: boolean, maxLength: number | null, sortOrder: number, position: { id: string } | null, options: { activityFields: Array<ActivityField> | null, maxEntries: number | null, acceptFile: boolean | null, acceptLink: boolean | null, fileTypes: Array<FileType> | null } | null }>, interviewTimeRanges: Array<{ date: string, startTime: string, endTime: string, closedSlots: Array<string>, position: { id: string } | null }> } };

export type SaveApplicationDraftMutationVariables = Exact<{
  postingId: string | number;
  input: ApplicationInput;
}>;


export type SaveApplicationDraftMutation = { saveApplicationDraft: { id: string, updatedAt: string } };

export type SubmitApplicationMutationVariables = Exact<{
  id: string | number;
}>;


export type SubmitApplicationMutation = { submitApplication: { id: string } };

export type PostingMyApplicationsQueryVariables = Exact<{
  id: string | number;
}>;


export type PostingMyApplicationsQuery = { posting: { id: string, myApplications: Array<{ id: string, submittedAt: string | null, updatedAt: string, availableTimes: Array<string>, position: { id: string } | null, answers: Array<{ content: string | null, question: { id: string }, attachments: Array<{ type: AttachmentType, url: string }> }> }> } };

export type ApplicantProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type ApplicantProfileQuery = { me: { id: string, name: string, phone: string, profileImageUrl: string | null, school: { name: string } | null, schoolVerification: { schoolName: string | null, email: string | null, school: { name: string } | null } | null } };

export type SubmittedApplicationQueryVariables = Exact<{
  id: string | number;
}>;


export type SubmittedApplicationQuery = { application: { id: string, submittedAt: string | null, availableTimes: Array<string>, position: { id: string, name: string } | null, posting: { id: string, title: string, questions: Array<{ id: string, type: QuestionType, title: string, description: string | null, required: boolean, maxLength: number | null, sortOrder: number, position: { id: string } | null, options: { activityFields: Array<ActivityField> | null } | null }> }, answers: Array<{ id: string, content: string | null, question: { id: string }, attachments: Array<{ id: string, type: AttachmentType, url: string, fileName: string | null }> }> } };

export type MyApplicationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyApplicationsQuery = { myApplications: Array<{ id: string, status: ApplicationStatus, submittedAt: string | null, docResult: DocResult, finalResult: FinalResult, position: { id: string, name: string } | null, posting: { id: string, title: string, status: PostingStatus, hasInterview: boolean, docResultAt: string | null, finalResultAt: string | null, organization: { name: string } } }> };

export type RecruitmentPostingQueryVariables = Exact<{
  id: string | number;
}>;


export type RecruitmentPostingQuery = { posting: { id: string, title: string, status: PostingStatus, recruitEndAt: string | null, docResultAt: string | null, hasInterview: boolean, noPosition: boolean, docResultConfirmedAt: string | null, docScorePerQuestion: boolean | null } };

export type PostingApplicationsQueryVariables = Exact<{
  postingId: string | number;
  positionId?: string | number | null | undefined;
  keyword?: string | null | undefined;
  sort?: ApplicationSort | null | undefined;
  page?: number | null | undefined;
}>;


export type PostingApplicationsQuery = { postingApplications: { totalCount: number, page: number, totalPages: number, rows: Array<{ id: string, docResult: DocResult, finalResult: FinalResult, user: { name: string }, position: { name: string } | null }>, positionCounts: Array<{ count: number, position: { id: string, name: string } }> } };

export type DocEvaluationApplicationsQueryVariables = Exact<{
  postingId: string | number;
  tab?: DocEvaluationTab | null | undefined;
  positionIds?: Array<string | number> | string | number | null | undefined;
  keyword?: string | null | undefined;
  sort?: ApplicationSort | null | undefined;
  page?: number | null | undefined;
}>;


export type DocEvaluationApplicationsQuery = { docEvaluationApplications: { totalCount: number, page: number, totalPages: number, rows: Array<{ myEvaluationStatus: MyDocEvaluationStatus, application: { id: string, submittedAt: string | null, user: { name: string }, position: { name: string } | null } }>, tabCounts: { all: number, notEvaluated: number, evaluated: number }, positionCounts: Array<{ count: number, position: { id: string, name: string } }> } };

export type DocEvaluationApplicationChipsQueryVariables = Exact<{
  postingId: string | number;
}>;


export type DocEvaluationApplicationChipsQuery = { docEvaluationApplicationChips: Array<{ myEvaluationStatus: MyDocEvaluationStatus, application: { id: string, user: { name: string } } }> };

export type DocEvaluationApplicationDetailQueryVariables = Exact<{
  id: string | number;
}>;


export type DocEvaluationApplicationDetailQuery = { application: { id: string, profileSnapshot: unknown, availableTimes: Array<string>, user: { name: string }, position: { id: string, name: string } | null, answers: Array<{ id: string, content: string | null, question: { id: string, type: QuestionType, title: string, description: string | null, required: boolean, maxLength: number | null, sortOrder: number, options: { activityFields: Array<ActivityField> | null } | null }, attachments: Array<{ id: string, type: AttachmentType, url: string, fileName: string | null }> }> } };

export type PostingQuestionsQueryVariables = Exact<{
  id: string | number;
}>;


export type PostingQuestionsQuery = { posting: { id: string, questions: Array<{ id: string, type: QuestionType, title: string, description: string | null, required: boolean, maxLength: number | null, sortOrder: number, position: { id: string } | null, options: { activityFields: Array<ActivityField> | null } | null }> } };

export type MyDocEvaluationQueryVariables = Exact<{
  applicationId: string | number;
}>;


export type MyDocEvaluationQuery = { myDocEvaluation: { id: string, status: MyDocEvaluationStatus, opinion: Opinion | null, memo: string | null, updatedAt: string, scores: Array<{ score: number, question: { id: string } }> } | null };

export type SaveDocEvaluationMutationVariables = Exact<{
  input: SaveDocEvaluationInput;
  submit: boolean;
}>;


export type SaveDocEvaluationMutation = { saveDocEvaluation: { remainingCount: number, nextUnevaluatedApplicationId: string | null, evaluation: { id: string, status: MyDocEvaluationStatus, opinion: Opinion | null, memo: string | null, updatedAt: string, scores: Array<{ score: number, question: { id: string } }> } } };

export type MyDocEvaluationFieldsFragment = { id: string, status: MyDocEvaluationStatus, opinion: Opinion | null, memo: string | null, updatedAt: string, scores: Array<{ score: number, question: { id: string } }> };

export type DocEvaluationSummaryQueryVariables = Exact<{
  postingId: string | number;
  tab?: DocResultTab | null | undefined;
  positionIds?: Array<string | number> | string | number | null | undefined;
  keyword?: string | null | undefined;
  sort?: DocSummarySort | null | undefined;
  page?: number | null | undefined;
}>;


export type DocEvaluationSummaryQuery = { docEvaluationSummary: { page: number, totalPages: number, rows: Array<{ rank: number | null, averageScore: number | null, evaluationComplete: boolean, application: { id: string, docResult: DocResult, user: { name: string }, position: { id: string, name: string } | null }, opinionCounts: { pass: number, hold: number, fail: number, notEvaluated: number } }>, tabCounts: { all: number, pass: number, hold: number, fail: number }, positionCounts: Array<{ count: number, position: { id: string, name: string } }>, summary: { totalCount: number, evaluatedCount: number, holdCount: number, passCount: number, failCount: number, allEvaluated: boolean, pendingCount: number, canConfirm: boolean } } };

export type SetDocResultMutationVariables = Exact<{
  applicationIds: Array<string | number> | string | number;
  result: DocResult;
}>;


export type SetDocResultMutation = { setDocResult: Array<{ id: string, docResult: DocResult }> };

export type ConfirmDocResultMutationVariables = Exact<{
  postingId: string | number;
}>;


export type ConfirmDocResultMutation = { confirmDocResult: { posting: { id: string, docResultConfirmedAt: string | null } } };

export type ResultMessagesQueryVariables = Exact<{
  postingId: string | number;
  type: MessageType;
}>;


export type ResultMessagesQuery = { resultMessages: { posting: { id: string, organization: { name: string }, interviewTimeRanges: Array<{ date: string }> }, pass: { variables: Array<MessageVariable>, recipientCount: number, sendableCount: number, processedCount: number, deliveredCount: number, failedCount: number, message: { id: string, status: MessageStatus, subject: string, body: string } | null, recipients: Array<{ email: string | null, emailWarning: EmailWarning | null, suggestedDomain: string | null, application: { id: string, user: { name: string }, position: { name: string } | null }, interview: { startAt: string, location: string | null } | null, delivery: { status: MessageDeliveryStatus, failReason: string | null } | null }> }, fail: { variables: Array<MessageVariable>, recipientCount: number, sendableCount: number, processedCount: number, deliveredCount: number, failedCount: number, message: { id: string, status: MessageStatus, subject: string, body: string } | null, recipients: Array<{ email: string | null, emailWarning: EmailWarning | null, suggestedDomain: string | null, application: { id: string, user: { name: string }, position: { name: string } | null }, interview: { startAt: string, location: string | null } | null, delivery: { status: MessageDeliveryStatus, failReason: string | null } | null }> } } };

export type ResultMessageProgressQueryVariables = Exact<{
  postingId: string | number;
  type: MessageType;
}>;


export type ResultMessageProgressQuery = { resultMessages: { pass: { processedCount: number, deliveredCount: number, failedCount: number, message: { id: string, status: MessageStatus } | null }, fail: { processedCount: number, deliveredCount: number, failedCount: number, message: { id: string, status: MessageStatus } | null } } };

export type ResultMessageProgressFieldsFragment = { processedCount: number, deliveredCount: number, failedCount: number, message: { id: string, status: MessageStatus } | null };

export type SaveMessageMutationVariables = Exact<{
  postingId: string | number;
  type: MessageType;
  target: MessageTarget;
  subject: string;
  body: string;
}>;


export type SaveMessageMutation = { saveMessage: { id: string, status: MessageStatus, subject: string, body: string } };

export type SendMessagesMutationVariables = Exact<{
  postingId: string | number;
  type: MessageType;
  targets: Array<MessageTarget> | MessageTarget;
}>;


export type SendMessagesMutation = { sendMessages: { posting: { id: string, organization: { name: string }, interviewTimeRanges: Array<{ date: string }> }, pass: { variables: Array<MessageVariable>, recipientCount: number, sendableCount: number, processedCount: number, deliveredCount: number, failedCount: number, message: { id: string, status: MessageStatus, subject: string, body: string } | null, recipients: Array<{ email: string | null, emailWarning: EmailWarning | null, suggestedDomain: string | null, application: { id: string, user: { name: string }, position: { name: string } | null }, interview: { startAt: string, location: string | null } | null, delivery: { status: MessageDeliveryStatus, failReason: string | null } | null }> }, fail: { variables: Array<MessageVariable>, recipientCount: number, sendableCount: number, processedCount: number, deliveredCount: number, failedCount: number, message: { id: string, status: MessageStatus, subject: string, body: string } | null, recipients: Array<{ email: string | null, emailWarning: EmailWarning | null, suggestedDomain: string | null, application: { id: string, user: { name: string }, position: { name: string } | null }, interview: { startAt: string, location: string | null } | null, delivery: { status: MessageDeliveryStatus, failReason: string | null } | null }> } } };

export type ResultMessagesFieldsFragment = { posting: { id: string, organization: { name: string }, interviewTimeRanges: Array<{ date: string }> }, pass: { variables: Array<MessageVariable>, recipientCount: number, sendableCount: number, processedCount: number, deliveredCount: number, failedCount: number, message: { id: string, status: MessageStatus, subject: string, body: string } | null, recipients: Array<{ email: string | null, emailWarning: EmailWarning | null, suggestedDomain: string | null, application: { id: string, user: { name: string }, position: { name: string } | null }, interview: { startAt: string, location: string | null } | null, delivery: { status: MessageDeliveryStatus, failReason: string | null } | null }> }, fail: { variables: Array<MessageVariable>, recipientCount: number, sendableCount: number, processedCount: number, deliveredCount: number, failedCount: number, message: { id: string, status: MessageStatus, subject: string, body: string } | null, recipients: Array<{ email: string | null, emailWarning: EmailWarning | null, suggestedDomain: string | null, application: { id: string, user: { name: string }, position: { name: string } | null }, interview: { startAt: string, location: string | null } | null, delivery: { status: MessageDeliveryStatus, failReason: string | null } | null }> } };

export type ResultMessagePanelFieldsFragment = { variables: Array<MessageVariable>, recipientCount: number, sendableCount: number, processedCount: number, deliveredCount: number, failedCount: number, message: { id: string, status: MessageStatus, subject: string, body: string } | null, recipients: Array<{ email: string | null, emailWarning: EmailWarning | null, suggestedDomain: string | null, application: { id: string, user: { name: string }, position: { name: string } | null }, interview: { startAt: string, location: string | null } | null, delivery: { status: MessageDeliveryStatus, failReason: string | null } | null }> };

export type ResultMessageFieldsFragment = { id: string, status: MessageStatus, subject: string, body: string };

export type ResultMessageRecipientFieldsFragment = { email: string | null, emailWarning: EmailWarning | null, suggestedDomain: string | null, application: { id: string, user: { name: string }, position: { name: string } | null }, interview: { startAt: string, location: string | null } | null, delivery: { status: MessageDeliveryStatus, failReason: string | null } | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, name: string, lastOrganization: { id: string } | null, memberships: Array<{ role: MemberRole, organization: { id: string, name: string, logoUrl: string | null } }> } };

export type MyAccountQueryVariables = Exact<{ [key: string]: never; }>;


export type MyAccountQuery = { me: { id: string, phone: string, name: string, profileImageUrl: string | null, school: { name: string } | null, schoolVerification: { schoolName: string | null, email: string | null, school: { name: string } | null } | null, memberships: Array<{ id: string, role: MemberRole, organization: { id: string, name: string }, team: { name: string } | null }>, notificationSettings: { notifyResult: boolean, notifyScrap: boolean, notifyOperator: boolean, marketingAgreed: boolean } } };

export type UpdateNotificationSettingsMutationVariables = Exact<{
  input: NotificationSettingsInput;
}>;


export type UpdateNotificationSettingsMutation = { updateNotificationSettings: { id: string, phone: string, name: string, profileImageUrl: string | null, school: { name: string } | null, schoolVerification: { schoolName: string | null, email: string | null, school: { name: string } | null } | null, memberships: Array<{ id: string, role: MemberRole, organization: { id: string, name: string }, team: { name: string } | null }>, notificationSettings: { notifyResult: boolean, notifyScrap: boolean, notifyOperator: boolean, marketingAgreed: boolean } } };

export type UpdateProfileMutationVariables = Exact<{
  input: UpdateProfileInput;
}>;


export type UpdateProfileMutation = { updateProfile: { id: string, phone: string, name: string, profileImageUrl: string | null, school: { name: string } | null, schoolVerification: { schoolName: string | null, email: string | null, school: { name: string } | null } | null, memberships: Array<{ id: string, role: MemberRole, organization: { id: string, name: string }, team: { name: string } | null }>, notificationSettings: { notifyResult: boolean, notifyScrap: boolean, notifyOperator: boolean, marketingAgreed: boolean } } };

export type RequestPhoneChangeMutationVariables = Exact<{
  phone: string;
}>;


export type RequestPhoneChangeMutation = { requestPhoneChange: boolean };

export type VerifyPhoneChangeMutationVariables = Exact<{
  phone: string;
  code: string;
}>;


export type VerifyPhoneChangeMutation = { verifyPhoneChange: boolean };

export type ChangePasswordMutationVariables = Exact<{
  input: ChangePasswordInput;
}>;


export type ChangePasswordMutation = { changePassword: boolean };

export type MyAccountFieldsFragment = { id: string, phone: string, name: string, profileImageUrl: string | null, school: { name: string } | null, schoolVerification: { schoolName: string | null, email: string | null, school: { name: string } | null } | null, memberships: Array<{ id: string, role: MemberRole, organization: { id: string, name: string }, team: { name: string } | null }>, notificationSettings: { notifyResult: boolean, notifyScrap: boolean, notifyOperator: boolean, marketingAgreed: boolean } };

export type WithdrawMutationVariables = Exact<{ [key: string]: never; }>;


export type WithdrawMutation = { withdraw: boolean };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const OrganizationProfileFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationProfileFields on Organization {
  id
  name
  type
  scope
  school {
    name
  }
  logoUrl
  tagline
  fields
  keywords
  links {
    id
    url
  }
}
    `, {"fragmentName":"OrganizationProfileFields"}) as unknown as TypedDocumentString<OrganizationProfileFieldsFragment, unknown>;
export const PostingDetailFieldsFragmentDoc = new TypedDocumentString(`
    fragment PostingDetailFields on Posting {
  id
  title
  content
  noPosition
  hasInterview
  allowEnrolled
  allowOnLeave
  eligibilityNote
  region
  fee
  recruitStartAt
  recruitEndAt
  docResultAt
  finalResultAt
  images {
    url
    isRepresentative
    sortOrder
  }
  positions {
    id
    name
    sortOrder
  }
  questions {
    id
    title
    sortOrder
    position {
      id
    }
  }
  interviewTimeRanges {
    date
  }
  organization {
    name
    type
    logoUrl
    tagline
    keywords
    fields
    links {
      id
      url
    }
  }
  otherActivePostings {
    id
    title
    recruitStartAt
    recruitEndAt
  }
}
    `, {"fragmentName":"PostingDetailFields"}) as unknown as TypedDocumentString<PostingDetailFieldsFragment, unknown>;
export const ManagedPostingFieldsFragmentDoc = new TypedDocumentString(`
    fragment ManagedPostingFields on Posting {
  id
  title
  status
  hasInterview
  publishedAt
  recruitEndAt
  docResultConfirmedAt
  docResultAt
  finalResultAt
  bumpRank
}
    `, {"fragmentName":"ManagedPostingFields"}) as unknown as TypedDocumentString<ManagedPostingFieldsFragment, unknown>;
export const PostingDraftFieldsFragmentDoc = new TypedDocumentString(`
    fragment PostingDraftFields on Posting {
  id
  status
  hasInterview
  updatedAt
  organization {
    id
  }
  title
  images {
    id
    url
    isRepresentative
    sortOrder
  }
  region
  fee
  allowEnrolled
  allowOnLeave
  eligibilityNote
  content
  recruitStartAt
  recruitEndAt
  activityStartedOn
  activityEndedOn
  noPosition
  positions {
    id
    name
    sortOrder
  }
  questions {
    id
    position {
      id
    }
    type
    title
    description
    required
    maxLength
    sortOrder
  }
  interviewMinutes
  breakMinutes
  interviewTimeRanges {
    id
    date
    startTime
    endTime
  }
  maxApplicantsPerInterview
  maxParallelInterviews
}
    `, {"fragmentName":"PostingDraftFields"}) as unknown as TypedDocumentString<PostingDraftFieldsFragment, unknown>;
export const MyDocEvaluationFieldsFragmentDoc = new TypedDocumentString(`
    fragment MyDocEvaluationFields on DocEvaluation {
  id
  status
  opinion
  memo
  scores {
    question {
      id
    }
    score
  }
  updatedAt
}
    `, {"fragmentName":"MyDocEvaluationFields"}) as unknown as TypedDocumentString<MyDocEvaluationFieldsFragment, unknown>;
export const ResultMessageProgressFieldsFragmentDoc = new TypedDocumentString(`
    fragment ResultMessageProgressFields on ResultMessagePanel {
  message {
    id
    status
  }
  processedCount
  deliveredCount
  failedCount
}
    `, {"fragmentName":"ResultMessageProgressFields"}) as unknown as TypedDocumentString<ResultMessageProgressFieldsFragment, unknown>;
export const ResultMessageFieldsFragmentDoc = new TypedDocumentString(`
    fragment ResultMessageFields on Message {
  id
  status
  subject
  body
}
    `, {"fragmentName":"ResultMessageFields"}) as unknown as TypedDocumentString<ResultMessageFieldsFragment, unknown>;
export const ResultMessageRecipientFieldsFragmentDoc = new TypedDocumentString(`
    fragment ResultMessageRecipientFields on Recipient {
  application {
    id
    user {
      name
    }
    position {
      name
    }
  }
  email
  emailWarning
  suggestedDomain
  interview {
    startAt
    location
  }
  delivery {
    status
    failReason
  }
}
    `, {"fragmentName":"ResultMessageRecipientFields"}) as unknown as TypedDocumentString<ResultMessageRecipientFieldsFragment, unknown>;
export const ResultMessagePanelFieldsFragmentDoc = new TypedDocumentString(`
    fragment ResultMessagePanelFields on ResultMessagePanel {
  message {
    ...ResultMessageFields
  }
  variables
  recipientCount
  sendableCount
  processedCount
  deliveredCount
  failedCount
  recipients {
    ...ResultMessageRecipientFields
  }
}
    fragment ResultMessageFields on Message {
  id
  status
  subject
  body
}
fragment ResultMessageRecipientFields on Recipient {
  application {
    id
    user {
      name
    }
    position {
      name
    }
  }
  email
  emailWarning
  suggestedDomain
  interview {
    startAt
    location
  }
  delivery {
    status
    failReason
  }
}`, {"fragmentName":"ResultMessagePanelFields"}) as unknown as TypedDocumentString<ResultMessagePanelFieldsFragment, unknown>;
export const ResultMessagesFieldsFragmentDoc = new TypedDocumentString(`
    fragment ResultMessagesFields on ResultMessages {
  posting {
    id
    organization {
      name
    }
    interviewTimeRanges {
      date
    }
  }
  pass {
    ...ResultMessagePanelFields
  }
  fail {
    ...ResultMessagePanelFields
  }
}
    fragment ResultMessagePanelFields on ResultMessagePanel {
  message {
    ...ResultMessageFields
  }
  variables
  recipientCount
  sendableCount
  processedCount
  deliveredCount
  failedCount
  recipients {
    ...ResultMessageRecipientFields
  }
}
fragment ResultMessageFields on Message {
  id
  status
  subject
  body
}
fragment ResultMessageRecipientFields on Recipient {
  application {
    id
    user {
      name
    }
    position {
      name
    }
  }
  email
  emailWarning
  suggestedDomain
  interview {
    startAt
    location
  }
  delivery {
    status
    failReason
  }
}`, {"fragmentName":"ResultMessagesFields"}) as unknown as TypedDocumentString<ResultMessagesFieldsFragment, unknown>;
export const MyAccountFieldsFragmentDoc = new TypedDocumentString(`
    fragment MyAccountFields on Me {
  id
  phone
  name
  profileImageUrl
  school {
    name
  }
  schoolVerification {
    schoolName
    email
    school {
      name
    }
  }
  memberships {
    id
    role
    organization {
      id
      name
    }
    team {
      name
    }
  }
  notificationSettings {
    notifyResult
    notifyScrap
    notifyOperator
    marketingAgreed
  }
}
    `, {"fragmentName":"MyAccountFields"}) as unknown as TypedDocumentString<MyAccountFieldsFragment, unknown>;
export const NotificationsDocument = new TypedDocumentString(`
    query Notifications($role: Role, $page: Int, $size: Int) {
  notifications(role: $role, page: $page, size: $size) {
    id
    type
    title
    linkUrl
    isRead
    createdAt
    organization {
      name
    }
  }
}
    `) as unknown as TypedDocumentString<NotificationsQuery, NotificationsQueryVariables>;
export const NotificationUnreadCountDocument = new TypedDocumentString(`
    query NotificationUnreadCount {
  me {
    id
    unreadNotificationCount
  }
}
    `) as unknown as TypedDocumentString<NotificationUnreadCountQuery, NotificationUnreadCountQueryVariables>;
export const MarkNotificationsReadDocument = new TypedDocumentString(`
    mutation MarkNotificationsRead($ids: [ID!]!) {
  markNotificationsRead(ids: $ids)
}
    `) as unknown as TypedDocumentString<MarkNotificationsReadMutation, MarkNotificationsReadMutationVariables>;
export const OrganizationMembersDocument = new TypedDocumentString(`
    query OrganizationMembers($organizationId: ID!) {
  members(organizationId: $organizationId) {
    id
    role
    createdAt
    user {
      id
      name
    }
    team {
      name
    }
  }
}
    `) as unknown as TypedDocumentString<OrganizationMembersQuery, OrganizationMembersQueryVariables>;
export const OrganizationProfileDocument = new TypedDocumentString(`
    query OrganizationProfile($id: ID!) {
  organization(id: $id) {
    ...OrganizationProfileFields
  }
}
    fragment OrganizationProfileFields on Organization {
  id
  name
  type
  scope
  school {
    name
  }
  logoUrl
  tagline
  fields
  keywords
  links {
    id
    url
  }
}`) as unknown as TypedDocumentString<OrganizationProfileQuery, OrganizationProfileQueryVariables>;
export const UpdateOrganizationDocument = new TypedDocumentString(`
    mutation UpdateOrganization($id: ID!, $input: UpdateOrganizationInput!) {
  updateOrganization(id: $id, input: $input) {
    ...OrganizationProfileFields
  }
}
    fragment OrganizationProfileFields on Organization {
  id
  name
  type
  scope
  school {
    name
  }
  logoUrl
  tagline
  fields
  keywords
  links {
    id
    url
  }
}`) as unknown as TypedDocumentString<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>;
export const KeywordSuggestionsDocument = new TypedDocumentString(`
    query KeywordSuggestions($query: String!) {
  keywordSuggestions(query: $query)
}
    `) as unknown as TypedDocumentString<KeywordSuggestionsQuery, KeywordSuggestionsQueryVariables>;
export const ReportPostingDocument = new TypedDocumentString(`
    mutation ReportPosting($postingId: ID!, $reason: ReportReason!, $detail: String) {
  reportPosting(postingId: $postingId, reason: $reason, detail: $detail)
}
    `) as unknown as TypedDocumentString<ReportPostingMutation, ReportPostingMutationVariables>;
export const PostingsDocument = new TypedDocumentString(`
    query Postings($filter: PostingFilter, $sort: PostingSort, $page: Int, $size: Int) {
  postings(filter: $filter, sort: $sort, page: $page, size: $size) {
    totalCount
    items {
      id
      title
      organization {
        name
        type
      }
      thumbnailUrl
      recruitEndAt
      positions {
        id
        name
        sortOrder
      }
    }
  }
}
    `) as unknown as TypedDocumentString<PostingsQuery, PostingsQueryVariables>;
export const PostingDocument = new TypedDocumentString(`
    query Posting($id: ID!) {
  posting(id: $id) {
    ...PostingDetailFields
  }
}
    fragment PostingDetailFields on Posting {
  id
  title
  content
  noPosition
  hasInterview
  allowEnrolled
  allowOnLeave
  eligibilityNote
  region
  fee
  recruitStartAt
  recruitEndAt
  docResultAt
  finalResultAt
  images {
    url
    isRepresentative
    sortOrder
  }
  positions {
    id
    name
    sortOrder
  }
  questions {
    id
    title
    sortOrder
    position {
      id
    }
  }
  interviewTimeRanges {
    date
  }
  organization {
    name
    type
    logoUrl
    tagline
    keywords
    fields
    links {
      id
      url
    }
  }
  otherActivePostings {
    id
    title
    recruitStartAt
    recruitEndAt
  }
}`) as unknown as TypedDocumentString<PostingQuery, PostingQueryVariables>;
export const DemoServerOrganizationPostingsDocument = new TypedDocumentString(`
    query DemoServerOrganizationPostings($organizationId: ID!) {
  organizationPostings(organizationId: $organizationId) {
    id
    title
    status
    hasInterview
    publishedAt
    recruitEndAt
    docResultConfirmedAt
    docResultAt
    finalResultAt
  }
}
    `) as unknown as TypedDocumentString<DemoServerOrganizationPostingsQuery, DemoServerOrganizationPostingsQueryVariables>;
export const DemoServerDeletePostingDocument = new TypedDocumentString(`
    mutation DemoServerDeletePosting($id: ID!) {
  deletePosting(id: $id)
}
    `) as unknown as TypedDocumentString<DemoServerDeletePostingMutation, DemoServerDeletePostingMutationVariables>;
export const DemoServerPostingDetailDocument = new TypedDocumentString(`
    query DemoServerPostingDetail($id: ID!) {
  posting(id: $id) {
    id
    title
    content
    noPosition
    hasInterview
    allowEnrolled
    allowOnLeave
    eligibilityNote
    region
    fee
    recruitStartAt
    recruitEndAt
    docResultAt
    finalResultAt
    images {
      url
      isRepresentative
      sortOrder
    }
    positions {
      id
      name
      sortOrder
    }
    questions {
      id
      title
      sortOrder
      position {
        id
      }
    }
    interviewTimeRanges {
      date
    }
    organization {
      id
      name
      type
      logoUrl
      tagline
      keywords
      fields
      links {
        id
        url
      }
    }
  }
}
    `) as unknown as TypedDocumentString<DemoServerPostingDetailQuery, DemoServerPostingDetailQueryVariables>;
export const OrganizationPostingsDocument = new TypedDocumentString(`
    query OrganizationPostings($organizationId: ID!, $status: [PostingStatus!]) {
  organizationPostings(organizationId: $organizationId, status: $status) {
    ...ManagedPostingFields
  }
}
    fragment ManagedPostingFields on Posting {
  id
  title
  status
  hasInterview
  publishedAt
  recruitEndAt
  docResultConfirmedAt
  docResultAt
  finalResultAt
  bumpRank
}`) as unknown as TypedDocumentString<OrganizationPostingsQuery, OrganizationPostingsQueryVariables>;
export const ManagedPostingSummaryDocument = new TypedDocumentString(`
    query ManagedPostingSummary($organizationId: ID!) {
  organization(id: $organizationId) {
    id
    upCredits
    postingCounts {
      published
      draft
      ended
    }
  }
}
    `) as unknown as TypedDocumentString<ManagedPostingSummaryQuery, ManagedPostingSummaryQueryVariables>;
export const ManagedPostingDetailDocument = new TypedDocumentString(`
    query ManagedPostingDetail($id: ID!) {
  posting(id: $id) {
    ...PostingDetailFields
    applicationCount
    organization {
      id
    }
  }
}
    fragment PostingDetailFields on Posting {
  id
  title
  content
  noPosition
  hasInterview
  allowEnrolled
  allowOnLeave
  eligibilityNote
  region
  fee
  recruitStartAt
  recruitEndAt
  docResultAt
  finalResultAt
  images {
    url
    isRepresentative
    sortOrder
  }
  positions {
    id
    name
    sortOrder
  }
  questions {
    id
    title
    sortOrder
    position {
      id
    }
  }
  interviewTimeRanges {
    date
  }
  organization {
    name
    type
    logoUrl
    tagline
    keywords
    fields
    links {
      id
      url
    }
  }
  otherActivePostings {
    id
    title
    recruitStartAt
    recruitEndAt
  }
}`) as unknown as TypedDocumentString<ManagedPostingDetailQuery, ManagedPostingDetailQueryVariables>;
export const SendNoticeDocument = new TypedDocumentString(`
    mutation SendNotice($postingId: ID!, $subject: String!, $body: String!) {
  sendNotice(postingId: $postingId, subject: $subject, body: $body) {
    id
  }
}
    `) as unknown as TypedDocumentString<SendNoticeMutation, SendNoticeMutationVariables>;
export const BumpPostingDocument = new TypedDocumentString(`
    mutation BumpPosting($id: ID!) {
  bumpPosting(id: $id) {
    id
    bumpRank
  }
}
    `) as unknown as TypedDocumentString<BumpPostingMutation, BumpPostingMutationVariables>;
export const DeletePostingDocument = new TypedDocumentString(`
    mutation DeletePosting($id: ID!) {
  deletePosting(id: $id)
}
    `) as unknown as TypedDocumentString<DeletePostingMutation, DeletePostingMutationVariables>;
export const PostingDraftDocument = new TypedDocumentString(`
    query PostingDraft($id: ID!) {
  posting(id: $id) {
    ...PostingDraftFields
  }
}
    fragment PostingDraftFields on Posting {
  id
  status
  hasInterview
  updatedAt
  organization {
    id
  }
  title
  images {
    id
    url
    isRepresentative
    sortOrder
  }
  region
  fee
  allowEnrolled
  allowOnLeave
  eligibilityNote
  content
  recruitStartAt
  recruitEndAt
  activityStartedOn
  activityEndedOn
  noPosition
  positions {
    id
    name
    sortOrder
  }
  questions {
    id
    position {
      id
    }
    type
    title
    description
    required
    maxLength
    sortOrder
  }
  interviewMinutes
  breakMinutes
  interviewTimeRanges {
    id
    date
    startTime
    endTime
  }
  maxApplicantsPerInterview
  maxParallelInterviews
}`) as unknown as TypedDocumentString<PostingDraftQuery, PostingDraftQueryVariables>;
export const SavePostingDraftDocument = new TypedDocumentString(`
    mutation SavePostingDraft($organizationId: ID!, $id: ID, $input: PostingDraftInput!) {
  savePostingDraft(organizationId: $organizationId, id: $id, input: $input) {
    ...PostingDraftFields
  }
}
    fragment PostingDraftFields on Posting {
  id
  status
  hasInterview
  updatedAt
  organization {
    id
  }
  title
  images {
    id
    url
    isRepresentative
    sortOrder
  }
  region
  fee
  allowEnrolled
  allowOnLeave
  eligibilityNote
  content
  recruitStartAt
  recruitEndAt
  activityStartedOn
  activityEndedOn
  noPosition
  positions {
    id
    name
    sortOrder
  }
  questions {
    id
    position {
      id
    }
    type
    title
    description
    required
    maxLength
    sortOrder
  }
  interviewMinutes
  breakMinutes
  interviewTimeRanges {
    id
    date
    startTime
    endTime
  }
  maxApplicantsPerInterview
  maxParallelInterviews
}`) as unknown as TypedDocumentString<SavePostingDraftMutation, SavePostingDraftMutationVariables>;
export const PublishPostingDocument = new TypedDocumentString(`
    mutation PublishPosting($id: ID!) {
  publishPosting(id: $id) {
    id
    status
  }
}
    `) as unknown as TypedDocumentString<PublishPostingMutation, PublishPostingMutationVariables>;
export const PostingApplicationFormDocument = new TypedDocumentString(`
    query PostingApplicationForm($id: ID!) {
  posting(id: $id) {
    id
    title
    noPosition
    hasInterview
    profilePhotoRequired
    positions {
      id
      name
      sortOrder
    }
    questions {
      id
      type
      title
      description
      required
      maxLength
      sortOrder
      position {
        id
      }
      options {
        activityFields
        maxEntries
        acceptFile
        acceptLink
        fileTypes
      }
    }
    interviewTimeRanges {
      date
      startTime
      endTime
      closedSlots
      position {
        id
      }
    }
  }
}
    `) as unknown as TypedDocumentString<PostingApplicationFormQuery, PostingApplicationFormQueryVariables>;
export const SaveApplicationDraftDocument = new TypedDocumentString(`
    mutation SaveApplicationDraft($postingId: ID!, $input: ApplicationInput!) {
  saveApplicationDraft(postingId: $postingId, input: $input) {
    id
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<SaveApplicationDraftMutation, SaveApplicationDraftMutationVariables>;
export const SubmitApplicationDocument = new TypedDocumentString(`
    mutation SubmitApplication($id: ID!) {
  submitApplication(id: $id) {
    id
  }
}
    `) as unknown as TypedDocumentString<SubmitApplicationMutation, SubmitApplicationMutationVariables>;
export const PostingMyApplicationsDocument = new TypedDocumentString(`
    query PostingMyApplications($id: ID!) {
  posting(id: $id) {
    id
    myApplications {
      id
      submittedAt
      updatedAt
      position {
        id
      }
      availableTimes
      answers {
        question {
          id
        }
        content
        attachments {
          type
          url
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<PostingMyApplicationsQuery, PostingMyApplicationsQueryVariables>;
export const ApplicantProfileDocument = new TypedDocumentString(`
    query ApplicantProfile {
  me {
    id
    name
    phone
    profileImageUrl
    school {
      name
    }
    schoolVerification {
      schoolName
      email
      school {
        name
      }
    }
  }
}
    `) as unknown as TypedDocumentString<ApplicantProfileQuery, ApplicantProfileQueryVariables>;
export const SubmittedApplicationDocument = new TypedDocumentString(`
    query SubmittedApplication($id: ID!) {
  application(id: $id) {
    id
    submittedAt
    availableTimes
    position {
      id
      name
    }
    posting {
      id
      title
      questions {
        id
        type
        title
        description
        required
        maxLength
        sortOrder
        position {
          id
        }
        options {
          activityFields
        }
      }
    }
    answers {
      id
      question {
        id
      }
      content
      attachments {
        id
        type
        url
        fileName
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SubmittedApplicationQuery, SubmittedApplicationQueryVariables>;
export const MyApplicationsDocument = new TypedDocumentString(`
    query MyApplications {
  myApplications {
    id
    status
    submittedAt
    docResult
    finalResult
    position {
      id
      name
    }
    posting {
      id
      title
      status
      hasInterview
      docResultAt
      finalResultAt
      organization {
        name
      }
    }
  }
}
    `) as unknown as TypedDocumentString<MyApplicationsQuery, MyApplicationsQueryVariables>;
export const RecruitmentPostingDocument = new TypedDocumentString(`
    query RecruitmentPosting($id: ID!) {
  posting(id: $id) {
    id
    title
    status
    recruitEndAt
    docResultAt
    hasInterview
    noPosition
    docResultConfirmedAt
    docScorePerQuestion
  }
}
    `) as unknown as TypedDocumentString<RecruitmentPostingQuery, RecruitmentPostingQueryVariables>;
export const PostingApplicationsDocument = new TypedDocumentString(`
    query PostingApplications($postingId: ID!, $positionId: ID, $keyword: String, $sort: ApplicationSort, $page: Int) {
  postingApplications(
    postingId: $postingId
    positionId: $positionId
    keyword: $keyword
    sort: $sort
    page: $page
  ) {
    rows {
      id
      user {
        name
      }
      position {
        name
      }
      docResult
      finalResult
    }
    totalCount
    positionCounts {
      position {
        id
        name
      }
      count
    }
    page
    totalPages
  }
}
    `) as unknown as TypedDocumentString<PostingApplicationsQuery, PostingApplicationsQueryVariables>;
export const DocEvaluationApplicationsDocument = new TypedDocumentString(`
    query DocEvaluationApplications($postingId: ID!, $tab: DocEvaluationTab, $positionIds: [ID!], $keyword: String, $sort: ApplicationSort, $page: Int) {
  docEvaluationApplications(
    postingId: $postingId
    tab: $tab
    positionIds: $positionIds
    keyword: $keyword
    sort: $sort
    page: $page
  ) {
    rows {
      application {
        id
        user {
          name
        }
        position {
          name
        }
        submittedAt
      }
      myEvaluationStatus
    }
    totalCount
    tabCounts {
      all
      notEvaluated
      evaluated
    }
    positionCounts {
      position {
        id
        name
      }
      count
    }
    page
    totalPages
  }
}
    `) as unknown as TypedDocumentString<DocEvaluationApplicationsQuery, DocEvaluationApplicationsQueryVariables>;
export const DocEvaluationApplicationChipsDocument = new TypedDocumentString(`
    query DocEvaluationApplicationChips($postingId: ID!) {
  docEvaluationApplicationChips(postingId: $postingId) {
    application {
      id
      user {
        name
      }
    }
    myEvaluationStatus
  }
}
    `) as unknown as TypedDocumentString<DocEvaluationApplicationChipsQuery, DocEvaluationApplicationChipsQueryVariables>;
export const DocEvaluationApplicationDetailDocument = new TypedDocumentString(`
    query DocEvaluationApplicationDetail($id: ID!) {
  application(id: $id) {
    id
    user {
      name
    }
    position {
      id
      name
    }
    profileSnapshot
    availableTimes
    answers {
      id
      question {
        id
        type
        title
        description
        required
        maxLength
        sortOrder
        options {
          activityFields
        }
      }
      content
      attachments {
        id
        type
        url
        fileName
      }
    }
  }
}
    `) as unknown as TypedDocumentString<DocEvaluationApplicationDetailQuery, DocEvaluationApplicationDetailQueryVariables>;
export const PostingQuestionsDocument = new TypedDocumentString(`
    query PostingQuestions($id: ID!) {
  posting(id: $id) {
    id
    questions {
      id
      type
      title
      description
      required
      maxLength
      sortOrder
      position {
        id
      }
      options {
        activityFields
      }
    }
  }
}
    `) as unknown as TypedDocumentString<PostingQuestionsQuery, PostingQuestionsQueryVariables>;
export const MyDocEvaluationDocument = new TypedDocumentString(`
    query MyDocEvaluation($applicationId: ID!) {
  myDocEvaluation(applicationId: $applicationId) {
    ...MyDocEvaluationFields
  }
}
    fragment MyDocEvaluationFields on DocEvaluation {
  id
  status
  opinion
  memo
  scores {
    question {
      id
    }
    score
  }
  updatedAt
}`) as unknown as TypedDocumentString<MyDocEvaluationQuery, MyDocEvaluationQueryVariables>;
export const SaveDocEvaluationDocument = new TypedDocumentString(`
    mutation SaveDocEvaluation($input: SaveDocEvaluationInput!, $submit: Boolean!) {
  saveDocEvaluation(input: $input, submit: $submit) {
    evaluation {
      ...MyDocEvaluationFields
    }
    remainingCount
    nextUnevaluatedApplicationId
  }
}
    fragment MyDocEvaluationFields on DocEvaluation {
  id
  status
  opinion
  memo
  scores {
    question {
      id
    }
    score
  }
  updatedAt
}`) as unknown as TypedDocumentString<SaveDocEvaluationMutation, SaveDocEvaluationMutationVariables>;
export const DocEvaluationSummaryDocument = new TypedDocumentString(`
    query DocEvaluationSummary($postingId: ID!, $tab: DocResultTab, $positionIds: [ID!], $keyword: String, $sort: DocSummarySort, $page: Int) {
  docEvaluationSummary(
    postingId: $postingId
    tab: $tab
    positionIds: $positionIds
    keyword: $keyword
    sort: $sort
    page: $page
  ) {
    rows {
      application {
        id
        user {
          name
        }
        position {
          id
          name
        }
        docResult
      }
      rank
      averageScore
      opinionCounts {
        pass
        hold
        fail
        notEvaluated
      }
      evaluationComplete
    }
    tabCounts {
      all
      pass
      hold
      fail
    }
    positionCounts {
      position {
        id
        name
      }
      count
    }
    page
    totalPages
    summary {
      totalCount
      evaluatedCount
      holdCount
      passCount
      failCount
      allEvaluated
      pendingCount
      canConfirm
    }
  }
}
    `) as unknown as TypedDocumentString<DocEvaluationSummaryQuery, DocEvaluationSummaryQueryVariables>;
export const SetDocResultDocument = new TypedDocumentString(`
    mutation SetDocResult($applicationIds: [ID!]!, $result: DocResult!) {
  setDocResult(applicationIds: $applicationIds, result: $result) {
    id
    docResult
  }
}
    `) as unknown as TypedDocumentString<SetDocResultMutation, SetDocResultMutationVariables>;
export const ConfirmDocResultDocument = new TypedDocumentString(`
    mutation ConfirmDocResult($postingId: ID!) {
  confirmDocResult(postingId: $postingId) {
    posting {
      id
      docResultConfirmedAt
    }
  }
}
    `) as unknown as TypedDocumentString<ConfirmDocResultMutation, ConfirmDocResultMutationVariables>;
export const ResultMessagesDocument = new TypedDocumentString(`
    query ResultMessages($postingId: ID!, $type: MessageType!) {
  resultMessages(postingId: $postingId, type: $type) {
    ...ResultMessagesFields
  }
}
    fragment ResultMessagesFields on ResultMessages {
  posting {
    id
    organization {
      name
    }
    interviewTimeRanges {
      date
    }
  }
  pass {
    ...ResultMessagePanelFields
  }
  fail {
    ...ResultMessagePanelFields
  }
}
fragment ResultMessagePanelFields on ResultMessagePanel {
  message {
    ...ResultMessageFields
  }
  variables
  recipientCount
  sendableCount
  processedCount
  deliveredCount
  failedCount
  recipients {
    ...ResultMessageRecipientFields
  }
}
fragment ResultMessageFields on Message {
  id
  status
  subject
  body
}
fragment ResultMessageRecipientFields on Recipient {
  application {
    id
    user {
      name
    }
    position {
      name
    }
  }
  email
  emailWarning
  suggestedDomain
  interview {
    startAt
    location
  }
  delivery {
    status
    failReason
  }
}`) as unknown as TypedDocumentString<ResultMessagesQuery, ResultMessagesQueryVariables>;
export const ResultMessageProgressDocument = new TypedDocumentString(`
    query ResultMessageProgress($postingId: ID!, $type: MessageType!) {
  resultMessages(postingId: $postingId, type: $type) {
    pass {
      ...ResultMessageProgressFields
    }
    fail {
      ...ResultMessageProgressFields
    }
  }
}
    fragment ResultMessageProgressFields on ResultMessagePanel {
  message {
    id
    status
  }
  processedCount
  deliveredCount
  failedCount
}`) as unknown as TypedDocumentString<ResultMessageProgressQuery, ResultMessageProgressQueryVariables>;
export const SaveMessageDocument = new TypedDocumentString(`
    mutation SaveMessage($postingId: ID!, $type: MessageType!, $target: MessageTarget!, $subject: String!, $body: String!) {
  saveMessage(
    postingId: $postingId
    type: $type
    target: $target
    subject: $subject
    body: $body
  ) {
    ...ResultMessageFields
  }
}
    fragment ResultMessageFields on Message {
  id
  status
  subject
  body
}`) as unknown as TypedDocumentString<SaveMessageMutation, SaveMessageMutationVariables>;
export const SendMessagesDocument = new TypedDocumentString(`
    mutation SendMessages($postingId: ID!, $type: MessageType!, $targets: [MessageTarget!]!) {
  sendMessages(postingId: $postingId, type: $type, targets: $targets) {
    ...ResultMessagesFields
  }
}
    fragment ResultMessagesFields on ResultMessages {
  posting {
    id
    organization {
      name
    }
    interviewTimeRanges {
      date
    }
  }
  pass {
    ...ResultMessagePanelFields
  }
  fail {
    ...ResultMessagePanelFields
  }
}
fragment ResultMessagePanelFields on ResultMessagePanel {
  message {
    ...ResultMessageFields
  }
  variables
  recipientCount
  sendableCount
  processedCount
  deliveredCount
  failedCount
  recipients {
    ...ResultMessageRecipientFields
  }
}
fragment ResultMessageFields on Message {
  id
  status
  subject
  body
}
fragment ResultMessageRecipientFields on Recipient {
  application {
    id
    user {
      name
    }
    position {
      name
    }
  }
  email
  emailWarning
  suggestedDomain
  interview {
    startAt
    location
  }
  delivery {
    status
    failReason
  }
}`) as unknown as TypedDocumentString<SendMessagesMutation, SendMessagesMutationVariables>;
export const MeDocument = new TypedDocumentString(`
    query Me {
  me {
    id
    name
    lastOrganization {
      id
    }
    memberships {
      role
      organization {
        id
        name
        logoUrl
      }
    }
  }
}
    `) as unknown as TypedDocumentString<MeQuery, MeQueryVariables>;
export const MyAccountDocument = new TypedDocumentString(`
    query MyAccount {
  me {
    ...MyAccountFields
  }
}
    fragment MyAccountFields on Me {
  id
  phone
  name
  profileImageUrl
  school {
    name
  }
  schoolVerification {
    schoolName
    email
    school {
      name
    }
  }
  memberships {
    id
    role
    organization {
      id
      name
    }
    team {
      name
    }
  }
  notificationSettings {
    notifyResult
    notifyScrap
    notifyOperator
    marketingAgreed
  }
}`) as unknown as TypedDocumentString<MyAccountQuery, MyAccountQueryVariables>;
export const UpdateNotificationSettingsDocument = new TypedDocumentString(`
    mutation UpdateNotificationSettings($input: NotificationSettingsInput!) {
  updateNotificationSettings(input: $input) {
    ...MyAccountFields
  }
}
    fragment MyAccountFields on Me {
  id
  phone
  name
  profileImageUrl
  school {
    name
  }
  schoolVerification {
    schoolName
    email
    school {
      name
    }
  }
  memberships {
    id
    role
    organization {
      id
      name
    }
    team {
      name
    }
  }
  notificationSettings {
    notifyResult
    notifyScrap
    notifyOperator
    marketingAgreed
  }
}`) as unknown as TypedDocumentString<UpdateNotificationSettingsMutation, UpdateNotificationSettingsMutationVariables>;
export const UpdateProfileDocument = new TypedDocumentString(`
    mutation UpdateProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) {
    ...MyAccountFields
  }
}
    fragment MyAccountFields on Me {
  id
  phone
  name
  profileImageUrl
  school {
    name
  }
  schoolVerification {
    schoolName
    email
    school {
      name
    }
  }
  memberships {
    id
    role
    organization {
      id
      name
    }
    team {
      name
    }
  }
  notificationSettings {
    notifyResult
    notifyScrap
    notifyOperator
    marketingAgreed
  }
}`) as unknown as TypedDocumentString<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const RequestPhoneChangeDocument = new TypedDocumentString(`
    mutation RequestPhoneChange($phone: String!) {
  requestPhoneChange(phone: $phone)
}
    `) as unknown as TypedDocumentString<RequestPhoneChangeMutation, RequestPhoneChangeMutationVariables>;
export const VerifyPhoneChangeDocument = new TypedDocumentString(`
    mutation VerifyPhoneChange($phone: String!, $code: String!) {
  verifyPhoneChange(phone: $phone, code: $code)
}
    `) as unknown as TypedDocumentString<VerifyPhoneChangeMutation, VerifyPhoneChangeMutationVariables>;
export const ChangePasswordDocument = new TypedDocumentString(`
    mutation ChangePassword($input: ChangePasswordInput!) {
  changePassword(input: $input)
}
    `) as unknown as TypedDocumentString<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const WithdrawDocument = new TypedDocumentString(`
    mutation Withdraw {
  withdraw
}
    `) as unknown as TypedDocumentString<WithdrawMutation, WithdrawMutationVariables>;