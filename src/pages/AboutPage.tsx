import { usePopAds } from '../lib/usePopAds'

export default function AboutPage() {
  usePopAds()

  return (
    <div>
      <h2>About WebProxier</h2>
      <p>
        WebProxier is designed to help students and researchers transparently view
        blocked educational content through a secure proxy interface. Enter a URL,
        and the proxy retrieves the page safely for browsing.
      </p>
    </div>
  )
}
