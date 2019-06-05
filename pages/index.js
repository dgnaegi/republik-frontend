import React from 'react'
import { compose } from 'react-apollo'
import { css } from 'glamor'
import { withRouter } from 'next/router'

import Frame from '../components/Frame'
import Marketing from '../components/Marketing'
import withInNativeApp from '../lib/withInNativeApp'
import withT from '../lib/withT'
import { Link } from '../lib/routes'
import withMembership, { UnauthorizedPage } from '../components/Auth/withMembership'

import {
  PUBLIC_BASE_URL,
  CDN_FRONTEND_BASE_URL
} from '../lib/constants'

const styles = {
  carusell: css({
    position: 'absolute',
    left: 0,
    right: 0,
    width: '100%',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    paddingBottom: 10
    // opacity: 0.5
  }),
  item: css({
    display: 'inline-block',
    boxSizing: 'content-box',
    marginLeft: 15,
    '&:last-child': {
      marginRight: 15
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

const Carusell = ({ style, items, width = 316 }) => {
  return (
    <div {...styles.carusell} style={style}>
      {items.map(([src, href], i) => (
        <a key={i} href={href} {...styles.item} style={{ width }}>
          <img src={`/static/prototype/card_${src}`} />
        </a>
      ))}
    </div>
  )
}

const StaticFront = () => {
  return (
    <div style={{ position: 'relative', maxWidth: 375, margin: '0 auto' }}>
      <img width='100%' src='/static/prototype/front.png' />

      <a href='/2019/05/18/am-ende-der-rebellion'
        style={{ height: 365 }}
        {...styles.area} />
      <a href='/feed'
        style={{ top: 700, height: 50 }}
        {...styles.area} />
      <Link route='prototype/criticism'>
        <a style={{ top: 3255, height: 50 }}
          {...styles.area} />
      </Link>

      <Carusell
        style={{ top: 1110 }}
        width={225}
        items={[
          [
            'bookmark-1.png'
          ],
          [
            'bookmark-2.png'
          ]
        ]} />

      <Carusell
        style={{ top: 1430 }}
        width={225}
        items={[
          [
            'read-1.png'
          ],
          [
            'read-2.png'
          ]
        ]} />

      <Carusell
        style={{ top: 1790 }}
        items={[
          [
            'serien-1.png',
            '/2018/01/19/usa-serie'
          ],
          [
            'serien-2.png',
            '/2018/04/24/das-kartell-teil-1-der-aussteiger'
          ],
          [
            'serien-3.png',
            '/2019/05/30/traum-vom-imperium'
          ],
          [
            'serien-4.png',
            '/2019/06/04/alle-kennen-carlos-den-taeter-niemand-mike-das-opfer'
          ]
        ]} />
      <Carusell
        style={{ top: 2630 }}
        items={[
          [
            'kolumnen-1.png',
            '/2019/05/25/der-deal-fuer-den-fortschritt'
          ],
          [
            'kolumnen-2.png',
            '/2019/05/14/politik-ohne-zukunft'
          ],
          [
            'kolumnen-3.png',
            '/2018/11/06/nerds-retten-die-welt-10'
          ]
        ]} />
      <Carusell
        style={{ top: 3315 }}
        items={[
          [
            'kritik-1.png',
            '/2019/05/22/geliebte-psychobitch'
          ],
          [
            'kritik-2.png',
            '/2019/05/13/gegen-die-kolonie-im-kopf'
          ],
          [
            'kritik-3.png',
            '/2019/03/15/unbedingt-absolut-frei'
          ],
          [
            'kritik-4.png',
            '/2019/02/06/bewegung-bitte'
          ]
        ]} />
    </div>
  )
}

const IndexPage = ({ t, me, isMember, inNativeIOSApp, router }) => {
  if (inNativeIOSApp) {
    return <UnauthorizedPage me={me} />
  }
  const meta = {
    pageTitle: t('pages/index/pageTitle'),
    title: t('pages/index/title'),
    description: t('pages/index/description'),
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
    url: `${PUBLIC_BASE_URL}/`
  }
  return (
    <Frame raw meta={meta}>
      {isMember ? <StaticFront /> : <Marketing />}
    </Frame>
  )
}

export default compose(
  withMembership,
  withInNativeApp,
  withT,
  withRouter
)(IndexPage)
