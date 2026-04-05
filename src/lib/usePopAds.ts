import { useEffect } from 'react'

const popAdsScript = `/*<![CDATA[/* */

(function(){var p=window,f="b18ff3fc6bdb096524cecc48399f9035",l=[["siteId",832-275*893*575-712+146493715],["minBid",0],["popundersPerIP","0"],["delayBetween",0],["default",false],["defaultPerDay",0],["topmostLayer","extreme"]],v=["d3d3LmFudGlhZGJsb2Nrc3lzdGVtcy5jb20va1VQL3B2aXNpYmlsaXR5Lm1pbi5qcw==","ZDNjb2Q4MHRobjdxbmQuY2xvdWRmcm9udC5uZXQvQy9GbFlGRS9ndmFuaWxsYS10aWx0Lm1pbi5jc3M=","d3d3Lmp6cm9vcWJlcWZ2Zy5jb20vVC9ndmlzaWJpbGl0eS5taW4uanM=","d3d3LmZ2bW5lenp1LmNvbS9uZkovSy95dmFuaWxsYS10aWx0Lm1pbi5jc3M="],t=-1,c,m,q=function(){clearTimeout(m);t++;ier=0;for(ier=0;ier<18;ier++){c=p.document.createElement("script");c.type="text/javascript";c.async=!0;var r=p.document.getElementsByTagName("script")[0];c.src="https://"+atob(v[t]);c.crossOrigin="anonymous";c.onerror=q;c.onload=function(){clearTimeout(m);p[f.slice(0,16)+f.slice(0,16)]||q()};m=setTimeout(q,5E3);r.parentNode.insertBefore(c,r)}};if(!p[f]){try{Object.freeze(p[f]=l)}catch(e){}q()}})();

/*]]>/* */`

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
