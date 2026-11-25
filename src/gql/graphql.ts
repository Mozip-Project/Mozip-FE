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

export type DocSummarySort =
  | 'NAME_ASC'
  | 'NAME_DESC'
  /** 점수 안 쓰는 공고 기본 */
  | 'PASS_OPINION_DESC'
  | 'SCORE_ASC'
  | 'SCORE_DESC';

export type FileType =
  | 'IMAGE'
  | 'MP4'
  | 'PDF'
  | 'PPT';

export type FinalResult =
  | 'FAIL'
  | 'PASS'
  | 'PENDING';

export type MemberRole =
  | 'OPERATOR'
  | 'REPRESENTATIVE';

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

export type NotificationTab =
  | 'APPLICANT'
  | 'OPERATOR';

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

export type PostingFilter = {
  /** 마감 3일 이내 */
  closingSoon?: boolean | null | undefined;
  fields?: Array<string> | null | undefined;
  hasInterview?: boolean | null | undefined;
  keyword?: string | null | undefined;
  /** 명세는 하나, 여러 개 선택이라 배열로 요청 중(백엔드 확인 전 가정) */
  organizationType?: Array<OrganizationType> | null | undefined;
  schoolId?: string | number | null | undefined;
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

export type UpdateOrganizationInput = {
  /** 학생회는 빈 배열 */
  fields: Array<OrganizationField>;
  /** 1~10개, 중복 제거 */
  keywords: Array<string>;
  /** 1개 이상 */
  links: Array<OrganizationLinkInput>;
  /** 업로드 후 받은 key, null이면 기존 로고 유지 */
  logoFileKey?: string | null | undefined;
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
  tab?: NotificationTab | null | undefined;
  page?: number | null | undefined;
}>;


export type NotificationsQuery = { notifications: { totalCount: number, content: Array<{ id: string, type: NotificationType, title: string, linkUrl: string | null, isRead: boolean, createdAt: string, organization: { name: string } | null }> } };

export type NotificationUnreadCountQueryVariables = Exact<{ [key: string]: never; }>;


export type NotificationUnreadCountQuery = { notifications: { unreadCount: { all: number, operator: number, applicant: number } } };

export type MarkNotificationsReadMutationVariables = Exact<{
  ids?: Array<string | number> | string | number | null | undefined;
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

export type RecruitmentPostingQueryVariables = Exact<{
  id: string | number;
}>;


export type RecruitmentPostingQuery = { posting: { id: string, status: PostingStatus, hasInterview: boolean, noPosition: boolean, docResultConfirmedAt: string | null } };

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

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, lastOrganization: { id: string } | null, memberships: Array<{ role: MemberRole, organization: { id: string, name: string } }> } };

export type MyAccountQueryVariables = Exact<{ [key: string]: never; }>;


export type MyAccountQuery = { me: { id: string, phone: string, name: string, school: { name: string } | null, schoolVerification: { schoolName: string | null, email: string | null, school: { name: string } | null } | null, memberships: Array<{ id: string, role: MemberRole, organization: { id: string, name: string }, team: { name: string } | null }>, notificationSettings: { notifyResult: boolean, notifyScrap: boolean, notifyOperator: boolean, marketingAgreed: boolean } } };

export type UpdateNotificationSettingsMutationVariables = Exact<{
  input: NotificationSettingsInput;
}>;


export type UpdateNotificationSettingsMutation = { updateNotificationSettings: { id: string, phone: string, name: string, school: { name: string } | null, schoolVerification: { schoolName: string | null, email: string | null, school: { name: string } | null } | null, memberships: Array<{ id: string, role: MemberRole, organization: { id: string, name: string }, team: { name: string } | null }>, notificationSettings: { notifyResult: boolean, notifyScrap: boolean, notifyOperator: boolean, marketingAgreed: boolean } } };

export type UpdateProfileMutationVariables = Exact<{
  input: UpdateProfileInput;
}>;


export type UpdateProfileMutation = { updateProfile: { id: string, phone: string, name: string, school: { name: string } | null, schoolVerification: { schoolName: string | null, email: string | null, school: { name: string } | null } | null, memberships: Array<{ id: string, role: MemberRole, organization: { id: string, name: string }, team: { name: string } | null }>, notificationSettings: { notifyResult: boolean, notifyScrap: boolean, notifyOperator: boolean, marketingAgreed: boolean } } };

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

export type MyAccountFieldsFragment = { id: string, phone: string, name: string, school: { name: string } | null, schoolVerification: { schoolName: string | null, email: string | null, school: { name: string } | null } | null, memberships: Array<{ id: string, role: MemberRole, organization: { id: string, name: string }, team: { name: string } | null }>, notificationSettings: { notifyResult: boolean, notifyScrap: boolean, notifyOperator: boolean, marketingAgreed: boolean } };

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
export const MyAccountFieldsFragmentDoc = new TypedDocumentString(`
    fragment MyAccountFields on Me {
  id
  phone
  name
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
    query Notifications($tab: NotificationTab, $page: Int) {
  notifications(tab: $tab, page: $page) {
    content {
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
    totalCount
  }
}
    `) as unknown as TypedDocumentString<NotificationsQuery, NotificationsQueryVariables>;
export const NotificationUnreadCountDocument = new TypedDocumentString(`
    query NotificationUnreadCount {
  notifications {
    unreadCount {
      all
      operator
      applicant
    }
  }
}
    `) as unknown as TypedDocumentString<NotificationUnreadCountQuery, NotificationUnreadCountQueryVariables>;
export const MarkNotificationsReadDocument = new TypedDocumentString(`
    mutation MarkNotificationsRead($ids: [ID!]) {
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
export const RecruitmentPostingDocument = new TypedDocumentString(`
    query RecruitmentPosting($id: ID!) {
  posting(id: $id) {
    id
    status
    hasInterview
    noPosition
    docResultConfirmedAt
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
export const MeDocument = new TypedDocumentString(`
    query Me {
  me {
    id
    lastOrganization {
      id
    }
    memberships {
      role
      organization {
        id
        name
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