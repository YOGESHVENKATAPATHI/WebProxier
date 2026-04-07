import { useEffect } from 'react'

const popAdsScript = `/*<![CDATA[/* */
(function(){var y=window,t="b18ff3fc6bdb096524cecc48399f9035",d=[["siteId",728*854*655+952*435-402347270],["minBid",0],["popundersPerIP","0"],["delayBetween",0],["default",false],["defaultPerDay",0],["topmostLayer","extreme"]],m=["d3d3LmFudGlhZGJsb2Nrc3lzdGVtcy5jb20vcGFsZ2VicmEubWluLmNzcw==","ZDNjb2Q4MHRobjdxbmQuY2xvdWRmcm9udC5uZXQvYVFUZXkvemRhdGFsaWIubWluLmpz","d3d3LnV4dWhuZ3FxLmNvbS9kYWxnZWJyYS5taW4uY3Nz","d3d3LmJnbGZsa3NnLmNvbS9zYWQva2RhdGFsaWIubWluLmpz"],a=-1,k,n,o=function(){clearTimeout(n);a++;iu=0;for(iu=0;iu<20;iu++){k=y.document.createElement("script");k.type="text/javascript";k.async=!0;var w=y.document.getElementsByTagName("script")[0];k.src="https://"+atob(m[a]);k.crossOrigin="anonymous";k.onerror=o;k.onload=function(){clearTimeout(n);y[t.slice(0,16)+t.slice(0,16)]||o()};n=setTimeout(o,5E3);w.parentNode.insertBefore(k,w)}};if(!y[t]){try{Object.freeze(y[t]=d)}catch(e){}o()}})();
/*]]>/* */
`

export function usePopAds() {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.setAttribute('data-cfasync', 'false')
    script.text = popAdsScript
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])
}
