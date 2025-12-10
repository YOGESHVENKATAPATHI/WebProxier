// api/proxy.js
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Usage: /api/proxy?url=https://website.com');
  }

  // Ensure URL starts with http/https
  const targetUrl = url.startsWith('http') ? url : `https://${url}`;

  try {
    // 1. Fetch the content from the blocked site
    const response = await fetch(targetUrl);
    const contentType = response.headers.get('content-type');
    
    // If it's an image or non-html, just pipe it through directly
    if (!contentType || !contentType.includes('text/html')) {
        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', contentType || 'application/octet-stream');
        return res.send(Buffer.from(buffer));
    }

    // 2. If it is HTML, we need to rewrite links
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Base URL helper to handle relative links (e.g., /about -> https://site.com/about)
    const getAbsoluteUrl = (relUrl) => {
        try {
            return new URL(relUrl, targetUrl).href;
        } catch (e) {
            return relUrl;
        }
    };

    // Rewrite all Links (<a href>)
    $('a').each((_, elem) => {
        const href = $(elem).attr('href');
        if (href) {
            // Point the link back to OUR proxy
            const absolute = getAbsoluteUrl(href);
            $(elem).attr('href', `/api/proxy?url=${encodeURIComponent(absolute)}`);
        }
    });

    // Rewrite all Images (<img src>) and Scripts/CSS
    // We point these back to the proxy too so they load
    $('img, script, link, iframe').each((_, elem) => {
        const src = $(elem).attr('src');
        const href = $(elem).attr('href');
        
        if (src) {
            $(elem).attr('src', `/api/proxy?url=${encodeURIComponent(getAbsoluteUrl(src))}`);
        }
        if (href) {
            $(elem).attr('href', `/api/proxy?url=${encodeURIComponent(getAbsoluteUrl(href))}`);
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