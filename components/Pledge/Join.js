import React, { useState } from 'react'
import {
  Field,
  colors,
  Interaction,
  Button,
  fontStyles,
  Editorial
} from '@project-r/styleguide'
import withT from '../../lib/withT'
import isEmail from 'validator/lib/isEmail'
import Consents, { getConsentsError } from './Consents'
import { Elements, CardElement } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { STRIPE_PUBLISHABLE_KEY } from '../../lib/constants'

const OFFERS = [
  {
    package: 'MONTHLY_ABO',
    label: 'Monats-Abo',
    price: 'CHF 22 pro Monat',
    // text: 'Das Monatsabonnement wird jeweils automatisch verlängert. Sie können es aber jederzeit in Ihrem Konto kündigen.',
    benefits: ['Jederzeit kündbar']
  },
  {
    package: 'ABO',
    label: 'Jahresmitgliedschaft',
    price: 'CHF 240 pro Jahr',
    // text: 'Sie werden Mitglied der Project R Genossenschaft. Und damit zu einem kleinen Teil Verlegerin oder Verleger der Republik.',
    benefits: [
      'Stimmrecht in der Project R Genossenschaft: den Weg der Republik mitbestimmen.',
      'Tiefere Transaktionsgebühren: Sie zahlen rund 24 Franken weniger im Jahr als beim Monatsabo.'
    ]
  },
  {
    package: 'BENEFACTOR',
    label: 'Gönner',
    price: 'CHF 1000 pro Jahr',
    // text: 'Sie wollen nicht nur ein unabhängiges Magazin lesen, sondern Sie wollen sich auch energisch dafür einsetzen, dass dieses existiert.',
    benefits: [
      'Stimmrecht in der Project R Genossenschaft: den Weg der Republik mitbestimmen.',
      'Um uns für Ihre Unterstützung zu revanchieren, schicken wir Ihnen das Start-up-Verleger-Paket zu. Darin finden Sie unser Manifest, den exklusiven Republik-Anstecker in Gold sowie ein signiertes «Handbuch für Journalismus im 21. Jahrhundert».'
    ]
  }
]

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)

const Join = ({ t, black }) => {
  const [currentOffer, setOffer] = useState(OFFERS[1])
  const [emailState, setEmailState] = useState({})
  const [consents, setConsents] = useState([])

  return (
    <Elements
      stripe={stripePromise}
      fonts={[
        {
          family: fontStyles.sansSerifRegular.fontFamily,
          weight: fontStyles.sansSerifRegular.fontWeight,
          src:
            'https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular.woff)'
        }
      ]}
    >
      <form style={{ display: 'block', minHeight: 360 }}>
        <Interaction.H2 style={{ marginBottom: 15 }}>
          Mitglied werden
        </Interaction.H2>
        <Interaction.P style={{ marginBottom: 20 }}>
          Wenn Sie weiterhin unabhängigen Journalismus wie diesen lesen wollen,
          handeln Sie jetzt: Kommen Sie an Bord!
        </Interaction.P>
        {OFFERS.map(offer => {
          const isSelected = offer === currentOffer
          return (
            <div
              key={offer.package}
              style={{
                borderBottom: isSelected
                  ? `2px solid ${black ? '#000' : colors.primary}`
                  : '2px solid transparent',
                marginRight: 15,
                marginBottom: 10,
                paddingBottom: 5,
                float: 'left',
                fontSize: 22,
                ...(isSelected && fontStyles.sansSerifMedium),
                cursor: isSelected ? 'default' : 'pointer'
              }}
              onClick={e => {
                e.preventDefault()
                setOffer(offer)
              }}
            >
              <div>{offer.label}</div>
            </div>
          )
        })}
        <br style={{ clear: 'both' }} />
        <Interaction.P>{currentOffer.text}</Interaction.P>
        <Field
          black={black}
          name='email'
          type='email'
          label={t('pledge/contact/email/label')}
          error={emailState.dirty && emailState.error}
          onChange={(_, value, shouldValidate) => {
            setEmailState(state => ({
              ...state,
              value,
              dirty: shouldValidate,
              error:
                (value.trim().length <= 0 &&
                  t('pledge/contact/email/error/empty')) ||
                (!isEmail(value) && t('pledge/contact/email/error/invalid'))
            }))
          }}
          value={emailState.value}
        />
        <div
          style={{
            borderBottom: `1px solid ${black ? 'black' : colors.disabled}`,
            paddingTop: 5,
            paddingBottom: 5,
            marginBottom: 20
          }}
        >
          <CardElement
            options={{
              hidePostalCode: true,
              // iconStyle: 'solid',
              style: {
                base: {
                  fontSize: '22px',
                  ...fontStyles.sansSerifRegular,
                  color: colors.text,
                  // borderBottom: '1px solid black',
                  '::placeholder': {
                    color: colors.disabled
                  },
                  ':disabled': {
                    color: colors.disabled
                  }
                },
                invalid: {
                  color: colors.error
                }
              }
            }}
          />
        </div>
        <div style={{ margin: '10px 0 20px' }}>
          <Consents
            black={black}
            required={[
              'PRIVACY',
              'TOS',
              currentOffer.package !== 'MONTHLY_ABO' && 'STATUTE'
            ].filter(Boolean)}
            accepted={consents}
            onChange={keys => {
              setConsents(keys)
            }}
          />
        </div>
        <Button
          block
          primary
          black={black}
          style={
            black ? { backgroundColor: 'black', color: 'white' } : undefined
          }
        >
          {currentOffer.price}
        </Button>
        <Editorial.UL compact>
          <Editorial.LI>
            <Interaction.P>
              Sie erhalten täglich eine bis drei neue Geschichten. Als
              Newsletter, im Web oder in der App.
            </Interaction.P>
          </Editorial.LI>
          {currentOffer.benefits.map((benefit, i) => (
            <Editorial.LI key={i}>
              <Interaction.P>{benefit}</Interaction.P>
            </Editorial.LI>
          ))}
        </Editorial.UL>
      </form>
    </Elements>
  )
}

export default withT(Join)
