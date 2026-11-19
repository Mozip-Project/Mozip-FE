/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query Notifications {\n  notifications {\n    items {\n      id\n      type\n      title\n      link\n      read\n      createdAt\n      organization {\n        name\n      }\n    }\n  }\n}\n\nmutation MarkNotificationsRead($ids: [ID!]) {\n  markNotificationsRead(ids: $ids)\n}": typeof types.NotificationsDocument,
};
const documents: Documents = {
    "query Notifications {\n  notifications {\n    items {\n      id\n      type\n      title\n      link\n      read\n      createdAt\n      organization {\n        name\n      }\n    }\n  }\n}\n\nmutation MarkNotificationsRead($ids: [ID!]) {\n  markNotificationsRead(ids: $ids)\n}": types.NotificationsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Notifications {\n  notifications {\n    items {\n      id\n      type\n      title\n      link\n      read\n      createdAt\n      organization {\n        name\n      }\n    }\n  }\n}\n\nmutation MarkNotificationsRead($ids: [ID!]) {\n  markNotificationsRead(ids: $ids)\n}"): typeof import('./graphql').NotificationsDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
