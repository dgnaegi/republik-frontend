import React, { useState } from 'react'
import { Button } from '@project-r/styleguide'
import { css } from 'glamor'

import Frame from '../components/Frame'
import Marketing from '../components/Marketing'
import PathLink from '../components/Link/Path'
import Join from '../components/Pledge/Join'
import { scrollToEnd } from '../lib/utils/scroll'

import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../lib/constants'

const IndexPage = () => {
  const [page, setPage] = useState('page1')

  switch (page) {
    case null:
      return (
        <div
          style={{
            position: 'relative',
            minHeight: '100vh',
            maxWidth: 375,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Button
              style={{ marginBottom: 16 }}
              onClick={() => setPage('page1')}
            >
              Seite 1
            </Button>
            <Button onClick={() => setPage('page2')}>Seite 2</Button>
          </div>
        </div>
      )
    case 'page1':
      return <FullFrontal />
    case 'page2':
      return <BeautyBeast />
    default:
      return
  }
}

const useScale = baseWidth => {
  const [windowWidth, setWindowWidth] = React.useState(baseWidth)
  React.useEffect(() => {
    const onResize = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', onResize)
    setWindowWidth(window.innerWidth)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])
  return windowWidth / baseWidth
}

const FullFrontal = () => {
  const meta = {
    pageTitle: 'Republik Magazin',
    title: 'Republik',
    description: 'Republik',
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
    url: `${PUBLIC_BASE_URL}/`
  }
  const scale = Math.min(1, useScale(375))
  return (
    <Frame raw meta={meta}>
      <div style={{ backgroundColor: '#000' }}>
        <div
          style={{
            position: 'relative',
            minHeight: '100vh',
            maxWidth: 375,
            margin: '0 auto'
          }}
        >
          <div {...styles.carusell} style={{ paddingTop: 20 }}>
            <div
              {...styles.item}
              style={{ paddingLeft: 15 * scale, width: 315 * scale }}
            >
              <PathLink
                path='/2020/09/02/vom-zauber-des-belanglosen-innehaltens'
                passHref
              >
                <a style={{ display: 'block' }}>
                  <img src='/static/marketing/card0_0.png' />
                </a>
              </PathLink>
              <PathLink path='/2020/08/28/plopp' passHref>
                <a style={{ display: 'block', position: 'relative' }}>
                  <img src='/static/marketing/card0_1.png' />
                  <img
                    style={{
                      position: 'absolute',
                      left: 151 * scale,
                      top: 29 * scale,
                      width: 141 * scale
                    }}
                    src='/static/marketing/plop.gif'
                  />
                </a>
              </PathLink>
            </div>
            <div
              {...styles.item}
              style={{
                width: 375 * scale,
                verticalAlign: 'top',
                marginTop: -7 * scale
              }}
            >
              <img src='/static/marketing/card1_b.png' />
            </div>
          </div>

          <br />
          <br />
          <img
            style={{ display: 'block' }}
            width='100%'
            src='/static/marketing/warum.png'
          />
          <div style={{ backgroundColor: 'black', padding: 15 }}>
            <Button
              onClick={e => {
                e.preventDefault()
                scrollToEnd()
              }}
              block
              style={{ backgroundColor: '#fff', color: '#000' }}
              white
            >
              Jetzt abonnieren
            </Button>
          </div>
          <img
            style={{ display: 'block' }}
            width='100%'
            src='/static/marketing/rubriken.png'
          />
          <img
            style={{ display: 'block' }}
            width='100%'
            src='/static/marketing/team.png'
          />
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          minHeight: '100vh',
          maxWidth: 375,
          margin: '0 auto'
        }}
      >
        <br />
        <br />
        <img
          style={{ display: 'block' }}
          width='100%'
          src='/static/marketing/community_0.png'
        />
        <PathLink path='/2020/09/01/der-patriarch-in-dir' passHref>
          <a style={{ textDecoration: 'none' }}>
            <img
              style={{ display: 'block' }}
              width='100%'
              src='/static/marketing/community_1.png'
            />
          </a>
        </PathLink>
        <img
          style={{ display: 'block' }}
          width='100%'
          src='/static/marketing/community_2.png'
        />
        <PathLink path='/2020/08/27/was-ist-los-in-der-svp-herr-heer' passHref>
          <a
            style={{
              textDecoration: 'none',
              padding: 15 * scale,
              display: 'block'
            }}
          >
            <img
              style={{ display: 'block' }}
              width='100%'
              src='/static/marketing/community_3_kor.png'
            />
          </a>
        </PathLink>
        <br />
        <br />
        <PathLink path='/vision' passHref>
          <a style={{ textDecoration: 'none' }}>
            <img
              style={{ display: 'block' }}
              width='100%'
              src='/static/marketing/mission.png'
            />
          </a>
        </PathLink>
        <br />
        <br />
        <br />
        <div style={{ padding: 15 }}>
          <Join start />
        </div>
      </div>
    </Frame>
  )
}

const BeautyBeast = () => {
  const meta = {
    pageTitle: 'Seite 2',
    title: 'Republik',
    description: 'Republik',
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
    url: `${PUBLIC_BASE_URL}/`
  }
  return (
    <Frame raw meta={meta}>
      <Marketing />
    </Frame>
  )
}

const styles = {
  carusell: css({
    // position: 'absolute',
    // left: 0,
    // right: 0,
    // width: '100%',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    whiteSpace: 'nowrap',
    paddingBottom: 10
  }),
  item: css({
    display: 'inline-block',
    boxSizing: 'content-box',
    marginLeft: 0,
    '&:last-child': {
      marginRight: 0
    },
    '& img': {
      width: '100%'
    }
  }),
  area: css({
    display: 'block',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  })
}

const Area = props => <a {...props} {...styles.area} />

const Carusell = ({ style, items, width }) => {
  return (
    <div {...styles.carusell} style={style}>
      {items.map(([src, path = ''], i) => (
        <PathLink key={i} path={path} passHref>
          <a href={path} {...styles.item} style={{ width }}>
            <img src={`/static/prototype/card_${src}`} />
          </a>
        </PathLink>
      ))}
    </div>
  )
}

export default IndexPage
