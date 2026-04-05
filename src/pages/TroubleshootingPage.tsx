import { usePopAds } from '../lib/usePopAds'

export default function TroubleshootingPage() {
  usePopAds()

  return (
    <div>
      <h2>Troubleshooting</h2>
      <p>
        If a page does not load, verify the URL format and make sure the site is
        supported. Try using "https://" or the bare domain name, and avoid pages
        that require a login.
      </p>
    </div>
  )
}
