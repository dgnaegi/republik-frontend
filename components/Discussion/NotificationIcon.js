import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { fontStyles } from '@project-r/styleguide'

import NotificationsIcon from 'react-icons/lib/md/notifications'
import NotificationsOffIcon from 'react-icons/lib/md/notifications-off'

const DEFAULT_SIZE = 24

export const styles = {
  link: css({
    cursor: 'pointer',
    display: 'block'
  }),
  text: css({
    ...fontStyles.sansSerifRegular14,
    display: 'block'
  })
}

const Icon = ({
  off,
  fill,
  children,
  size = DEFAULT_SIZE,
  style,
  onClick
}) => {
  const Icon = off ? NotificationsOffIcon : NotificationsIcon

  return (
    <a
      {...styles.link}
      onClick={onClick}
      style={style}
    >
      <Icon fill={fill} size={size} style={{position: 'absolute', top: '-4px'}} />
      {children && (
        <span {...styles.text} style={{paddingLeft: `${size + 5}px`}}>
          {children}
        </span>
      )}
    </a>
  )
}

Icon.propTypes = {
  off: PropTypes.bool,
  fill: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.number,
  style: PropTypes.object,
  onClick: PropTypes.func
}

export default Icon
