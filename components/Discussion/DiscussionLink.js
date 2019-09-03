import React from 'react'
import { Link } from '../../lib/routes'
import PathLink from '../Link/Path'
import { GENERAL_FEEDBACK_DISCUSSION_ID } from '../../lib/constants'

const DiscussionLink = ({
  children,
  discussion
}) => {
  let tab
  if (discussion && discussion.document) {
    const meta = discussion.document.meta || {}
    const ownDiscussion = meta.ownDiscussion && !meta.ownDiscussion.closed
    const template = meta.template
    tab =
      (ownDiscussion && template === 'article' && 'article') ||
      (discussion && discussion.id === GENERAL_FEEDBACK_DISCUSSION_ID && 'general')
  }
  if (tab) {
    return (
      <Link
        route='discussion'
        params={{ t: tab, id: discussion.id }}
        passHref
      >
        {children}
      </Link>
    )
  }
  if (discussion) {
    const path = discussion.document &&
      discussion.document.meta &&
      discussion.document.meta.path
      ? discussion.document.meta.path
      : discussion.path
    if (path) {
      return (
        <PathLink
          path={path}
          passHref
        >
          {children}
        </PathLink>
      )
    }
  }
  return children
}

export default DiscussionLink
