/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
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

export type ReportReason =
  | 'ETC'
  | 'EXCESSIVE_PERSONAL_INFO'
  | 'FALSE_INFO'
  | 'INAPPROPRIATE';

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

export type ReportPostingMutationVariables = Exact<{
  postingId: string | number;
  reason: ReportReason;
  detail?: string | null | undefined;
}>;


export type ReportPostingMutation = { reportPosting: boolean };

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
export const ReportPostingDocument = new TypedDocumentString(`
    mutation ReportPosting($postingId: ID!, $reason: ReportReason!, $detail: String) {
  reportPosting(postingId: $postingId, reason: $reason, detail: $detail)
}
    `) as unknown as TypedDocumentString<ReportPostingMutation, ReportPostingMutationVariables>;