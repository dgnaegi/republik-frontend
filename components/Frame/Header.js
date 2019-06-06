import React, { Component, Fragment } from 'react'
import { css, merge } from 'glamor'
import { compose } from 'react-apollo'
import { withRouter } from 'next/router'

import withT from '../../lib/withT'
import { Router, cleanAsPath } from '../../lib/routes'
import withInNativeApp, { postMessage } from '../../lib/withInNativeApp'

import { Logo, colors, mediaQueries } from '@project-r/styleguide'

import { withMembership } from '../Auth/checkRoles'

import Toggle from './Toggle'
import Popover from './Popover'
import NavPopover from './Popover/Nav'
import LoadingBar from './LoadingBar'
import Pullable from './Pullable'

import Search from 'react-icons/lib/md/search'
import BackIcon from '../Icons/Back'

import { shouldIgnoreClick } from '../Link/utils'

import {
  HEADER_HEIGHT,
  HEADER_HEIGHT_MOBILE,
  ZINDEX_HEADER,
  LOGO_WIDTH,
  LOGO_PADDING,
  LOGO_WIDTH_MOBILE,
  LOGO_PADDING_MOBILE
} from '../constants'
import { negativeColors } from './constants'

const SEARCH_BUTTON_WIDTH = 28
const TRANSITION_MS = 200

const styles = {
  bar: css({
    zIndex: ZINDEX_HEADER,
    position: 'relative'
  }),
  barPad: css({
    minHeight: HEADER_HEIGHT_MOBILE,
    [mediaQueries.mUp]: {
      minHeight: HEADER_HEIGHT
    }
  }),
  center: css({
    margin: '0 auto 0',
    textAlign: 'left',
    transition: `opacity ${TRANSITION_MS}ms ease-in-out`
  }),
  logo: css({
    position: 'relative',
    display: 'inline-block',
    padding: LOGO_PADDING_MOBILE,
    paddingLeft: 15,
    width: LOGO_WIDTH_MOBILE + LOGO_PADDING_MOBILE + 15,
    [mediaQueries.mUp]: {
      padding: LOGO_PADDING,
      paddingLeft: 20,
      width: LOGO_WIDTH + LOGO_PADDING + 20
    },
    verticalAlign: 'middle'
  }),
  leftItem: css({
    '@media print': {
      display: 'none'
    },
    transition: `opacity ${TRANSITION_MS}ms ease-in-out`
  }),
  back: css({
    display: 'block',
    position: 'absolute',
    left: 0,
    top: -1,
    padding: '10px 10px 10px 15px',
    [mediaQueries.mUp]: {
      top: -1 + 8
    }
  }),
  hamburger: css({
    '@media print': {
      display: 'none'
    },
    position: 'absolute',
    overflow: 'hidden',
    top: 0,
    right: 0,
    display: 'inline-block',
    height: HEADER_HEIGHT_MOBILE - 2,
    width: HEADER_HEIGHT_MOBILE - 2 + 5,
    [mediaQueries.mUp]: {
      height: HEADER_HEIGHT - 2,
      width: HEADER_HEIGHT - 2 + 5
    }
  }),
  search: css({
    outline: 'none',
    WebkitAppearance: 'none',
    background: 'transparent',
    border: 'none',
    padding: '0',
    cursor: 'pointer',
    '@media print': {
      display: 'none'
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    overflow: 'hidden',
    top: 0,
    right: HEADER_HEIGHT_MOBILE - 1,
    height: HEADER_HEIGHT_MOBILE - 2,
    width: SEARCH_BUTTON_WIDTH,
    [mediaQueries.mUp]: {
      height: HEADER_HEIGHT - 2,
      width: HEADER_HEIGHT - 2 - 10,
      right: HEADER_HEIGHT - 2 + 5
    }
  }),
  secondary: css({
    position: 'relative',
    zIndex: ZINDEX_HEADER,
    paddingLeft: 15,
    paddingRight: 15,
    display: 'block',
    height: HEADER_HEIGHT_MOBILE,
    paddingTop: '10px',
    [mediaQueries.mUp]: {
      paddingLeft: 20,
      paddingRight: 20,
      height: HEADER_HEIGHT,
      paddingTop: '18px'
    },
    transition: `opacity ${TRANSITION_MS}ms ease-in-out`
  }),
  hr: css({
    position: 'relative',
    margin: 0,
    display: 'block',
    border: 0,
    width: '100%',
    zIndex: ZINDEX_HEADER
  }),
  hrThin: css({
    height: 1
  }),
  hrThick: css({
    height: 3
  }),
  fixed: css({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: ZINDEX_HEADER
  })
}

// Workaround for WKWebView fixed 0 rendering hickup
// - iOS 11.4: header is transparent and only appears after triggering a render by scrolling down enough
const forceRefRedraw = ref => {
  if (ref) {
    const redraw = () => {
      const display = ref.style.display
      // offsetHeight
      ref.style.display = 'none'
      /* eslint-disable-next-line no-unused-expressions */
      ref.offsetHeight // this force webkit to flush styles (render them)
      ref.style.display = display
    }
    const msPerFrame = 1000 / 30 // assuming 30 fps
    const frames = [1, 10, 20, 30]
    // force a redraw on frame x after initial dom mount
    frames.forEach(frame => {
      setTimeout(redraw, msPerFrame * frame)
    })
  }
}

const hasBackButton = props => (
  props.inNativeIOSApp &&
  props.me &&
  cleanAsPath(props.router.asPath) === '/'
)

let routeChangeStarted

class Header extends Component {
  constructor (props) {
    super(props)

    this.state = {
      opaque: true,
      mobile: false,
      expanded: false,
      backButton: hasBackButton(props)
    }

    this.setFixedRef = ref => {
      this.fixedRef = ref
    }

    this.diff = 0
    this.onScroll = () => {
      const y = Math.max(window.pageYOffset, 0)
      const diff = this.lastY
        ? this.lastY - y
        : 0
      this.diff += diff
      this.diff = Math.min(
        Math.max(-this.height, this.diff),
        0
      )

      if (this.diff !== this.lastDiff) {
        this.fixedRef.style.top = `${this.diff}px`
      }

      this.lastY = y
      this.lastDiff = this.diff
    }

    this.measure = () => {
      const mobile = window.innerWidth < mediaQueries.mBreakPoint
      if (mobile !== this.state.mobile) {
        this.setState({ mobile })
      }
      const { height } = this.fixedRef.getBoundingClientRect()
      this.height = height
      if (height !== this.state.height) {
        this.setState({ height })
      }
      this.onScroll()
    }

    this.close = () => {
      this.setState({ expanded: false })
    }
  }

  componentDidMount () {
    window.addEventListener('scroll', this.onScroll)
    window.addEventListener('resize', this.measure)
    this.measure()
  }

  componentDidUpdate () {
    this.measure()
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.measure)
  }

  componentWillReceiveProps (nextProps) {
    const backButton = hasBackButton(nextProps)
    if (this.state.backButton !== backButton) {
      this.setState({
        backButton
      })
    }
    clearTimeout(this.secondaryNavTimeout)
  }

  render () {
    const {
      router,
      t,
      me,
      secondaryNav,
      onPrimaryNavExpandedChange,
      primaryNavExpanded,
      formatColor,
      inNativeApp,
      inNativeIOSApp,
      isMember,
      headerAudioPlayer: HeaderAudioPlayer
    } = this.props
    const { backButton, height } = this.state

    // If onPrimaryNavExpandedChange is defined, expanded state management is delegated
    // up to the higher-order component. Otherwise it's managed inside the component.
    const expanded = !!(onPrimaryNavExpandedChange
      ? primaryNavExpanded
      : this.state.expanded
    )
    const dark = this.props.dark && !expanded

    const opaque = this.state.opaque || expanded
    const barStyle = opaque ? merge(styles.bar, styles.barOpaque) : styles.bar

    const bgStyle = opaque ? {
      backgroundColor: dark ? negativeColors.primaryBg : '#fff'
    } : undefined
    const hrColor = dark ? negativeColors.containerBg : colors.divider
    const hrColorStyle = {
      color: hrColor,
      backgroundColor: hrColor
    }
    const textFill = dark ? negativeColors.text : colors.text
    const logoFill = dark ? '#fff' : '#000'

    const toggleExpanded = () => {
      if (onPrimaryNavExpandedChange) {
        onPrimaryNavExpandedChange(!expanded)
      } else {
        this.setState({ expanded: !expanded })
      }
    }

    return (
      <Fragment>
        <div style={{ height }} />
        <div {...height && styles.fixed} ref={this.setFixedRef}>
          <div {...barStyle} ref={inNativeIOSApp ? forceRefRedraw : undefined} style={bgStyle}>
            {opaque && <Fragment>
              <div {...styles.center} style={{ opacity: 1 }}>
                <a
                  {...styles.logo}
                  aria-label={t('header/logo/magazine/aria')}
                  href={'/'}
                  onClick={e => {
                    if (shouldIgnoreClick(e)) {
                      return
                    }
                    e.preventDefault()
                    if (router.pathname === '/') {
                      window.scrollTo(0, 0)
                      if (expanded) {
                        toggleExpanded()
                      }
                    } else {
                      Router.pushRoute('index').then(() => window.scrollTo(0, 0))
                    }
                  }}
                >
                  <Logo fill={logoFill} />
                </a>
              </div>
              {inNativeIOSApp && <a
                style={{
                  opacity: backButton ? 1 : 0,
                  pointerEvents: backButton ? undefined : 'none',
                  href: '#back'
                }}
                title={t('header/back')}
                onClick={(e) => {
                  e.preventDefault()
                  if (backButton) {
                    routeChangeStarted = false
                    window.history.back()
                    setTimeout(
                      () => {
                        if (!routeChangeStarted) {
                          Router.replaceRoute(
                            'feed'
                          ).then(() => window.scrollTo(0, 0))
                        }
                      },
                      200
                    )
                  }
                }}
                {...styles.leftItem} {...styles.back}>
                <BackIcon size={25} fill={textFill} />
              </a>}
              {isMember && <button
                {...styles.search}
                role='button'
                title={t('header/nav/search/aria')}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (router.pathname === '/search') {
                    window.scrollTo(0, 0)
                  } else {
                    Router.pushRoute('search').then(() => window.scrollTo(0, 0))
                  }
                }}>
                <Search
                  fill={textFill}
                  size={28} />
              </button>}
              <div {...styles.hamburger} style={bgStyle}>
                <Toggle
                  dark={dark}
                  expanded={expanded}
                  id='primary-menu'
                  title={t(`header/nav/${expanded ? 'close' : 'open'}/aria`)}
                  onClick={toggleExpanded}
                />
              </div>
            </Fragment>}
          </div>
          {secondaryNav && <Fragment>
            <hr
              {...styles.hr}
              {...styles.hrThin}
              style={hrColorStyle} />
            {HeaderAudioPlayer ? (
              <HeaderAudioPlayer
                style={{ ...bgStyle, width: '100%' }}
                controlsPadding={this.state.mobile ? 10 : 20}
                height={this.state.mobile ? HEADER_HEIGHT_MOBILE : HEADER_HEIGHT}
              />
            ) : (
              <div {...styles.secondary} style={{
                opacity: 1
              }}>
                {secondaryNav}
              </div>
            )}

          </Fragment>}
          {opaque && <hr
            {...styles.hr}
            {...styles[formatColor ? 'hrThick' : 'hrThin']}
            style={formatColor ? {
              color: formatColor,
              backgroundColor: formatColor
            } : hrColorStyle} />}
        </div>
        <Popover expanded={expanded}>
          <NavPopover
            me={me}
            router={router}
            closeHandler={this.close}
          />
        </Popover>
        <LoadingBar onRouteChangeStart={() => {
          routeChangeStarted = true
        }} />
        {inNativeApp && <Pullable dark={dark} onRefresh={() => {
          if (inNativeIOSApp) {
            postMessage({ type: 'haptic', payload: { type: 'impact' } })
          }
          // give the browser 3 frames (1000/30fps) to start animating the spinner
          setTimeout(
            () => {
              window.location.reload(true)
            },
            33 * 3
          )
        }} />}
      </Fragment>
    )
  }
}

export default compose(
  withT,
  withMembership,
  withRouter,
  withInNativeApp
)(Header)
