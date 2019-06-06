import React from 'react'
import { compose } from 'react-apollo'
import { Container, RawHtml, fontFamilies, mediaQueries } from '@project-r/styleguide'
import Meta from './Meta'
import Header from './Header'
import Footer from './Footer'
import Box from './Box'
import ProlongBox from './ProlongBox'
import { css } from 'glamor'
import withMe from '../../lib/apollo/withMe'
import withT from '../../lib/withT'
import withInNativeApp from '../../lib/withInNativeApp'
import { negativeColors } from './constants'

import 'glamor/reset'

css.global('html', { boxSizing: 'border-box' })
css.global('*, *:before, *:after', { boxSizing: 'inherit' })

css.global('body', {
  width: '100%',
  fontFamily: fontFamilies.sansSerifRegular
})

// avoid gray rects over links and icons on iOS
css.global('*', {
  WebkitTapHighlightColor: 'transparent'
})
// avoid orange highlight, observed around full screen gallery, on Android
css.global('div:focus', {
  outline: 'none'
})

const styles = {
  container: css({
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  }),
  bodyGrower: css({
    flexGrow: 1
  }),
  content: css({
    paddingTop: 40,
    paddingBottom: 60,
    [mediaQueries.mUp]: {
      paddingTop: 80,
      paddingBottom: 120
    }
  })
}

export const MainContainer = ({ children }) => (
  <Container style={{ maxWidth: '840px' }}>
    {children}
  </Container>
)

export const Content = ({ children, style }) => (
  <div {...styles.content} style={style}>{children}</div>
)

const Index = ({
  t,
  me,
  children,
  raw,
  meta,
  nav,
  inNativeApp,
  inNativeIOSApp,
  onPrimaryNavExpandedChange,
  primaryNavExpanded,
  secondaryNav,
  secondaryNavExpanded,
  showSecondary,
  formatColor,
  headerAudioPlayer,
  onSearchClick,
  dark
}) => (
  <div {...styles.container}>
    <div {...styles.bodyGrower}>
      {dark && <style dangerouslySetInnerHTML={{
        __html: `html, body { background-color: ${negativeColors.containerBg}; color: ${negativeColors.text}; }`
      }} />}
      {!!meta && <Meta data={meta} />}
      <Header
        dark={dark && !inNativeIOSApp}
        me={me}
        onPrimaryNavExpandedChange={onPrimaryNavExpandedChange}
        primaryNavExpanded={primaryNavExpanded}
        secondaryNav={secondaryNav}
        secondaryNavExpanded={secondaryNavExpanded}
        showSecondary={showSecondary}
        formatColor={formatColor}
        headerAudioPlayer={headerAudioPlayer}
      />
      <noscript>
        <Box style={{ padding: 30 }}>
          <RawHtml
            dangerouslySetInnerHTML={{
              __html: t('noscript')
            }} />
        </Box>
      </noscript>
      {me && me.prolongBeforeDate !== null &&
        <ProlongBox
          t={t}
          prolongBeforeDate={me.prolongBeforeDate}
          dark={dark} />}
      {raw ? (
        children
      ) : (
        <MainContainer>
          <Content>{children}</Content>
        </MainContainer>
      )}
    </div>
    {!inNativeApp && <Footer />}
  </div>
)

export default compose(
  withMe,
  withT,
  withInNativeApp
)(Index)
