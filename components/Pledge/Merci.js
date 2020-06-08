import React, { Component, Fragment } from 'react'
import { compose, graphql } from 'react-apollo'
import { format } from 'url'

import withT from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'
import { Router, Link } from '../../lib/routes'

import Poller from '../Auth/Poller'
import { withSignIn } from '../Auth/SignIn'
import { WithMembership } from '../Auth/withMembership'
import ErrorMessage from '../ErrorMessage'

import Account from '../Account'

import { Content, MainContainer } from '../Frame'

import ClaimPledge from './Claim'

import { EMAIL_CONTACT, ONBOARDING_PACKAGES } from '../../lib/constants'

import {
  linkRule,
  Interaction,
  RawHtml,
  InlineSpinner,
  Button,
  Lead,
  Loader,
  Editorial,
  InfoBoxListItem
} from '@project-r/styleguide'

import RawHtmlTranslation from '../RawHtmlTranslation'
import gql from 'graphql-tag'
import StatusError from '../StatusError'

const { H1, P } = Interaction

export const gotoMerci = query => {
  // workaround for apollo cache issues
  // - can't manage to clear all query caches
  // - couldn't clear myAddress query,
  //   possibly because id-less address type
  // - good reset if sign in / out status changed during purchasing / claiming
  window.location = format({
    pathname: '/konto',
    query
  })
}

export const encodeSignInResponseQuery = ({
  phrase,
  tokenType,
  alternativeFirstFactors
}) => {
  const query = {
    phrase,
    tokenType
  }
  if (alternativeFirstFactors && alternativeFirstFactors.length) {
    query.aff = alternativeFirstFactors.join(',')
  }
  return query
}

const parseSignInResponseQuery = query => {
  if (query.signInError) {
    return {
      signInError: query.signInError
    }
  }
  return {
    signInResponse: {
      phrase: query.phrase,
      tokenType: query.tokenType || 'EMAIL_TOKEN',
      alternativeFirstFactors: query.aff ? query.aff.split(',') : []
    }
  }
}

class Merci extends Component {
  constructor(props) {
    super(props)
    const { query } = this.props

    this.state = {
      polling: !!(query.email && query.phrase),
      email: query.email,
      ...parseSignInResponseQuery(query)
    }
  }

  componentDidMount() {
    this.maybeRelocateToOnboarding()
  }

  componentDidUpdate() {
    this.maybeRelocateToOnboarding()
  }

  maybeRelocateToOnboarding() {
    const { me, query } = this.props

    if (me && ONBOARDING_PACKAGES.includes(query.package) && !query.claim) {
      Router.replaceRoute(
        'onboarding',
        { context: 'pledge', package: query.package },
        { shallow: true }
      )
    }
  }

  render() {
    const { me, t, query, data } = this.props
    const {
      polling,
      email,
      signInResponse,
      signInError,
      signInLoading
    } = this.state

    if (query.claim) {
      return (
        <MainContainer>
          <Content>
            <ClaimPledge t={t} me={me} id={query.claim} pkg={query.package} />
          </Content>
        </MainContainer>
      )
    }
    if (polling) {
      return (
        <MainContainer>
          <Content>
            <P style={{ marginBottom: 15 }}>{t('merci/postpay/lead')}</P>
            <Poller
              tokenType={signInResponse.tokenType}
              email={email}
              phrase={signInResponse.phrase}
              alternativeFirstFactors={signInResponse.alternativeFirstFactors}
              onSuccess={() => {
                this.setState({
                  polling: false
                })
              }}
            />
            <P>
              {!!query.id && (
                <Link
                  route='account'
                  params={{ claim: query.id, package: query.package }}
                >
                  <a {...linkRule}>
                    <br />
                    <br />
                    {t('merci/postpay/reclaim')}
                  </a>
                </Link>
              )}
            </P>
          </Content>
        </MainContainer>
      )
    }

    if (signInError && email && query.id) {
      return (
        <MainContainer>
          <Content>
            <H1>{t('merci/postpay/signInError/title')}</H1>
            <P>
              <RawHtmlTranslation
                translationKey='merci/postpay/signInError/text'
                replacements={{
                  email: query.email,
                  contactEmailLink: (
                    <a
                      key='contact'
                      {...linkRule}
                      href={`mailto:${EMAIL_CONTACT}?subject=${encodeURIComponent(
                        t('merci/postpay/signInError/email/subject')
                      )}&body=${encodeURIComponent(
                        t('merci/postpay/signInError/email/body', {
                          pledgeId: query.id,
                          email: email,
                          error: signInError
                        })
                      )}`}
                    >
                      {EMAIL_CONTACT}
                    </a>
                  )
                }}
              />
            </P>
            {!!signInError && <ErrorMessage error={signInError} />}
            <div style={{ margin: '20px 0' }}>
              {signInLoading ? (
                <InlineSpinner />
              ) : (
                <Button
                  block
                  disabled={signInLoading}
                  onClick={() => {
                    if (signInLoading) {
                      return
                    }
                    this.setState(() => ({
                      signInLoading: true
                    }))
                    this.props
                      .signIn(email)
                      .then(({ data }) => {
                        this.setState(() => ({
                          polling: true,
                          signInLoading: false,
                          signInResponse: data.signIn
                        }))
                      })
                      .catch(error => {
                        this.setState(() => ({
                          signInError: error,
                          signInLoading: false
                        }))
                      })
                  }}
                >
                  {t('merci/postpay/signInError/retry')}
                </Button>
              )}
            </div>
            <Link route='account' params={{ claim: query.id }}>
              <a {...linkRule}>
                <br />
                <br />
                {t('merci/postpay/reclaim')}
              </a>
            </Link>
          </Content>
        </MainContainer>
      )
    }

    if (me && ONBOARDING_PACKAGES.includes(query.package)) {
      return (
        <MainContainer>
          <Content>
            <Loader loading />
          </Content>
        </MainContainer>
      )
    }

    const buttonStyle = { marginBottom: 10, marginRight: 10 }
    const noNameSuffix = me ? '' : '/noName'

    return (
      <Fragment>
        <MainContainer>
          <Content style={{ paddingBottom: 0 }}>
            <H1>
              {t.first(
                [
                  `merci/title/package/${query.package ||
                    'UNKOWN'}${noNameSuffix}`,
                  `merci/title${noNameSuffix}`
                ],
                {
                  name: me && me.name
                }
              )}
            </H1>
            <RawHtml
              type={Lead}
              dangerouslySetInnerHTML={{
                __html: t.first([
                  `merci/lead/package/${query.package || 'UNKOWN'}`,
                  'merci/lead'
                ])
              }}
            />
            <WithMembership
              render={() => (
                <>
                  <Link route='index'>
                    <Button primary style={{ ...buttonStyle, marginTop: 10 }}>
                      {t('merci/action/read')}
                    </Button>
                  </Link>
                  {me && !me.hasPublicProfile && (
                    <Link
                      route='profile'
                      params={{ slug: me.username || me.id }}
                    >
                      <Button style={buttonStyle}>
                        {t('merci/action/profile')}
                      </Button>
                    </Link>
                  )}
                </>
              )}
            />
          </Content>
        </MainContainer>
        <Account query={query} merci />
      </Fragment>
    )
  }
}

export default compose(withMe, withT, withSignIn)(Merci)
