import { usePopAds } from '../lib/usePopAds'

export default function SupportedSitesPage() {
  usePopAds()

  return (
    <div>
      <h2>Supported Sites</h2>
      <p>
        Most documentation and research sites are supported, including Wikipedia,
        academic archives, blogs, and educational portals. If a site is blocked,
        this tool can usually still fetch it via the proxy.
      </p>
    </div>
  )
}
