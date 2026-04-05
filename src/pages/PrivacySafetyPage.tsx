import { usePopAds } from '../lib/usePopAds'

export default function PrivacySafetyPage() {
  usePopAds()

  return (
    <div>
      <h2>Privacy & Safety</h2>
      <p>
        We do not store your browsing history. Use this service for reading and
        research only, and avoid entering private credentials or personal account
        logins on proxied pages.
      </p>
    </div>
  )
}
