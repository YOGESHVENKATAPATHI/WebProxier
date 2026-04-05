import { usePopAds } from '../lib/usePopAds'

export default function GettingStartedPage() {
  usePopAds()

  return (
    <div>
      <h2>Getting Started</h2>
      <p>
        To begin, type a website address into the search field and click Browse.
        The app will load the proxied page in a new browser location for quick access.
      </p>
    </div>
  )
}
