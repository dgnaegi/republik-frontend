import { graphql, compose, withApollo } from 'react-apollo'
import uuid from 'uuid/v4'
import produce from 'immer'

import withT from '../../../../lib/withT'

import { withDiscussionDisplayAuthor } from './withDiscussionDisplayAuthor'
import {
  discussionQuery,
  submitCommentMutation,
  commentPreviewQuery
} from '../documents'
import { toRejectedString } from '../utils'
import { mergeComment, optimisticContent } from '../store'
import { debug } from '../../debug'

/**
 * Provides the component with
 *
 *   {
 *     submitComment(parent: Comment, content: string, tags?: string[])
 *   }
 */

export const withSubmitComment = compose(
  withT,
  withDiscussionDisplayAuthor,
  withApollo,
  graphql(submitCommentMutation, {
    props: ({
      ownProps: {
        t,
        discussionId,
        parentId: initialParentId,
        orderBy,
        depth,
        focusId,
        discussionDisplayAuthor: displayAuthor,
        discussionUserPreference: userPreference,
        client,
        includeParent
      },
      mutate
    }) => ({
      previewComment: ({ content, discussionId, parentId, id }) => {
        return client
          .query({
            query: commentPreviewQuery,
            variables: {
              content,
              discussionId,
              parentId,
              id
            },
            fetchPolicy: 'no-cache'
          })
          .then(({ data }) => {
            return data.commentPreview
          })
      },
      submitComment: (parent, content, tags = []) => {
        if (!displayAuthor) {
          return Promise.reject(t('submitComment/noDisplayAuthor'))
        }

        /*
         * Generate a new UUID for the comment. We do this client-side so that we can
         * properly handle subscription notifications.
         */
        const id = uuid()

        const { parentId, parentIds } = parent
          ? {
              parentId: parent.id,
              parentIds: parent.parentIds.concat(parent.id)
            }
          : { parentId: null, parentIds: [] }

        return mutate({
          variables: { discussionId, parentId, id, content, tags },
          optimisticResponse: {
            __typename: 'Mutation',
            submitComment: {
              // allows to detect
              isOptimisticResponse: true,
              __typename: 'Comment',
              id,
              ...optimisticContent(content),
              published: true,
              adminUnpublished: false,
              userCanEdit: true,
              featuredAt: null,
              featuredText: null,
              downVotes: 0,
              upVotes: 0,
              userVote: null,
              displayAuthor,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              parentIds,
              tags,
              embed: null,
              mentioningDocument: null,
              userCanReport: false,
              userReportedAt: null,
              numReports: 0,
              unreadNotifications: null,
              discussion: {
                __typename: 'Discussion',
                id: discussionId,
                userPreference: {
                  __typename: 'DiscussionPreferences',
                  notifications: userPreference.notifications
                },
                userWaitUntil: null
              }
            }
          },
          update: (proxy, { data: { submitComment: comment } }) => {
            debug('submitComment', comment)
            const variables = {
              discussionId,
              parentId: initialParentId,
              orderBy,
              depth,
              focusId,
              includeParent
            }

            proxy.writeQuery({
              query: discussionQuery,
              variables,
              data: produce(
                proxy.readQuery({ query: discussionQuery, variables }),
                mergeComment({
                  comment,
                  initialParentId,
                  isOptimisticUpdate: comment.isOptimisticResponse
                })
              )
            })
          }
        }).catch(toRejectedString)
      }
    })
  })
)
