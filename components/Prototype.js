import React from 'react'
import { css } from 'glamor'
import PathLink from './Link/Path'

export const useScale = (baseWidth) => {
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

const styles = {
  carusell: css({
    position: 'absolute',
    left: 0,
    right: 0,
    width: '100%',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    whiteSpace: 'nowrap',
    paddingBottom: 10
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

export const Area = props => (
  <a {...props} {...styles.area} />
)

export const Carusell = ({ style, items, width }) => {
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
