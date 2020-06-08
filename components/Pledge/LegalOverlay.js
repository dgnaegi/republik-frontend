import React, { useState } from 'react'
import dynamic from 'next/dynamic'

import fetch from 'isomorphic-unfetch'

import {
  Overlay,
  OverlayBody,
  OverlayToolbar,
  OverlayToolbarConfirm,
  Interaction,
  A
} from '@project-r/styleguide'

import { MdClose } from 'react-icons/md'
import Loader from '../Loader'

const pages = [
  {
    href: '/agb',
    content: dynamic(
      () => import('../../pages/legal/tos.js').then(mod => mod.Content),
      { loading: () => <Loader /> }
    )
  },
  {
    href: '/datenschutz',
    content: dynamic(
      () => import('../../pages/legal/privacy.js').then(mod => mod.Content),
      { loading: () => <Loader /> }
    )
  },
  {
    href: '/statuten',
    content: dynamic(
      () => import('../../pages/legal/statute.js').then(mod => mod.Content),
      { loading: () => <Loader /> }
    )
  }
]

export const SUPPORTED_HREFS = pages.map(p => p.href)

const LegalOverlay = ({ onClose, href, title }) => {
  const page = pages.find(p => p.href === href)

  return (
    <Overlay mUpStyle={{ maxWidth: 720, minHeight: 'none' }} onClose={onClose}>
      <OverlayToolbar>
        <Interaction.Emphasis style={{ padding: '15px 20px', fontSize: 16 }}>
          {title}
        </Interaction.Emphasis>
        <OverlayToolbarConfirm
          onClick={onClose}
          label={<MdClose size={24} fill='#000' />}
        />
      </OverlayToolbar>
      <OverlayBody>
        {page ? (
          <page.content />
        ) : (
          <Interaction.P>
            <A href={href} target='_blank'>
              Jetzt anzeigen
            </A>
          </Interaction.P>
        )}
      </OverlayBody>
    </Overlay>
  )
}

export default LegalOverlay
