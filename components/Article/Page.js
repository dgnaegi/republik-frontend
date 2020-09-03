import React, { Component, Fragment } from 'react'
import { css } from 'glamor'
import { withRouter } from 'next/router'

import Frame from '../Frame'
import ActionBar from '../ActionBar'
import ActionBarOverlay from './ActionBarOverlay'
import Loader from '../Loader'
import RelatedEpisodes from './RelatedEpisodes'
import SeriesNavButton from './SeriesNavButton'
import PdfOverlay from './PdfOverlay'
import Extract from './Extract'
import withT from '../../lib/withT'
import { formatDate } from '../../lib/utils/format'
import { PayNote, MAX_PAYNOTE_SEED } from './PayNote'
import withInNativeApp, { postMessage } from '../../lib/withInNativeApp'
import { cleanAsPath } from '../../lib/routes'
import { createRequire } from '@project-r/styleguide/lib/components/DynamicComponent'
import FontSizeSync from '../FontSize/Sync'
import { getRandomInt } from '../../lib/utils/helpers'
import { splitByTitle } from '../../lib/utils/mdast'
import withMemberStatus from '../../lib/withMemberStatus'
import withMe from '../../lib/apollo/withMe'
import { AudioContext } from '../Audio'

import Discussion from '../Discussion/Discussion'
import FormatFeed from '../Feed/Format'
import StatusError from '../StatusError'
import SSRCachingBoundary from '../SSRCachingBoundary'
import NewsletterSignUp from '../Auth/NewsletterSignUp'
import withMembership from '../Auth/withMembership'
import { withEditor } from '../Auth/checkRoles'
import ArticleGallery from '../Gallery/ArticleGallery'
import AutoDiscussionTeaser from './AutoDiscussionTeaser'
import SectionNav from '../Sections/SectionNav'
import SectionFeed from '../Sections/SectionFeed'
import HrefLink from '../Link/Href'

import SurviveStatus from '../Crowdfunding/SurviveStatus'

import Progress from './Progress'
import { userProgressFragment } from './Progress/api'

import PodcastButtons from './PodcastButtons'

import {
  Center,
  ColorContext,
  colors,
  Interaction,
  mediaQueries,
  LazyLoad,
  TitleBlock,
  Editorial
} from '@project-r/styleguide'

import { PUBLIC_BASE_URL } from '../../lib/constants'

import { renderMdast } from 'mdast-react-render'

import createArticleSchema from '@project-r/styleguide/lib/templates/Article'
import createFormatSchema from '@project-r/styleguide/lib/templates/Format'
import createDossierSchema from '@project-r/styleguide/lib/templates/Dossier'
import createDiscussionSchema from '@project-r/styleguide/lib/templates/Discussion'
import createNewsletterSchema from '@project-r/styleguide/lib/templates/EditorialNewsletter/web'
import createSectionSchema from '@project-r/styleguide/lib/templates/Section'

import { onDocumentFragment } from '../Bookmarks/fragments'

import Join from '../Pledge/Join'

/*
 * import all react-apollo and graphql-tag functions
 * for dynamic components and specific ones for this page
 */

/* eslint-disable */
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

import * as reactApollo from 'react-apollo'
import * as graphqlTag from 'graphql-tag'
import { Breakout } from '@project-r/styleguide/lib/components/Center'
import {
  notificationInfo,
  subInfo,
  withMarkAsReadMutation
} from '../Notifications/enhancers'
/* eslint-enable */

const schemaCreators = {
  editorial: createArticleSchema,
  meta: createArticleSchema,
  article: createArticleSchema,
  format: createFormatSchema,
  dossier: createDossierSchema,
  discussion: createDiscussionSchema,
  editorialNewsletter: createNewsletterSchema,
  section: createSectionSchema
}

const dynamicComponentRequire = createRequire().alias({
  'react-apollo': reactApollo,
  'graphql-tag': graphqlTag
})

const getSchemaCreator = template => {
  const key = template || Object.keys(schemaCreators)[0]
  const schema = schemaCreators[key]

  if (!schema) {
    try {
      console.error(`Unkown Schema ${key}`)
    } catch (e) {}
    return () => {}
  }
  return schema
}

const styles = {
  link: css({
    color: 'inherit',
    textDecoration: 'none'
  }),
  prepublicationNotice: css({
    backgroundColor: colors.social
  }),
  titleBlock: css({
    marginBottom: 20
  }),
  actionBar: css({
    marginTop: 16,
    marginBottom: 24,
    [mediaQueries.mUp]: {
      marginBottom: 36
    }
  })
}

const getDocument = gql`
  query getDocument($path: String!) {
    article: document(path: $path) {
      id
      repoId
      content
      subscribedBy(includeParents: true, onlyMe: true) {
        nodes {
          ...subInfo
        }
      }
      linkedDocuments {
        nodes {
          id
          meta {
            title
            template
            path
            color
          }
          linkedDocuments(feed: true) {
            totalCount
          }
        }
      }
      unreadNotifications {
        nodes {
          ...notificationInfo
        }
      }
      ...BookmarkOnDocument
      ...UserProgressOnDocument
      meta {
        publishDate
        template
        path
        title
        kind
        description
        image
        facebookDescription
        facebookImage
        facebookTitle
        twitterDescription
        twitterImage
        twitterTitle
        ownDiscussion {
          id
          closed
          isBoard
          comments {
            totalCount
          }
        }
        linkedDiscussion {
          id
          path
          closed
          comments {
            totalCount
          }
        }
        color
        format {
          id
          meta {
            path
            title
            color
            kind
            podcast {
              podigeeSlug
              spotifyUrl
              googleUrl
              appleUrl
            }
            newsletter {
              name
              free
            }
          }
        }
        section {
          id
          meta {
            path
            title
            color
            kind
          }
        }
        dossier {
          id
          meta {
            title
            path
          }
        }
        series {
          title
          episodes {
            title
            publishDate
            label
            image
            document {
              meta {
                title
                publishDate
                path
                image
              }
            }
          }
        }
        audioSource {
          mp3
          aac
          ogg
          mediaId
          durationMs
        }
        podcast {
          podigeeSlug
          spotifyUrl
          googleUrl
          appleUrl
        }
        newsletter {
          name
          free
        }
        estimatedReadingMinutes
        estimatedConsumptionMinutes
        indicateGallery
        indicateVideo
        prepublication
      }
    }
  }
  ${onDocumentFragment}
  ${userProgressFragment}
  ${subInfo}
  ${notificationInfo}
`

const runMetaFromQuery = (code, query) => {
  if (!code) {
    return undefined
  }
  let fn
  try {
    /* eslint-disable-next-line */
    fn = new Function('query', code)
    return fn(query)
  } catch (e) {
    typeof console !== 'undefined' &&
      console.warn &&
      console.warn('meta.fromQuery exploded', e)
  }
  return undefined
}

const EmptyComponent = ({ children }) => children

class ArticlePage extends Component {
  constructor(props) {
    super(props)

    this.barRef = React.createRef()

    this.bottomBarRef = ref => {
      this.bottomBar = ref
    }

    this.galleryRef = React.createRef()

    this.toggleAudio = () => {
      this.props.toggleAudioPlayer(this.props.data.article.meta)
    }

    this.showGallery = () => {
      if (this.galleryRef) {
        this.galleryRef.current.show()
      }
    }

    this.togglePdf = () => {
      this.setState({
        showPdf: !this.state.showPdf
      })
    }

    this.markNotificationsAsRead = () => {
      const { data, markAsReadMutation } = this.props
      const article = data && data.article
      const unreadNotifications =
        article &&
        article.unreadNotifications &&
        article.unreadNotifications.nodes &&
        article.unreadNotifications.nodes.filter(n => !n.readAt)
      if (unreadNotifications && unreadNotifications.length) {
        unreadNotifications.forEach(n => markAsReadMutation(n.id))
      }
    }

    this.state = {
      ...this.deriveStateFromProps(props, {})
    }
  }

  deriveStateFromProps(
    { t, data: { article }, inNativeApp, inNativeIOSApp, router, isMember },
    state
  ) {
    const meta = article && {
      ...article.meta,
      url: `${PUBLIC_BASE_URL}${article.meta.path}`,
      ...runMetaFromQuery(article.content.meta.fromQuery, router.query)
    }

    const podcast =
      meta &&
      (meta.podcast ||
        (meta.audioSource && meta.format && meta.format.meta.podcast))

    const newsletterMeta =
      meta && (meta.newsletter || (meta.format && meta.format.meta.newsletter))

    const schema =
      meta &&
      getSchemaCreator(meta.template)({
        t,
        Link: HrefLink,
        plattformUnauthorizedZoneText: inNativeIOSApp
          ? t('plattformUnauthorizedZoneText/ios')
          : undefined,
        dynamicComponentRequire,
        titleMargin: false,
        onAudioCoverClick: this.toggleAudio,
        getVideoPlayerProps:
          inNativeApp && !inNativeIOSApp
            ? props => ({
                ...props,
                fullWindow: true,
                onFull: isFull => {
                  postMessage({
                    type: isFull ? 'fullscreen-enter' : 'fullscreen-exit'
                  })
                }
              })
            : undefined
      })

    const showSeriesNav = isMember && meta && !!meta.series
    const id = article && article.id
    const repoId = article && article.repoId

    return {
      id,
      repoId,
      schema,
      meta,
      podcast,
      newsletterMeta,
      showSeriesNav,
      autoPlayAudioSource:
        id !== state.id ? router.query.audio === '1' : state.autoPlayAudioSource
    }
  }

  autoPlayAudioSource() {
    const { autoPlayAudioSource, meta } = this.state
    if (autoPlayAudioSource && meta) {
      this.setState(
        {
          autoPlayAudioSource: false
        },
        () => {
          this.toggleAudio()
        }
      )
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const currentArticle = this.props.data.article || {}
    const nextArticle = nextProps.data.article || {}

    if (
      currentArticle.id !== nextArticle.id ||
      currentArticle.userBookmark !== nextArticle.userBookmark ||
      currentArticle.subscribedBy !== nextArticle.subscribedBy ||
      currentArticle.unreadNotifications !== nextArticle.unreadNotifications
    ) {
      this.setState(this.deriveStateFromProps(nextProps, this.state))
    }
  }

  componentDidMount() {
    this.autoPlayAudioSource()
    this.markNotificationsAsRead()
  }

  componentDidUpdate() {
    this.autoPlayAudioSource()
    this.markNotificationsAsRead()
  }

  render() {
    const {
      router,
      t,
      me,
      data,
      data: { article },
      isMember,
      isEditor,
      inNativeApp,
      payNoteSeed,
      payNoteTryOrBuy,
      hasActiveMembership
    } = this.props

    const {
      id: documentId,
      repoId,
      meta,
      podcast,
      newsletterMeta,
      schema,
      showSeriesNav
    } = this.state

    const isEditorialNewsletter =
      meta && meta.template === 'editorialNewsletter'

    const actionBar = article && (
      <ActionBar mode='article-top' document={article} />
    )
    const actionBarEnd = actionBar
      ? React.cloneElement(actionBar, {
          mode: 'article-bottom'
        })
      : undefined

    const actionBarOverlay = actionBar
      ? React.cloneElement(actionBar, {
          mode: 'article-overlay'
          // actionBarTopY
        })
      : undefined

    const series = meta && meta.series
    const episodes = series && series.episodes
    const darkMode =
      article &&
      article.content &&
      article.content.meta &&
      article.content.meta.darkMode

    const seriesNavButton = showSeriesNav && (
      <SeriesNavButton t={t} series={series} />
    )

    const colorMeta =
      meta &&
      (meta.template === 'format' || meta.template === 'section'
        ? meta
        : meta.format && meta.format.meta)
    const formatColor = colorMeta && (colorMeta.color || colors[colorMeta.kind])

    const sectionColor = meta && meta.template === 'section' && meta.color
    const MissingNode = isEditor ? undefined : ({ children }) => children

    if (router.query.extract) {
      return (
        <Loader
          loading={data.loading}
          error={data.error}
          render={() => {
            if (!article) {
              return (
                <StatusError
                  statusCode={404}
                  serverContext={this.props.serverContext}
                />
              )
            }

            return (
              <Extract
                ranges={router.query.extract}
                schema={schema}
                unpack={router.query.unpack}
                mdast={{
                  ...article.content,
                  format: meta.format,
                  section: meta.section
                }}
              />
            )
          }}
        />
      )
    }

    const customPayNotes =
      article &&
      article.content &&
      article.content.meta &&
      article.content.meta.paynotes
    const payNote = (
      <PayNote
        seed={payNoteSeed}
        tryOrBuy={payNoteTryOrBuy}
        documentId={documentId}
        repoId={repoId}
        customPayNotes={customPayNotes}
        position='before'
      />
    )

    const splitContent = article && splitByTitle(article.content)
    const renderSchema = content =>
      renderMdast(
        {
          ...content,
          format: meta.format,
          section: meta.section
        },
        schema,
        { MissingNode }
      )

    const hasOverviewNav = meta && meta.template === 'section'
    return (
      <Frame
        dark={darkMode}
        raw
        // Meta tags for a focus comment are rendered in Discussion/Commments.js
        meta={
          meta && meta.discussionId && router.query.focus ? undefined : meta
        }
        onNavExpanded={this.onPrimaryNavExpandedChange}
        secondaryNav={seriesNavButton}
        formatColor={formatColor}
        hasOverviewNav={hasOverviewNav}
        stickySecondaryNav={hasOverviewNav}
      >
        <Loader
          loading={data.loading}
          error={data.error}
          render={() => {
            if (!article || !schema) {
              return (
                <StatusError
                  statusCode={404}
                  serverContext={this.props.serverContext}
                />
              )
            }

            const isFormat = meta.template === 'format'
            const isSection = meta.template === 'section'

            const hasNewsletterUtms =
              router.query.utm_source &&
              router.query.utm_source === 'newsletter'

            const suppressPayNotes = isSection || isFormat
            const suppressFirstPayNote =
              suppressPayNotes ||
              podcast ||
              isEditorialNewsletter ||
              meta.path === '/top-storys' ||
              hasNewsletterUtms ||
              (router.query.utm_source &&
                router.query.utm_source === 'flyer-v1')
            const ownDiscussion = meta.ownDiscussion
            const linkedDiscussion =
              meta.linkedDiscussion && !meta.linkedDiscussion.closed

            const { audioSource } = meta

            const ProgressComponent =
              isMember &&
              !isSection &&
              !isFormat &&
              meta.template !== 'discussion'
                ? Progress
                : EmptyComponent

            const titleNode =
              splitContent.title &&
              splitContent.title.children[
                splitContent.title.children.length - 1
              ]
            const titleAlign =
              (titleNode && titleNode.data && titleNode.data.center) ||
              isFormat ||
              isSection
                ? 'center'
                : undefined

            const format = meta.format

            return (
              <Fragment>
                <FontSizeSync />
                {meta.prepublication && (
                  <div {...styles.prepublicationNotice}>
                    <Center>
                      <Interaction.P>
                        {t('article/prepublication/notice')}
                      </Interaction.P>
                    </Center>
                  </div>
                )}
                {this.state.showPdf && (
                  <PdfOverlay article={article} onClose={this.togglePdf} />
                )}
                <ArticleGallery
                  article={article}
                  show={!!router.query.gallery}
                  ref={this.galleryRef}
                >
                  <ProgressComponent article={article}>
                    <article style={{ display: 'block' }}>
                      {splitContent.title && (
                        <div {...styles.titleBlock}>
                          {renderSchema(splitContent.title)}
                          {isEditorialNewsletter && (
                            <TitleBlock margin={false}>
                              {format && format.meta && (
                                <Editorial.Format
                                  color={
                                    format.meta.color ||
                                    colors[format.meta.kind]
                                  }
                                  contentEditable={false}
                                >
                                  <HrefLink href={format.meta.path} passHref>
                                    <a {...styles.link} href={format.meta.path}>
                                      {format.meta.title}
                                    </a>
                                  </HrefLink>
                                </Editorial.Format>
                              )}
                              <Interaction.Headline>
                                {meta.title}
                              </Interaction.Headline>
                              <Editorial.Credit>
                                {formatDate(new Date(meta.publishDate))}
                              </Editorial.Credit>
                            </TitleBlock>
                          )}
                          <Center>
                            <div
                              ref={this.barRef}
                              {...styles.actionBar}
                              style={{
                                textAlign: titleAlign,
                                marginBottom: isEditorialNewsletter
                                  ? 0
                                  : undefined
                              }}
                            >
                              {actionBar}
                            </div>
                            {isSection && (
                              <Breakout size='breakout'>
                                <SectionNav
                                  color={sectionColor}
                                  linkedDocuments={article.linkedDocuments}
                                />
                              </Breakout>
                            )}
                            {!me &&
                              isEditorialNewsletter &&
                              !!newsletterMeta &&
                              newsletterMeta.free && (
                                <div style={{ marginTop: 10 }}>
                                  <NewsletterSignUp {...newsletterMeta} />
                                </div>
                              )}
                          </Center>
                          {!suppressFirstPayNote && payNote}
                        </div>
                      )}
                      <SSRCachingBoundary
                        cacheKey={`${article.id}${isMember ? ':isMember' : ''}`}
                      >
                        {() => (
                          <ColorContext.Provider
                            value={darkMode && colors.negative}
                          >
                            {renderSchema(splitContent.main)}
                          </ColorContext.Provider>
                        )}
                      </SSRCachingBoundary>
                    </article>
                    <ActionBarOverlay
                      audioPlayerVisible={this.props.audioPlayerVisible}
                      inNativeApp={inNativeApp}
                    >
                      {actionBarOverlay}
                    </ActionBarOverlay>
                  </ProgressComponent>
                </ArticleGallery>
                {meta.template === 'article' &&
                  ownDiscussion &&
                  !ownDiscussion.closed &&
                  !linkedDiscussion &&
                  isMember && (
                    <Center>
                      <AutoDiscussionTeaser discussionId={ownDiscussion.id} />
                    </Center>
                  )}
                {meta.template === 'discussion' && ownDiscussion && (
                  <Center>
                    <Discussion
                      discussionId={ownDiscussion.id}
                      focusId={router.query.focus}
                      parent={router.query.parent}
                      mute={!!router.query.mute}
                      board={ownDiscussion.isBoard}
                      showPayNotes
                    />
                  </Center>
                )}
                {!!newsletterMeta && (
                  <Center>
                    <NewsletterSignUp {...newsletterMeta} />
                  </Center>
                )}
                {((isMember && meta.template === 'article') ||
                  (isEditorialNewsletter &&
                    newsletterMeta &&
                    newsletterMeta.free)) && (
                  <Center>
                    <div ref={this.bottomBarRef}>{actionBarEnd}</div>
                    {!!podcast && meta.template === 'article' && (
                      <>
                        <Interaction.H3>
                          {t(`PodcastButtons/title`)}
                        </Interaction.H3>
                        <PodcastButtons {...podcast} />
                      </>
                    )}
                  </Center>
                )}
                {!!podcast && meta.template !== 'article' && (
                  <Center>
                    <>
                      <Interaction.H3>
                        {t(`PodcastButtons/title`)}
                      </Interaction.H3>
                      <PodcastButtons {...podcast} />
                    </>
                  </Center>
                )}
                {false &&
                  !suppressPayNotes &&
                  !darkMode &&
                  !(customPayNotes && customPayNotes.length) && (
                    <Center>
                      <LazyLoad style={{ display: 'block', minHeight: 120 }}>
                        <SurviveStatus />
                      </LazyLoad>
                    </Center>
                  )}
                {isMember && episodes && (
                  <RelatedEpisodes
                    title={series.title}
                    episodes={episodes}
                    path={meta.path}
                  />
                )}
                {isSection && (
                  <SectionFeed
                    formats={article.linkedDocuments.nodes.map(n => n.id)}
                    variablesAsString={article.content.meta.feedQueryVariables}
                  />
                )}
                {isFormat && <FormatFeed formatId={article.repoId} />}
                {(hasActiveMembership || isFormat) && (
                  <Fragment>
                    <br />
                    <br />
                    <br />
                    <br />
                  </Fragment>
                )}
                <Center>
                  <Join />
                </Center>
              </Fragment>
            )
          }}
        />
      </Frame>
    )
  }
}

const ComposedPage = compose(
  withT,
  withMe,
  withMembership,
  withMemberStatus,
  withEditor,
  withInNativeApp,
  withRouter,
  withMarkAsReadMutation,
  graphql(getDocument, {
    options: ({ router: { asPath } }) => ({
      variables: {
        path: cleanAsPath(asPath)
      }
    })
  })
)(ArticlePage)

const ComposedPageWithAudio = props => (
  <AudioContext.Consumer>
    {({ toggleAudioPlayer, audioPlayerVisible }) => (
      <ComposedPage
        {...props}
        audioPlayerVisible={audioPlayerVisible}
        toggleAudioPlayer={toggleAudioPlayer}
      />
    )}
  </AudioContext.Consumer>
)

ComposedPageWithAudio.getInitialProps = () => {
  return {
    payNoteTryOrBuy: Math.random(),
    payNoteSeed: getRandomInt(MAX_PAYNOTE_SEED)
  }
}

export default ComposedPageWithAudio
