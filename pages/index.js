import React, { useState } from 'react'
import { Button } from '@project-r/styleguide'

import Frame from '../components/Frame'
import Marketing from '../components/Marketing'
import PathLink from '../components/Link/Path'

import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../lib/constants'

const IndexPage = () => {
  const [page, setPage] = useState(null)

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

const FullFrontal = () => {
  const meta = {
    pageTitle: 'Seite 1',
    title: 'Republik',
    description: 'Republik',
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
    url: `${PUBLIC_BASE_URL}/`
  }
  return (
    <Frame raw meta={meta}>
      <PathLink path='/2020/08/28/plopp' passHref>
        <div>
          <img
            style={{ display: 'block' }}
            width='100%'
            src='/static/marketing/plop.gif'
          />
          <img
            style={{ display: 'block' }}
            width='100%'
            src='/static/marketing/plop.png'
          />
        </div>
      </PathLink>
      <PathLink
        path='/2020/09/02/vom-zauber-des-belanglosen-innehaltens'
        passHref
      >
        <img
          style={{ display: 'block' }}
          width='100%'
          src='/static/marketing/zauber.png'
        />
      </PathLink>
      <div
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0) 20%,rgba(0,0,0,1) 90%)'
        }}
      >
        <img
          style={{ display: 'block', zIndex: -1, position: 'relative' }}
          width='100%'
          src='/static/marketing/blasen.png'
        />
      </div>
      <img
        style={{ display: 'block' }}
        width='100%'
        src='/static/marketing/warum.png'
      />
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

export default IndexPage
