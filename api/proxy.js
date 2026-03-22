// api/proxy.js
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url, ...extraQuery } = req.query;

  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).send('Usage: /api/proxy?url=https://website.com');
  }

  if (url.includes('/api/proxy')) {
    // Prevent proxy recursion and overload loops
    return res.status(400).send('Proxy recursion detected');
  }

  // Ensure URL starts with http/https
  const rawTarget = url.startsWith('http') ? url : `https://${url}`;

  let parsedTarget;
  try {
    parsedTarget = new URL(rawTarget);
  } catch (err) {
    return res.status(400).send('Invalid target URL');
  }

  // Preserve extra GET params from rewritten forms (e.g., ?q=searchterm)
  Object.entries(extraQuery).forEach(([key, value]) => {
    parsedTarget.searchParams.set(key, value as string);
  });

  const targetUrl = parsedTarget.toString();

  // Helper to safely resolve absolute URLs
  const getAbsoluteUrl = (relUrl) => {
    try {
        return new URL(relUrl, targetUrl).href;
    } catch (e) {
        return relUrl;
    }
  };

  try {
    // 1. Fetch the content with a realistic User-Agent to prevent bot-blocking
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send(`Upstream error: ${response.status} ${response.statusText}`);
    }

    const MAX_HTML_BYTES = 6 * 1024 * 1024; // 6 MB
    const contentLength = response.headers.get('content-length');
    if (contentLength && Number(contentLength) > MAX_HTML_BYTES) {
      // Avoid overloading server with massive files
      res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
      const buffer = await response.arrayBuffer();
      return res.send(Buffer.from(buffer));
    }

    const contentType = response.headers.get('content-type');
    
    // Add generous CORS headers so the browser doesn't block resources
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // If it's an image or non-html, just pipe it through directly
    if (!contentType || !contentType.includes('text/html')) {
        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', contentType || 'application/octet-stream');
        return res.send(Buffer.from(buffer));
    }

    // 2. If it is HTML, we need to rewrite links
    const html = await response.text();
    const $ = cheerio.load(html);

    // Rewrite all Links (<a href>)
    $('a').each((_, elem) => {
        const href = $(elem).attr('href');
        if (href && !href.startsWith('javascript:')) {
            const absolute = getAbsoluteUrl(href);
            $(elem).attr('href', `/api/proxy?url=${encodeURIComponent(absolute)}`);
        }
    });

    // Rewrite form actions so in-site search/forms keep proxied context
    $('form').each((_, elem) => {
        const action = $(elem).attr('action') || '';
        if (action && action.startsWith('javascript:')) {
            return;
        }

        const absoluteAction = action ? getAbsoluteUrl(action) : targetUrl;
        if (!absoluteAction || absoluteAction.includes('/api/proxy')) {
            return; // avoid proxy loops
        }

        $(elem).attr('action', `/api/proxy?url=${encodeURIComponent(absoluteAction)}`);

        // Most search forms are GET; ensure query parameters are forwarded correctly.
        if (!$(elem).attr('method') || $(elem).attr('method')?.toLowerCase() === 'get') {
            $(elem).attr('method', 'get');
        }
    });

    // Rewrite basic attributes for Images, Scripts, CSS, and Iframes
    $('img, script, link, iframe, source').each((_, elem) => {
        const src = $(elem).attr('src');
        const href = $(elem).attr('href');
        const srcset = $(elem).attr('srcset'); // Handle modern responsive images
        
        if (src) {
            $(elem).attr('src', `/api/proxy?url=${encodeURIComponent(getAbsoluteUrl(src))}`);
        }
        if (href) {
            $(elem).attr('href', `/api/proxy?url=${encodeURIComponent(getAbsoluteUrl(href))}`);
        }
        
        // Handle responsive images (e.g., srcset="img1.jpg 1x, img2.jpg 2x")
        if (srcset) {
            const rewrittenSrcset = srcset.split(',').map(part => {
                const [urlPart, sizePart] = part.trim().split(/\s+/);
                if (urlPart) {
                    return `/api/proxy?url=${encodeURIComponent(getAbsoluteUrl(urlPart))}${sizePart ? ' ' + sizePart : ''}`;
                }
                return part;
            }).join(', ');
            $(elem).attr('srcset', rewrittenSrcset);
        }
    });

    // Handle inline CSS background images (very basic)
    $('[style]').each((_, elem) => {
        let style = $(elem).attr('style');
        if (style && style.includes('url(')) {
            style = style.replace(/url\(['"]?(.*?)['"]?\)/g, (match, p1) => {
                if (!p1.startsWith('data:')) {
                    return `url('/api/proxy?url=${encodeURIComponent(getAbsoluteUrl(p1))}')`;
                }
                return match;
            });
            $(elem).attr('style', style);
        }
    });

    // 3. Send the modified HTML to the user
    res.setHeader('Content-Type', 'text/html');
    res.send($.html());

  } catch (error) {
    console.error(error);
    res.status(500).send(`Error fetching page: ${error.message}`);
  }
}