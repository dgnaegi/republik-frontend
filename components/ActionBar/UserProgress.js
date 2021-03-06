import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'react-apollo'

import withT from '../../lib/withT'
import datetime from '../Article/Progress/datetime'
import MdCheckCircleOutlined from '../Icons/MdCheckCircleOutlined'
import MdCheckSmall from '../Icons/MdCheckSmall'
import { MdHighlightOff } from 'react-icons/md'
import { withProgressApi } from '../Article/Progress/api'
import {
  ProgressCircle,
  colors,
  IconButton,
  CalloutMenu
} from '@project-r/styleguide'

const UserProgress = (
  {
    t,
    documentId,
    userProgress,
    upsertDocumentProgress,
    removeDocumentProgress,
    forceShortLabel,
    noCallout,
    noScroll
  },
  { restoreArticleProgress }
) => {
  const { percentage, updatedAt } = userProgress
  const percent = Math.round(percentage * 100)

  const ReadIcon = React.forwardRef((props, ref) => (
    <IconButton
      Icon={MdCheckCircleOutlined}
      label={!forceShortLabel && t('article/actionbar/progress/read')}
      title={t('article/actionbar/progress/read')}
      onClick={() => {
        removeDocumentProgress(documentId)
      }}
      ref={ref}
      {...props}
    />
  ))

  const MarkAsReadIcon = React.forwardRef((props, ref) => (
    <IconButton
      Icon={MdCheckSmall}
      title={t('article/actionbar/progress/markasread')}
      onClick={() => {
        upsertDocumentProgress(documentId, 1, '')
      }}
      ref={ref}
      {...props}
    />
  ))

  const ProgressCircleIcon = () => (
    <ProgressCircle
      progress={percent}
      stroke={colors.text}
      strokePlaceholder='#e9e9e9'
      size={24}
      strokeWidth={2}
    />
  )

  if (percent === 100) {
    if (noCallout) {
      return <ReadIcon />
    } else {
      return (
        <CalloutMenu Element={ReadIcon}>
          <IconButton
            Icon={MdHighlightOff}
            title={t('article/actionbar/progress/unread')}
            label={t('article/actionbar/progress/unread')}
            labelShort={t('article/actionbar/progress/unread')}
            onClick={() => {
              removeDocumentProgress(documentId)
            }}
          />
        </CalloutMenu>
      )
    }
  }

  return (
    <>
      <IconButton
        Icon={ProgressCircleIcon}
        onClick={!noScroll ? restoreArticleProgress : undefined}
        href={restoreArticleProgress ? '#' : undefined}
        title={datetime(t, new Date(updatedAt))}
        label={
          forceShortLabel
            ? `${percent}%`
            : t('progress/restore/title', {
                percent: `${percent}%`
              })
        }
        labelShort={
          forceShortLabel
            ? `${percent}%`
            : t('progress/restore/titleShort', {
                percent: `${percent}%`
              })
        }
        style={{ marginRight: 10 }}
      />
      {noCallout ? (
        <MarkAsReadIcon />
      ) : (
        <CalloutMenu Element={MarkAsReadIcon}>
          <IconButton
            Icon={MdCheckCircleOutlined}
            title={t('article/actionbar/progress/markasread')}
            label={t('article/actionbar/progress/markasread')}
            labelShort={t('article/actionbar/progress/markasread')}
            onClick={() => {
              upsertDocumentProgress(documentId, 1, '')
            }}
          />
        </CalloutMenu>
      )}
    </>
  )
}

UserProgress.contextTypes = {
  restoreArticleProgress: PropTypes.func
}

export default compose(withT, withProgressApi)(UserProgress)
