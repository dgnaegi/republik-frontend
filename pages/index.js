import React from 'react'
import { compose } from 'react-apollo'
import { withRouter } from 'next/router'

import { Carusell, Area, useScale } from '../components/Prototype'
import PathLink from '../components/Link/Path'
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

const StaticFront = () => {
  const scale = Math.min(1, useScale(375))
  return (
    <div style={{ position: 'relative', minHeight: '100vh', maxWidth: 375, margin: '0 auto' }}>
      <img width='100%' src='/static/prototype/front.png' />

      <PathLink path='/2019/05/18/am-ende-der-rebellion' passHref>
        <Area style={{ height: 365 * scale }} />
      </PathLink>
      <Link route='feed' passHref>
        <Area style={{ top: 700 * scale, height: 50 * scale }} />
      </Link>
      <Link route='prototype/criticism' passHref>
        <Area style={{ top: 3255 * scale, height: 50 * scale }} />
      </Link>

      <Carusell
        style={{ top: 1110 * scale }}
        width={225 * scale}
        items={[
          [
            'bookmark-1.png'
          ],
          [
            'bookmark-2.png'
          ]
        ]} />

      <Carusell
        style={{ top: 1430 * scale }}
        width={225 * scale}
        items={[
          [
            'read-1.png'
          ],
          [
            'read-2.png'
          ]
        ]} />

      <Carusell
        style={{ top: 1790 * scale }}
        width={316 * scale}
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
        style={{ top: 2630 * scale }}
        width={316 * scale}
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
        style={{ top: 3315 * scale }}
        width={316 * scale}
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
