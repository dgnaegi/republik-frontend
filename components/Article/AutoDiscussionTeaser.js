import React from 'react'
import { compose } from 'react-apollo'

import { Link } from '../../lib/routes'
import withT from '../../lib/withT'

import { InfoBoxTitle, InfoBoxText, linkRule } from '@project-r/styleguide'

const AutoDiscussionTeaser = ({ t, discussionId }) => (
  <div>
    <InfoBoxTitle>{t('article/autodiscussionteaser/title')}</InfoBoxTitle>
    <InfoBoxText>
      {t.elements('article/autodiscussionteaser/text', {
        link: (
          <Link
            key='feedback'
            route='discussion'
            params={{ t: 'article', id: discussionId }}
          >
            <a {...linkRule}>{t('article/autodiscussionteaser/linktext')}</a>
          </Link>
        )
      })}
    </InfoBoxText>
  </div>
)

export default compose(withT)(AutoDiscussionTeaser)
