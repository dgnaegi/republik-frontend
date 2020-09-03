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
  LazyLoad
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
  })
}

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

## Was bekomme ich für mein Geld?

Sie erhalten täglich eine bis drei neue Geschichten. Als Newsletter, im Web oder in der App. Das Konzept ist einfach: Einordnung und Vertiefung statt einer Flut von Nachrichten.

Sie lesen und hören in der Republik zu allem, was aktuell, verworren, komplex – und für viele gerade wichtig ist. Derzeit beschäftigen uns Klima, Digitalisierung, Kinderbetreuung und besonders intensiv die Folgen des Aufstiegs autoritärer Politik für die Demokratie.

Wir liefern Ihnen Recherchen, Analysen, Reportagen und Erklärartikel. Aufgemacht als digitales Magazin, mit ausgewählten Bildern, Illustrationen, Grafiken. Manchmal interaktiv. Manchmal als Podcast. Oder auch als Veranstaltung.

Statt täglichen News fassen wir einmal pro Woche in Briefings das Wichtigste aus der Schweiz und der Welt zusammen, kompakt und übersichtlich – damit Sie nichts verpassen.

Die Republik bietet ein vielfältiges Programm an Themen, Autorinnen und Formaten. Und Sie entscheiden selbst, wie Sie die Republik nutzen möchten: täglich, wöchentlich oder unregelmässig; alles oder nur ausgewählte Beiträge, aktiv im Dialog mit anderen oder einfach ganz für sich allein einen Podcast geniessen.

Sie können Beiträge, die Sie besonders freuen oder ärgern, jederzeit mit Ihren Freunden teilen, selbst wenn diese kein Abo haben. Alle Beiträge der Republik sind frei teilbar, damit unser Journalismus möglichst viele Menschen erreicht. 

Und einen entscheidenden Unterschied machen kann. Die Republik ist politisch nicht festgelegt, aber keineswegs neutral: Sie steht gegen die Diktatur der Angst. Und für die Werte der Aufklärung: für Klarheit im Stil, Treue zu Fakten, für Lösungen von Fall zu Fall, für Offenheit gegenüber Kritik, Respektlosigkeit vor der Macht und Respekt vor dem Menschen.

      `}

        {inNativeIOSApp ? (
          <br />
        ) : (
          <div
            {...sharedStyles.actions}
            style={{ marginTop: 20, marginBottom: 40 }}
          >
            <div>
              <Link route='pledge' params={{ package: 'ABO' }}>
                <button {...buttonStyles.primary}>
                  {t('marketing/join/ABO/button/label')}
                </button>
              </Link>
            </div>
            {hasActiveMembershipOrAccessGrant ? (
              <Link route='index'>
                <button {...buttonStyles.standard}>
                  {t('marketing/magazine/button/label')}
                </button>
              </Link>
            ) : (
              <Link route='pledge' params={{ package: 'MONTHLY_ABO' }}>
                <button {...buttonStyles.standard}>
                  {t('marketing/join/MONTHLY_ABO/button/label')}
                </button>
              </Link>
            )}
          </div>
        )}
      </Container>

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

        {!inNativeIOSApp && (
          <Link route='pledge' passHref>
            <Button primary style={{ marginTop: 10 }}>
              Jetzt mitmachen!
            </Button>
          </Link>
        )}

        <div style={{ margin: '20px 0 40px' }}>
          <Label style={{ display: 'block', marginBottom: 5 }}>
            Jetzt andere auf die Republik aufmerksam machen:
          </Label>
          <ShareButtons {...shareProps} />
        </div>

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
