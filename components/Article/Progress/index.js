import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { compose, withApollo } from 'react-apollo'
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
import { withRouter } from 'next/router'

import ProgressPrompt from './ProgressPrompt'
import { mediaQueries } from '@project-r/styleguide'

import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from '../../constants'
import { scrollIt } from '../../../lib/utils/scroll'
import withMe from '../../../lib/apollo/withMe'
import { PROGRESS_EXPLAINER_PATH } from '../../../lib/constants'
import createPersistedState from '../../../lib/hooks/use-persisted-state'

import { withProgressApi, mediaProgressQuery } from './api'

const MIN_INDEX = 2
const RESTORE_AREA = 0
const RESTORE_FADE_AREA = 200
const RESTORE_MIN = 0.4

const useLocalMediaProgressState = createPersistedState(
  'republik-progress-media'
)

class ProgressContextProvider extends React.Component {
  getChildContext() {
    return {
      getMediaProgress: this.props.value.getMediaProgress,
      saveMediaProgress: this.props.value.saveMediaProgress,
      restoreArticleProgress: this.props.value.restoreArticleProgress
    }
  }
  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>
  }
}

ProgressContextProvider.childContextTypes = {
  getMediaProgress: PropTypes.func,
  saveMediaProgress: PropTypes.func,
  restoreArticleProgress: PropTypes.func
}

const Progress = ({
  children,
  me,
  revokeProgressConsent,
  submitProgressConsent,
  article,
  isArticle,
  router,
  upsertDocumentProgress,
  upsertMediaProgress,
  client
}) => {
  const refContainer = useRef()
  const lastClosestIndex = useRef()
  const refSaveProgress = useRef()
  const lastY = useRef()

  const isTrackingAllowed = me && me.progressConsent === true
  const mobile = () => window.innerWidth < mediaQueries.mBreakPoint
  const headerHeight = () => (mobile() ? HEADER_HEIGHT_MOBILE : HEADER_HEIGHT)

  const [
    localMediaProgress,
    setLocalMediaProgress
  ] = useLocalMediaProgressState()

  const getProgressElements = () => {
    const progressElements = refContainer.current
      ? Array.from(refContainer.current.querySelectorAll('[data-pos]'))
      : []
    return progressElements
  }

  const getClosestElement = progressElements => {
    const getDistanceForIndex = index => {
      return Math.abs(
        progressElements[index].getBoundingClientRect().top - headerHeight()
      )
    }

    let closestIndex =
      (progressElements[lastClosestIndex.current] &&
        lastClosestIndex.current) ||
      0

    let closestDistance = getDistanceForIndex(closestIndex)

    for (let i = closestIndex + 1; i < progressElements.length; i += 1) {
      const distance = getDistanceForIndex(i)
      if (distance > closestDistance) {
        break
      }
      closestDistance = distance
      closestIndex = i
    }

    for (let i = closestIndex - 1; i >= 0; i -= 1) {
      const distance = getDistanceForIndex(i)
      if (distance > closestDistance) {
        break
      }
      closestDistance = distance
      closestIndex = i
    }

    lastClosestIndex.current = closestIndex

    return {
      nodeId: progressElements[closestIndex].getAttribute('data-pos'),
      index: closestIndex
    }
  }

  const getPercentage = progressElements => {
    const lastElement = progressElements[progressElements.length - 1]
    const { bottom } = lastElement.getBoundingClientRect()
    const { top } = refContainer.current.getBoundingClientRect()
    const height = bottom - top
    const yFromArticleTop = Math.max(0, -top + headerHeight())
    const ratio = yFromArticleTop / height
    const percentage =
      ratio === 0 ? 0 : -top + window.innerHeight > height ? 1 : ratio
    return percentage
  }

  refSaveProgress.current = debounce(() => {
    if (!article || !isTrackingAllowed) {
      return
    }

    // measure between debounced calls
    // to handle bouncy upwards scroll on iOS
    // e.g. y200 -> y250 in onScroll -> bounce back to y210
    const y = window.pageYOffset
    const downwards = lastY.current === undefined || y > lastY.current
    lastY.current = y

    if (!downwards) {
      return
    }

    const progressElements = getProgressElements()
    if (!progressElements.length) {
      return
    }

    const element = getClosestElement(progressElements)
    const percentage = getPercentage(progressElements)

    if (
      element &&
      element.nodeId &&
      percentage > 0 &&
      // ignore elements until min index
      element.index >= MIN_INDEX &&
      (!article.userProgress ||
        article.userProgress.nodeId !== element.nodeId ||
        Math.floor(article.userProgress.percentage * 100) !==
          Math.floor(percentage * 100))
    ) {
      upsertDocumentProgress(article.id, percentage, element.nodeId)
    }
  }, 300)

  const restoreArticleProgress = e => {
    if (e) {
      e.preventDefault()
    }
    const { userProgress } = article
    const { percentage, nodeId } = userProgress

    const progressElements = getProgressElements()
    const progressElement =
      !!nodeId &&
      progressElements.find((element, index) => {
        if (element.getAttribute('data-pos') === nodeId) {
          return true
        }
        return false
      })

    if (progressElement) {
      const { top } = progressElement.getBoundingClientRect()
      const isInViewport = top - headerHeight() > 0 && top < window.innerHeight
      // We don't scroll on mobile if the element of interest is already in viewport
      // This may happen on swipe navigation in iPhone X.
      if (!mobile() || !isInViewport) {
        scrollIt(
          window.pageYOffset + top - headerHeight() - (mobile() ? 10 : 20),
          400
        )
      }
      return
    }
    if (percentage) {
      const { height } = refContainer.current.getBoundingClientRect()
      const offset = percentage * height - headerHeight()
      scrollIt(offset, 400)
    }
  }

  const saveMediaProgressNotPlaying = debounce((mediaId, currentTime) => {
    // Fires on pause, on scrub, on end of video.
    if (isTrackingAllowed) {
      upsertMediaProgress(mediaId, currentTime)
    } else {
      setLocalMediaProgress({ mediaId, currentTime })
    }
  }, 300)

  const saveMediaProgressWhilePlaying = throttle(
    (mediaId, currentTime) => {
      // Fires every 5 seconds while playing.
      if (isTrackingAllowed) {
        upsertMediaProgress(mediaId, currentTime)
      } else {
        setLocalMediaProgress({ mediaId, currentTime })
      }
    },
    5000,
    { trailing: true }
  )

  const saveMediaProgress = ({ mediaId }, mediaElement) => {
    if (!mediaId) {
      return
    }
    saveMediaProgressNotPlaying(mediaId, mediaElement.currentTime)
    saveMediaProgressWhilePlaying(mediaId, mediaElement.currentTime)
  }

  const getMediaProgress = ({ mediaId, durationMs } = {}) => {
    if (!mediaId) {
      return Promise.resolve()
    }
    if (isTrackingAllowed) {
      return client
        .query({
          query: mediaProgressQuery,
          variables: { mediaId },
          fetchPolicy: 'network-only'
        })
        .then(({ data: { mediaProgress: { secs } } = {} }) => {
          if (secs) {
            if (
              durationMs &&
              Math.round(secs) === Math.round(durationMs / 1000)
            ) {
              return
            }
            return secs - 2
          }
        })
    } else if (localMediaProgress && localMediaProgress.mediaId === mediaId) {
      return Promise.resolve(localMediaProgress.currentTime - 2)
    }
    return Promise.resolve()
  }

  useEffect(() => {
    const onScroll = () => {
      refSaveProgress.current()
    }
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      refSaveProgress.current.cancel()
    }
  }, [])

  const showConsentPrompt =
    isArticle &&
    me &&
    !router.query.trialSignup &&
    me.progressConsent === null &&
    article &&
    article.meta &&
    article.meta.path !== PROGRESS_EXPLAINER_PATH

  const progressPrompt = showConsentPrompt && (
    <ProgressPrompt
      onSubmitConsent={submitProgressConsent}
      onRevokeConsent={revokeProgressConsent}
    />
  )

  return (
    <ProgressContextProvider
      value={{ getMediaProgress, saveMediaProgress, restoreArticleProgress }}
    >
      <div ref={refContainer}>
        {progressPrompt || null}
        {children}
      </div>
    </ProgressContextProvider>
  )
}

Progress.propTypes = {
  children: PropTypes.node,
  me: PropTypes.shape({
    progressConsent: PropTypes.bool
  }),
  revokeConsent: PropTypes.func,
  submitConsent: PropTypes.func,
  isArticle: PropTypes.bool
}

Progress.defaultProps = {
  isArticle: true
}

export default compose(
  withApollo,
  withProgressApi,
  withMe,
  withRouter
)(Progress)
