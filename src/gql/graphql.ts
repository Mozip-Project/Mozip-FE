/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type MemberRole =
  | 'OPERATOR'
  | 'REPRESENTATIVE';

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

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, lastOrganization: { id: string } | null, memberships: Array<{ role: MemberRole, organization: { id: string, name: string } }> } };

export type MyAccountQueryVariables = Exact<{ [key: string]: never; }>;


export type MyAccountQuery = { me: { id: string, phone: string, name: string, school: { name: string } | null, schoolVerification: { schoolName: string | null, email: string | null, school: { name: string } | null } | null, memberships: Array<{ id: string, role: MemberRole, organization: { id: string, name: string }, team: { name: string } | null }>, notificationSettings: { notifyResult: boolean, notifyScrap: boolean, notifyOperator: boolean, marketingAgreed: boolean } } };

export type UpdateNotificationSettingsMutationVariables = Exact<{
  input: NotificationSettingsInput;
}>;


export type UpdateNotificationSettingsMutation = { updateNotificationSettings: { id: string, phone: string, name: string, school: { name: string } | null, schoolVerification: { schoolName: string | null, email: string | null, school: { name: string } | null } | null, memberships: Array<{ id: string, role: MemberRole, organization: { id: string, name: string }, team: { name: string } | null }>, notificationSettings: { notifyResult: boolean, notifyScrap: boolean, notifyOperator: boolean, marketingAgreed: boolean } } };

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
export const WithdrawDocument = new TypedDocumentString(`
    mutation Withdraw {
  withdraw
}
    `) as unknown as TypedDocumentString<WithdrawMutation, WithdrawMutationVariables>;