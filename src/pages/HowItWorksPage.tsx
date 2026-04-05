import { usePopAds } from '../lib/usePopAds'

export default function HowItWorksPage() {
  usePopAds()

  return (
    <div>
      <h2>How It Works</h2>
      <p>
        The proxy forwards your request to the target website, retrieves the page,
        and returns it through our server. This allows you to view content without
        directly exposing your browser to the destination.
      </p>
    </div>
  )
}
