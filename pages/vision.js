import React, { useState, useEffect, Fragment } from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import { css } from 'glamor'
import {
  Container,
  Button,
  RawHtml,
  Interaction,
  Editorial,
  Loader,
  fontStyles,
  mediaQueries,
  colors,
  linkRule,
  Lead,
  Label,
  LazyLoad,
  fontFamilies,
  BrandMark as R
} from '@project-r/styleguide'
import Router, { withRouter } from 'next/router'
import md from 'markdown-in-js'

import Frame from '../components/Frame'

import mdComponents from '../lib/utils/mdComponents'

import withInNativeApp from '../lib/withInNativeApp'
import { countFormat } from '../lib/utils/format'
import withT from '../lib/withT'
import { Link } from '../lib/routes'
import {
  CROWDFUNDING,
  PUBLIC_BASE_URL,
  CDN_FRONTEND_BASE_URL
} from '../lib/constants'

import { ListWithQuery as TestimonialList } from '../components/Testimonial/List'

import TeaserBlock, {
  GAP as TEASER_BLOCK_GAP
} from '../components/Overview/TeaserBlock'
import { getTeasersFromDocument } from '../components/Overview/utils'
import Accordion from '../components/Pledge/Accordion'
import UserGuidance from '../components/Account/UserGuidance'
import SignIn from '../components/Auth/SignIn'
import ShareButtons from '../components/ActionBar/ShareButtons'

import { buttonStyles, sharedStyles } from '../components/Marketing/styles'

import ErrorMessage from '../components/ErrorMessage'
import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from '../components/constants'

import VideoCover from '../components/VideoCover'
import ReasonsCover from '../components/Crowdfunding/ReasonsCover'
import { getRandomReason } from '../components/Crowdfunding/reasonData'
import Join from '../components/Pledge/Join'

const VIDEOS = {
  main: {
    hls:
      'https://player.vimeo.com/external/394299161.m3u8?s=04b073df4a9a2e46dbf3bb030a81d7b233b70e10',
    mp4:
      'https://player.vimeo.com/external/394299161.hd.mp4?s=52bbb16e068387bd4e44683de01cbfebdcbc95e1&profile_id=175',
    subtitles: '/static/subtitles/cf2.vtt',
    thumbnail: `${CDN_FRONTEND_BASE_URL}/static/video/manifest.png`
  }
}

const query = gql`
  query MarketingPage {
    meGuidance: me {
      id
      activeMembership {
        id
      }
      accessGrants {
        id
      }
    }
    front: document(path: "/") {
      id
      children(first: 60) {
        nodes {
          body
        }
      }
    }
    membershipStats {
      count
    }
  }
`

const MEDIUM_MAX_WIDTH = 974
const SMALL_MAX_WIDTH = 700
const SPACE = 60

const styles = {
  overviewOverflow: css({
    position: 'relative',
    overflow: 'hidden',
    paddingTop: HEADER_HEIGHT_MOBILE,
    marginTop: -HEADER_HEIGHT_MOBILE,
    [mediaQueries.mUp]: {
      paddingTop: HEADER_HEIGHT,
      marginTop: -HEADER_HEIGHT
    }
  }),
  overviewContainer: css({
    padding: '30px 0 0',
    backgroundColor: colors.negative.containerBg,
    color: colors.negative.text
  }),
  overviewBottomShadow: css({
    position: 'absolute',
    bottom: 0,
    height: 100,
    left: 0,
    right: 0,
    background:
      'linear-gradient(0deg, rgba(17,17,17,0.9) 0%, rgba(17,17,17,0.8) 30%, rgba(17,17,17,0) 100%)',
    pointerEvents: 'none'
  }),
  overviewTopShadow: css({
    position: 'absolute',
    top: 100,
    height: 350,
    zIndex: 2,
    left: 0,
    right: 0,
    background:
      'linear-gradient(180deg, rgba(17,17,17,0.9) 0%, rgba(17,17,17,0.8) 67%, rgba(17,17,17,0) 100%)',
    pointerEvents: 'none',
    [mediaQueries.mUp]: {
      display: 'none'
    }
  }),
  lead: css({
    maxWidth: 700,
    padding: '0 15px',
    margin: '0 auto 30px',
    ...fontStyles.serifRegular,
    fontSize: 26,
    lineHeight: '32px',
    color: colors.negative.text,
    textAlign: 'center',
    [mediaQueries.mUp]: {
      fontSize: 30,
      lineHeight: '40px',
      marginBottom: 30,
      marginTop: 10
    }
  }),
  cards: css({
    position: 'relative',
    zIndex: 1,
    background: colors.negative.primaryBg,
    margin: '30px 0',
    [mediaQueries.mUp]: {
      margin: '50px 0'
    }
  }),
  highlight: css({
    fontFamily: fontFamilies.serifBold,
    fontSize: 24,
    lineHeight: '36px'
  }),
  strong: css({
    fontFamily: fontFamilies.serifBold
  }),
  column: css({
    maxWidth: 500,
    margin: `${SPACE}px auto`,
    '& ::selection': {
      color: '#fff',
      backgroundColor: '#000'
    }
  }),
  text: css({
    marginTop: SPACE / 2,
    marginBottom: SPACE,
    fontFamily: fontFamilies.serifRegular,
    fontSize: 18,
    lineHeight: '27px'
  })
}

const Highlight = ({ children, ...props }) => (
  <span {...props} {...styles.highlight}>
    {children}
  </span>
)
const Strong = ({ children }) => <span {...styles.strong}>{children}</span>

const MarketingPage = props => {
  useEffect(() => {
    if (query.token) {
      Router.replace(`/?token=${encodeURIComponent(query.token)}`, '/', {
        shallow: true
      })
    }
  }, [query.token])
  const [highlight, setHighlight] = useState()
  // ensure the highlighFunction is not dedected as an state update function
  const onHighlight = highlighFunction => setHighlight(() => highlighFunction)
  const {
    t,
    data: { loading, error, meGuidance, front, employees, membershipStats },
    inNativeApp,
    inNativeIOSApp,
    router,
    reason
  } = props

  const hasActiveMembership = meGuidance && !!meGuidance.activeMembership
  const hasAccessGrant =
    meGuidance && meGuidance.accessGrants && meGuidance.accessGrants.length > 0
  const hasActiveMembershipOrAccessGrant = hasActiveMembership || hasAccessGrant

  const shareProps = {
    url: `${PUBLIC_BASE_URL}/`,
    tweet: '',
    emailBody: '',
    emailAttachUrl: true,
    emailSubject: 'Republik',
    eventCategory: 'MarketingPage'
  }

  return (
    <Frame
      raw
      cover={
        <VideoCover
          src={VIDEOS.main}
          customCover={<ReasonsCover reason={reason} />}
          playTop='65%'
          endScroll={0.97}
        />
      }
      meta={{
        title: 'Vision'
      }}
    >
      <Container style={{ maxWidth: SMALL_MAX_WIDTH }}>
        {error && (
          <ErrorMessage error={error} style={{ textAlign: 'center' }} />
        )}
        <br />
        <br />
        <Lead>
          Unabhängiger Journalismus ohne Bullshit: Willkommen bei der Republik.
        </Lead>
        {md(mdComponents)`

Damit Sie uns vertrauen können, machen wir ein paar Dinge anders. Zum Beispiel sind wir komplett werbefrei. Und kompromisslos in der Qualität.

Unser Ziel: Journalismus, der die Köpfe klarer, das Handeln mutiger, die Entscheidungen klüger macht. Und der das Gemeinsame stärkt: die Freiheit, den Rechtsstaat, die Demokratie.

Wir bedanken uns an dieser Stelle auch bei unseren ${
          membershipStats && membershipStats.count
            ? countFormat(membershipStats.count)
            : '25’000'
        } Mitgliedern und Abonnentinnen, die unsere Arbeit möglich machen und das Überleben der Republik sichern.

## Was ist die Republik?

Die Republik ist eine Dienstleistung für interessierte Menschen in einer grossen, faszinierenden und komplexen Welt.

Wir recherchieren, fragen nach, ordnen ein und decken auf. Und liefern Ihnen Fakten und Zusammenhänge als Grundlage für Ihre eigenen Überlegungen und Entscheidungen.

Das ist eine heikle Aufgabe. Denn Journalismus ist alles andere als harmlos: Es ist entscheidend, welche Geschichten erzählt werden.

Weil Vertrauen im Journalismus die härteste Währung ist, haben wir die Republik so aufgestellt, dass wir diese Aufgabe für Sie bestmöglich erledigen können:

**Wir sind unabhängig.** Und komplett werbefrei. So können wir uns auf unseren einzigen Kunden konzentrieren: Sie. Und müssen weder möglichst viele Klicks generieren noch Sie mit nervigen Anzeigen belästigen. Und wir verkaufen Ihre persönlichen Daten niemals weiter.

**Wir sind das transparenteste Medienunternehmen (das wir kennen).** Wir legen alles offen: unsere Finanzen, Besitzverhältnisse, Arbeitsweisen, Fehler, Löhne – weil wir überzeugt sind, dass es wichtig ist zu zeigen, unter welchen Bedingungen Journalismus hergestellt wird. 

**Wir gehören niemandem – aber Ihnen ein bisschen.** Mit einer Mitgliedschaft werden Sie auch Genossenschafter und damit Verlegerin der Republik. Das ist für Sie ohne Risiko, dafür mit Einblick und Einfluss verbunden: Wir erklären, was wir tun – und Sie können mitentscheiden.

**Wir sind kompromisslos in der Qualität.** Unsere Reporter und Journalistinnen haben Zeit, um ein Thema mit der angebrachten Sorgfalt und Hartnäckigkeit zu recherchieren. Und es gibt drei Dinge, an denen uns besonders viel liegt: Gute Sprache. Gute Bilder. Und gutes Design.

**Wir stehen mit Ihnen im Dialog.** Und lieben es! Das Internet ermöglicht nicht nur viele neue Formen, wie wir Geschichten erzählen können, sondern auch den direkten Dialog mit Ihnen. Damit die Republik mit Ihrer Stimme vielfältiger, interessanter und reflektierter wird.

      `}
      </Container>

      <div
        style={{
          backgroundColor: 'black',
          color: 'white',
          padding: 20,
          marginTop: SPACE,
          marginBottom: SPACE
        }}
      >
        <div {...styles.column}>
          <R fill='white' />

          <div {...styles.text}>
            <Highlight>Ohne Journalismus keine Demokratie.</Highlight>
            <br />
            Und ohne Demokratie keine Freiheit. Wenn der Journalismus stirbt,
            stirbt auch die{' '}
            <Strong>
              offene Gesellschaft, das freie Wort, der Wettbewerb der besten
              Argumente. Freier Journalismus
            </Strong>{' '}
            war die erste Forderung der <Strong>liberalen Revolution.</Strong>{' '}
            Und das Erste, was jede Diktatur wieder abschafft. Journalismus ist
            ein Kind <Strong>der Aufklärung.</Strong> Seine Aufgabe ist die{' '}
            <Strong>Kritik der Macht.</Strong> Deshalb ist Journalismus mehr als
            nur ein Geschäft für irgendwelche Konzerne. Wer Journalismus macht,
            übernimmt <Strong>Verantwortung für die Öffentlichkeit.</Strong>{' '}
            Denn in der Demokratie gilt das Gleiche wie überall im Leben:
            Menschen brauchen{' '}
            <Strong>
              vernünftige Informationen, um vernünftige Entscheidungen zu
              treffen.
            </Strong>{' '}
            Guter Journalismus schickt{' '}
            <Strong>Expeditionsteams in die Wirklichkeit.</Strong> Seine Aufgabe
            ist, den Bürgerinnen und Bürgern die{' '}
            <Strong>Fakten und Zusammenhänge</Strong> zu liefern, pur,{' '}
            <Strong>unabhängig,</Strong> nach bestem Gewissen,{' '}
            <Strong>ohne Furcht</Strong> vor niemandem als der Langweile.
            Journalismus strebt nach <Strong>Klarheit</Strong>, er ist{' '}
            <Strong>der Feind der uralten Angst vor dem Neuen.</Strong>{' '}
            Journalismus braucht <Strong>Leidenschaft,</Strong> Können und
            Ernsthaftigkeit. Und ein aufmerksames, neugieriges,{' '}
            <Strong>furchtloses Publikum.</Strong>{' '}
            <Highlight style={{ verticalAlign: 'top' }}>Sie!</Highlight>
          </div>
        </div>
      </div>

      <Container style={{ maxWidth: SMALL_MAX_WIDTH }}>
        {md(mdComponents)`

## Warum das alles wichtig ist

Bei der Republik und beim Journalismus überhaupt geht es nicht nur um den individuellen Nutzen. Es geht auch darum, eine wichtige Funktion in einer Demokratie auszuüben: den Mächtigen auf die Finger zu schauen, unabhängig zu recherchieren und Missstände aufzudecken.

Traditionelle Medien haben das Problem, dass mit dem Internet ihr Geschäftsmodell zusammengebrochen ist. Sie haben ihre Monopolstellung verloren, fast alles ist gratis im Netz verfügbar. Die Bereitschaft, für Journalismus zu bezahlen, ist gesunken. Parallel dazu wanderten die Werbeeinnahmen fast vollständig zu Google, Facebook und Co. ab.

Die Folgen davon sind unübersehbar: ein massiver Abbau bei Redaktionen auf Kosten der Qualität und Vielfalt. Seit 2011 sind in der Schweiz unter dem Strich mehr als 3000 Stellen im Journalismus verschwunden. (Das ist viel: damit könnte man 100 Republiken machen.)

Zeitungen fusionieren, Redaktionen werden zusammengelegt, es gibt immer weniger Vielfalt im Schweizer Medienmarkt. In der Deutschschweiz verfügen Tamedia, Ringier und die NZZ mit ihren Zeitungen bereits über 80% Marktanteil.

Und als neueste Entwicklung, um den sinkenden Werbeeinnahmen entgegenzuwirken, gehen die Verlage immer dreistere Deals mit Werbekunden ein. Die Grenze zwischen redaktionellen Beiträgen und Werbung verwischt. Der Presserat kritisiert in einem Leiturteil diese Grenzüberschreitungen der Verlage. Damit werde das Publikum getäuscht und irregeführt. Die Medien schaden so ihrer eigenen Glaubwürdigkeit als unabhängige Berichterstatter.

Kurz: Es steht nicht unbedingt gut um die Medienbranche und die Zukunft des Journalismus.

Als Antwort auf diese Entwicklungen – und aus Leidenschaft für guten Journalismus – bauen wir die Republik auf.

Einerseits als konkreten Beitrag zur Vielfalt. Mit einem Medium, das Unabhängigkeit konsequent ernst nimmt. Andererseits auch als Labor für den Journalismus des 21. Jahrhunderts. Dafür ist es notwendig, ein funktionierendes Geschäftsmodell zu entwickeln.

Eine Republik baut niemand alleine, sondern nur viele gemeinsam. Wir mit Ihnen?
        `}

        <div style={{ margin: '20px 0 40px' }}>
          <Label style={{ display: 'block', marginBottom: 5 }}>
            Jetzt andere auf die Republik aufmerksam machen:
          </Label>
          <ShareButtons {...shareProps} />
        </div>

        <Join />
        <br />
        <br />
        <br />
        <br />
        <br />
      </Container>
    </Frame>
  )
}

const EnhancedPage = compose(
  withT,
  withInNativeApp,
  withRouter,
  graphql(query)
)(MarketingPage)

EnhancedPage.getInitialProps = () => {
  return {
    reason: getRandomReason()
  }
}

export default EnhancedPage
