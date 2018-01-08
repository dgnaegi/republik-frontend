import React, { Component, Fragment } from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import { css } from 'glamor'

import withT from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'

import { Link, Router } from '../../lib/routes'

import Loader from '../Loader'
import Frame, { MainContainer } from '../Frame'
import Box from '../Frame/Box'

import PathLink from '../Link/Path'

import { HEADER_HEIGHT, TESTIMONIAL_IMAGE_SIZE } from '../constants'

import Badge from './Badge'
import Comments from './Comments'
import Contact from './Contact'
import Portrait from './Portrait'
import Statement from './Statement'
import Biography from './Biography'
import Edit from './Edit'

import {
  TeaserFeed,
  Interaction,
  colors,
  fontStyles,
  linkRule,
  mediaQueries,
  FieldSet,
  RawHtml
} from '@project-r/styleguide'

const SIDEBAR_TOP = 20

const PORTRAIT_SIZE_M = TESTIMONIAL_IMAGE_SIZE
const PORTRAIT_SIZE_S = 101

const styles = {
  container: css({
    borderTop: `1px solid ${colors.divider}`,
    position: 'relative',
    paddingBottom: 60,
    paddingTop: 10,
    [mediaQueries.mUp]: {
      paddingTop: SIDEBAR_TOP + 5
    }
  }),
  sidebar: css({
    paddingBottom: '20px',
    [mediaQueries.mUp]: {
      float: 'left',
      width: PORTRAIT_SIZE_M
    }
  }),
  mainColumn: css({
    [mediaQueries.mUp]: {
      float: 'left',
      paddingLeft: 20,
      width: `calc(100% - ${PORTRAIT_SIZE_M}px)`
    }
  }),
  head: css({
    position: 'relative',
    paddingTop: 20
  }),
  statement: css({
    [mediaQueries.mUp]: {
      float: 'right',
      width: `calc(100% - ${PORTRAIT_SIZE_M + 20}px)`,
      paddingBottom: 30
    }
  }),
  portrait: css({
    width: PORTRAIT_SIZE_S,
    height: PORTRAIT_SIZE_S,
    [mediaQueries.mUp]: {
      width: PORTRAIT_SIZE_M,
      height: PORTRAIT_SIZE_M
    }
  }),
  headInfo: css({
    ...fontStyles.sansSerifRegular16,
    position: 'absolute',
    bottom: 5,
    left: PORTRAIT_SIZE_S + 10,
    [mediaQueries.mUp]: {
      left: PORTRAIT_SIZE_M + 20
    }
  }),
  credential: css({
    ...fontStyles.sansSerifRegular16
  }),
  badges: css({
    margin: '20px 0 30px 0'
  })
}

const getPublicUser = gql`
  query getPublicUser($slug: String!) {
    user(slug: $slug) {
      id
      username
      firstName
      lastName
      name
      email
      emailAccessRole
      phoneNumber
      phoneNumberNote
      phoneNumberAccessRole
      portrait
      hasPublicProfile
      isEligibleForProfile
      statement
      biography
      isListed
      isAdminUnlisted
      sequenceNumber
      pgpPublicKey
      pgpPublicKeyId
      credentials {
        description
        verified
      }
      facebookId
      twitterHandle
      publicUrl
      badges
      documents {
        totalCount
        nodes {
          meta {
            kind
            credits
            title
            description
            publishDate
            path
          }
        }
      }
      comments {
        totalCount
        nodes {
          id
          content
          discussion {
            id
            title
            documentPath
          }
          createdAt
        }
      }
    }
  }
`

class Profile extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isMobile: false,
      sticky: false,
      isEditing: false,
      showErrors: false,
      values: {},
      errors: {},
      dirty: {}
    }

    this.onScroll = () => {
      const y = window.pageYOffset
      const mobile = window.innerWidth < mediaQueries.mBreakPoint
      if (!mobile && y + HEADER_HEIGHT > this.y + this.innerHeight) {
        if (!this.state.sticky) {
          this.setState({ sticky: true })
        }
      } else {
        if (this.state.sticky) {
          this.setState({ sticky: false })
        }
      }
    }
    this.innerRef = ref => {
      this.inner = ref
    }
    this.measure = () => {
      const isMobile = window.innerWidth < mediaQueries.mBreakPoint
      if (isMobile !== this.state.isMobile) {
        this.setState({isMobile})
      }
      if (this.inner) {
        const rect = this.inner.getBoundingClientRect()
        this.y = window.pageYOffset + rect.top
        this.innerHeight = rect.height
        this.x = window.pageXOffset + rect.left
      }
      this.onScroll()
    }

    this.startEditing = () => {
      const { me, data: { user } } = this.props
      const { isEditing } = this.state
      if (!isEditing && me && me.id === user.id) {
        this.setState({
          isEditing: true,
          values: {
            ...user,
            portrait: undefined
          }
        })
        window.scrollTo(0, 0)
      }
    }
    this.autoEditStart = () => {
      const { data: { user } } = this.props
      if (user && !user.username && user.isEligibleForProfile) {
        this.startEditing() // will check if it's me
      }
    }
    this.onChange = fields => {
      this.startEditing()
      this.setState(FieldSet.utils.mergeFields(fields))
    }
  }

  componentDidMount () {
    window.addEventListener('scroll', this.onScroll)
    window.addEventListener('resize', this.measure)
    this.measure()
    this.autoEditStart()
  }
  componentDidUpdate (prevProps) {
    this.measure()
    if (!prevProps.data.user) {
      this.autoEditStart()
    }
  }
  componentWillUnmount () {
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.measure)
  }

  render () {
    const {
      url,
      t,
      me,
      data: { loading, error, user }
    } = this.props

    const metaData = {
      title: user
        ? t('pages/profile/pageTitle', { name: user.name })
        : t('pages/profile/empty/pageTitle')
    }

    return (
      <Frame url={url} meta={metaData} raw>
        <Loader
          loading={loading}
          error={error}
          render={() => {
            if (!user) {
              return (
                <MainContainer>
                  <br /><br />
                  <Interaction.H2>{t('pages/profile/empty/title')}</Interaction.H2>
                  {!!me && <p>
                    {t.elements('pages/profile/empty/content', {
                      link: (
                        <Link route='profile' params={{ slug: me.username || me.id }}>
                          <a {...linkRule}>{t('pages/profile/empty/content/linktext')}</a>
                        </Link>
                      )
                    })}
                  </p>}
                </MainContainer>
              )
            }

            const {
              isEditing,
              values, errors, dirty,
              isMobile
            } = this.state

            return (
              <Fragment>
                {!user.hasPublicProfile && (
                  <Box>
                    <MainContainer>
                      <RawHtml type={Interaction.P} dangerouslySetInnerHTML={{
                        __html: t(user.isEligibleForProfile
                          ? 'profile/preview'
                          : 'profile/preview/notEligible'
                        )
                      }} />
                    </MainContainer>
                  </Box>
                )}
                <MainContainer>
                  <div ref={this.innerRef} {...styles.head}>
                    <p {...styles.statement}>
                      <Statement
                        user={user}
                        isEditing={isEditing}
                        onChange={this.onChange}
                        values={values}
                        errors={errors}
                        dirty={dirty} />
                    </p>
                    <div {...styles.portrait}>
                      <Portrait
                        user={user}
                        isEditing={isEditing}
                        onChange={this.onChange}
                        values={values}
                        errors={errors}
                        dirty={dirty} />
                    </div>
                    <div {...styles.headInfo}>
                      {!!user.sequenceNumber && t('memberships/sequenceNumber/label', {
                        sequenceNumber: user.sequenceNumber
                      })}
                    </div>
                  </div>
                  <div {...styles.container}>
                    <div {...styles.sidebar}>
                      <div style={this.state.sticky && !isEditing
                        ? {
                          position: 'fixed',
                          top: `${HEADER_HEIGHT + SIDEBAR_TOP}px`,
                          left: `${this.x}px`,
                          width: PORTRAIT_SIZE_M
                        }
                        : {}}>
                        <Interaction.H3>{user.name}</Interaction.H3>
                        {user.credentials && user.credentials.map((credential, i) => (
                          <div key={i} {...styles.credential}>
                            {credential.description}
                          </div>
                        ))}
                        {user.badges && (
                          <div {...styles.badges}>
                            {user.badges.map(badge => (
                              <Badge badge={badge} size={27} />
                            ))}
                          </div>
                        )}
                        <Contact
                          user={user}
                          isEditing={isEditing}
                          onChange={this.onChange}
                          values={values}
                          errors={errors}
                          dirty={dirty} />
                        {!isMobile && <Edit
                          user={user}
                          state={this.state}
                          setState={this.setState.bind(this)}
                          startEditing={this.startEditing} />}
                      </div>
                    </div>
                    <div {...styles.mainColumn}>
                      <Biography
                        user={user}
                        isEditing={isEditing}
                        onChange={this.onChange}
                        values={values}
                        errors={errors}
                        dirty={dirty} />
                      {isMobile && <div style={{marginBottom: 40}}>
                        <Edit
                          user={user}
                          state={this.state}
                          setState={this.setState.bind(this)}
                          startEditing={this.startEditing} />
                      </div>}
                      <div>
                        {user.documents && !!user.documents.totalCount &&
                          <Interaction.H3 style={{marginBottom: 20}}>
                            {t.pluralize('profile/documents/title', {
                              count: user.documents.totalCount
                            })}
                          </Interaction.H3>
                        }
                        {user.documents &&
                          user.documents.nodes.map(doc => (
                            <TeaserFeed
                              {...doc.meta}
                              Link={PathLink}
                              key={doc.meta.slug}
                            />
                          ))}
                      </div>
                      <Comments comments={user.comments} />
                    </div>
                    <div style={{clear: 'both'}} />
                  </div>
                </MainContainer>
              </Fragment>
            )
          }}
        />
      </Frame>
    )
  }
}

export default compose(
  withT,
  withMe,
  graphql(getPublicUser, {
    options: ({url}) => ({
      variables: {
        slug: url.query.slug
      }
    }),
    props: ({data, ownProps: {serverContext, url, me}}) => {
      const slug = url.query.slug
      if (serverContext && !data.error && !data.loading && !data.user) {
        serverContext.res.statusCode = 404
      }
      let redirect
      if (slug === 'me') {
        redirect = me
      }
      const username = data.user && data.user.username
      if (username && username !== slug) {
        redirect = data.user
      }
      if (redirect) {
        const targetSlug = redirect.username || redirect.id
        if (serverContext) {
          serverContext.res.redirect(301, `/~${targetSlug}`)
          serverContext.res.end()
        } else {
          Router.replaceRoute(
            'profile',
            {slug: targetSlug}
          )
        }
      }

      return {
        data
      }
    }
  })
)(Profile)