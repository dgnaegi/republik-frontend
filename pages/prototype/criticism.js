import React, { Fragment, useState } from 'react'

import Frame from '../../components/Frame'
import { Carusell, Area, useScale } from '../../components/Prototype'
import PathLink from '../../components/Link/Path'

import { scrollIt } from '../../lib/utils/scroll'

const StaticPage = () => {
  const scale = Math.min(1, useScale(375))

  const [filter, setFilter] = useState('alle')
  return (
    <Frame raw meta={{ title: 'Kritik' }}>
      <div style={{ position: 'relative', minHeight: '100vh', maxWidth: 375, margin: '0 auto' }}>
        <img width='100%' src={`/static/prototype/kritik_${filter}.png`} />
        <Area
          style={{
            top: 530 * scale, height: 50 * scale, cursor: 'pointer'
          }}
          onClick={(e) => {
            setFilter(filter === 'buch' ? 'alle' : 'buch')
            const target = 555 * scale
            if (window.pageYOffset < target) {
              scrollIt(target)
            }
          }} />
        {filter === 'buch' && <Fragment>
          <PathLink path='/2019/06/03/das-glueck-meines-lebens' passHref>
            <Area style={{ top: 600 * scale, height: 283 * scale }} />
          </PathLink>
          <PathLink path='/2019/06/01/die-hoffnung-stirbt-auch-in-mexiko-zuletzt' passHref>
            <Area style={{ top: (600 + 283) * scale, height: 279 * scale }} />
          </PathLink>
          <PathLink path='/2019/02/13/wir-reden-ueber-neue-buecher-live-im-zuercher-kosmos' passHref>
            <Area style={{ top: (600 + 283 + 279) * scale, height: 290 * scale }} />
          </PathLink>
        </Fragment>}
        <Carusell
          style={{ top: 190 * scale }}
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
    </Frame>
  )
}

export default StaticPage
