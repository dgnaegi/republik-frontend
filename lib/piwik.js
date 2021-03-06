import { payload } from './utils/track'
import { shouldIgnoreClick } from './utils/link'

let _paq
if (typeof window !== 'undefined') {
  _paq = window._paq = window._paq || []
}

const __DEV__ =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development'

const track = (...args) => {
  if (!_paq) {
    if (__DEV__) {
      throw new Error(
        "Can't use the imperative track api while server rendering"
      )
    }
    return
  }

  if (__DEV__) {
    console.log('track', ...args[0])
  }
  _paq.push(...args)
}

export default track

export const trackEvent = ([category, action, name, value]) => {
  track(['trackEvent', category, action, name, value])
  payload.record('events', { category, action, name, value })
}

export const trackEventOnClick = (
  [category, action, name, value],
  onClick
) => e => {
  trackEvent([category, action, name, value])

  if (shouldIgnoreClick(e)) {
    return
  }

  e.preventDefault()
  onClick(e)
}
