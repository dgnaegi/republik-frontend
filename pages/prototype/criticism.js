import React, { Fragment, useState } from 'react'
import { css } from 'glamor'

import Frame from '../../components/Frame'

const styles = {
  carusell: css({
    position: 'absolute',
    left: 0,
    right: 0,
    width: '100%',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    whiteSpace: 'nowrap',
    paddingBottom: 10
  }),
  item: css({
    display: 'inline-block',
    boxSizing: 'content-box',
    width: 316,
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

const Carusell = ({ style, items }) => {
  return (
    <div {...styles.carusell} style={style}>
      {items.map(([src, href], i) => (
        <a key={i} href={href} {...styles.item}>
          <img src={`/static/prototype/card_${src}`} />
        </a>
      ))}
    </div>
  )
}

const StaticPage = () => {
  const [filter, setFilter] = useState('alle')
  return (
    <Frame raw meta={{ title: 'Kritik' }}>
      <div style={{ position: 'relative', minHeight: '100vh', maxWidth: 375, margin: '0 auto' }}>
        <img width='100%' src={`/static/prototype/kritik_${filter}.png`} />
        <a
          style={{ top: 530, height: 50, cursor: 'pointer' }}
          onClick={() => {
            setFilter(filter === 'buch' ? 'alle' : 'buch')
          }}
          {...styles.area} />
        {filter === 'buch' && <Fragment>
          <a href='/2019/06/03/das-glueck-meines-lebens'
            style={{ top: 600, height: 283 }}
            {...styles.area} />
          <a href='/2019/06/01/die-hoffnung-stirbt-auch-in-mexiko-zuletzt'
            style={{ top: 600 + 283, height: 279 }}
            {...styles.area} />
          <a href='/2019/02/13/wir-reden-ueber-neue-buecher-live-im-zuercher-kosmos'
            style={{ top: 600 + 283 + 279, height: 290 }}
            {...styles.area} />
        </Fragment>}
        <Carusell
          style={{ top: 190 }}
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
