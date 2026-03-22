// api/proxy.js
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // 1. Extract the 'url' and capture any extra GET parameters (e.g., from search forms)
  const { url, ...extraParams } = req.query;

  if (!url) {
    return res.status(400).send('Usage: /api/proxy?url=https://website.com');
  }

  // 2. Build the correct absolute Target URL and append the extra parameters
  let targetUrlObj;
  try {
    const urlString = url.startsWith('http') ? url : `https://${url}`;
    targetUrlObj = new URL(urlString);
    
    // Append the extra form parameters (like ?q=searchterm) to the target URL
    for (const [key, value] of Object.entries(extraParams)) {
      if (Array.isArray(value)) {
        value.forEach(v => targetUrlObj.searchParams.append(key, v));
      } else {
        targetUrlObj.searchParams.append(key, value);
      }
    }
  } catch (e) {
    return res.status(400).send('Invalid URL provided.');
  }

  const finalTargetUrl = targetUrlObj.toString();

  // Helper to safely resolve absolute URLs
  const getAbsoluteUrl = (relUrl) => {
    try {
      return new URL(relUrl, finalTargetUrl).href;
    } catch (e) {
      return relUrl;
    }
  };

  try {
    // 3. Configure the fetch request, ensuring we pass along POST bodies and methods
    const fetchOptions = {
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    };

    // Forward form data if the request is a POST/PUT (e.g., logins, complex searches)
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      const contentType = req.headers['content-type'] || '';
      fetchOptions.headers['Content-Type'] = contentType;

      // Vercel parses bodies automatically, so we must stringify them back for the fetch
      if (typeof req.body === 'object') {
        if (contentType.includes('application/json')) {
          fetchOptions.body = JSON.stringify(req.body);
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          fetchOptions.body = new URLSearchParams(req.body).toString();
        }
      } else {
        fetchOptions.body = req.body;
      }
    }

    const response = await fetch(finalTargetUrl, fetchOptions);
    const contentType = response.headers.get('content-type');
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // If it's an image or non-html, pipe it through directly
    if (!contentType || !contentType.includes('text/html')) {
        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', contentType || 'application/octet-stream');
        return res.send(Buffer.from(buffer));
    }

    // 4. If it is HTML, process and rewrite links and forms
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

    // Rewrite Forms (Crucial for Search to work)
    $('form').each((_, elem) => {
        const action = $(elem).attr('action') || '';
        const method = ($(elem).attr('method') || 'GET').toUpperCase();
        const absoluteAction = getAbsoluteUrl(action);

        if (method === 'GET') {
            // Browsers strip query params from action on GET. Use a hidden input instead.
            $(elem).attr('action', '/api/proxy');
            $(elem).prepend(`<input type="hidden" name="url" value="${absoluteAction}">`);
        } else {
            // For POST forms, it is safe to keep the url in the action query string
            $(elem).attr('action', `/api/proxy?url=${encodeURIComponent(absoluteAction)}`);
        }
    });

    // Rewrite basic attributes for Images, Scripts, CSS, and Iframes
    $('img, script, link, iframe, source').each((_, elem) => {
        const src = $(elem).attr('src');
        const href = $(elem).attr('href');
        const srcset = $(elem).attr('srcset'); 
        
        if (src) $(elem).attr('src', `/api/proxy?url=${encodeURIComponent(getAbsoluteUrl(src))}`);
        if (href) $(elem).attr('href', `/api/proxy?url=${encodeURIComponent(getAbsoluteUrl(href))}`);
        
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

    // Handle inline CSS background images
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

    // Send the modified HTML to the user
    res.setHeader('Content-Type', 'text/html');
    res.send($.html());

  } catch (error) {
    console.error(error);
    res.status(500).send(`Error fetching page: ${error.message}`);
  }
}