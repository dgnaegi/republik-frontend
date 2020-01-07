import React from 'react'
import { graphql, compose } from 'react-apollo'
import { ascending } from 'd3-array'
import { css } from 'glamor'
import { nest } from 'd3-collection'
import gql from 'graphql-tag'
import Link from '../Link/Href'
import withT from '../../lib/withT'

import {
  Loader,
  FormatTag,
  colors,
  fontStyles,
  mediaQueries,
  TeaserSectionTitle
} from '@project-r/styleguide'

const SPACE = 15
const SPACE_BIG = 20

const styles = {
  sectionTitle: css({
    marginBottom: SPACE / 2,
    [mediaQueries.mUp]: {
      marginBottom: SPACE_BIG / 2
    }
  }),
  section: css({
    paddingTop: SPACE,
    marginBottom: SPACE,
    '& + &': {
      borderTop: `1px solid ${colors.divider}`
    },
    [mediaQueries.mUp]: {
      paddingTop: SPACE_BIG,
      marginBottom: SPACE_BIG
    }
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'none'
  })
}

const getSections = gql`
  query getSections {
    sections: documents(template: "section") {
      nodes {
        id
        meta {
          title
          path
          color
          kind
        }
        formats: linkedDocuments(feed: true) {
          nodes {
            id
            meta {
              title
              path
              color
              kind
            }
            linkedDocuments(feed: true) {
              totalCount
            }
          }
        }
      }
    }
  }
`

const SectionIndex = ({ data: { loading, error, sections }, t }) => {
  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        return (
          <>
            {sections.nodes.map(({ id, meta, formats }) => {
              const hasFormats = formats.nodes.length > 0

              return (
                <section
                  {...styles.section}
                  style={{
                    paddingBottom: hasFormats ? 5 : 0
                  }}
                  key={id}
                >
                  <div
                    {...styles.sectionTitle}
                    style={{
                      color: hasFormats ? '#979797' : undefined
                    }}
                  >
                    <Link href={meta.path} passHref>
                      {hasFormats ? (
                        <TeaserSectionTitle small>
                          {meta.title}
                        </TeaserSectionTitle>
                      ) : (
                        <a {...styles.link}>
                          <FormatTag label={meta.title} count={null} />
                        </a>
                      )}
                    </Link>
                  </div>
                  {formats.nodes.map(
                    ({ id, meta: formatMeta, linkedDocuments }) => (
                      <Link href={formatMeta.path} passHref key={id}>
                        <a {...styles.link}>
                          <FormatTag
                            color={formatMeta.color || colors[formatMeta.kind]}
                            label={formatMeta.title}
                            count={linkedDocuments.totalCount || null}
                          />
                        </a>
                      </Link>
                    )
                  )}
                </section>
              )
            })}
          </>
        )
      }}
    />
  )
}

export default compose(
  withT,
  graphql(getSections)
)(SectionIndex)