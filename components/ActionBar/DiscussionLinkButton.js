import React from 'react'

import { IconButton, colors } from '@project-r/styleguide'
import DiscussionIcon from '../Icons/Discussion'
import { focusSelector } from '../../lib/utils/scroll'
import PathLink from '../Link/Path'
import { getDiscussionLinkProps } from './utils'

const DiscussionLinkButton = ({
  t,
  document,
  forceShortLabel,
  isOnArticlePage
}) => {
  const meta = document && document.meta
  const {
    discussionId,
    discussionPath,
    discussionQuery,
    discussionCount,
    isDiscussionPage
  } = getDiscussionLinkProps(
    meta.linkedDiscussion,
    meta.ownDiscussion,
    meta.template,
    meta.path
  )

  return (
    <PathLink path={discussionPath} query={discussionQuery} passHref>
      <IconButton
        Icon={DiscussionIcon}
        label={
          forceShortLabel
            ? discussionCount
            : t('profile/documents/title/other', {
                count: discussionCount || ''
              })
        }
        labelShort={discussionCount || ''}
        fill={colors.primary}
        onClick={
          isDiscussionPage && isOnArticlePage
            ? e => {
                e.preventDefault()
                focusSelector(`[data-discussion-id='${discussionId}']`)
              }
            : undefined
        }
      />
    </PathLink>
  )
}

export default DiscussionLinkButton
