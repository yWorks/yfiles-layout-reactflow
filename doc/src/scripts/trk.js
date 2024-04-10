import './matomo.js'

const { Matomo } = window
if (!Matomo) {
  console.error('Matomo not loaded')
}

const enabled = /docs\.yworks\.com/.test(location.href) && !/staging/.test(location.href)

let matomoTracker

if (enabled) {
  matomoTracker = Matomo.getTracker('//trk.yworks.com/matomo.php', '1')
  matomoTracker.disableCookies()
  matomoTracker.trackPageView()
  matomoTracker.trackVisibleContentImpressions()
  matomoTracker.enableLinkTracking()
}
