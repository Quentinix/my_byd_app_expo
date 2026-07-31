const { getDefaultConfig } = require('expo/metro-config');
const https = require('https');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

if (!config.resolver.assetExts.includes('bin')) {
  config.resolver.assetExts.push('bin');
}

// Proxy pour contourner la politique CORS en mode Web (Expo Web local)
config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware) => {
    return (req, res, next) => {
      if (req.url && req.url.startsWith('/byd-api/')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', '*');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        const targetPath = req.url.replace('/byd-api', '');
        const targetUrl = new URL(targetPath, 'https://dilinkappoversea-eu.byd.auto');

        const bodyChunks = [];
        req.on('data', (chunk) => bodyChunks.push(chunk));
        req.on('end', () => {
          const buffer = Buffer.concat(bodyChunks);

          const headers = { ...req.headers };
          delete headers.host;
          delete headers.referer;
          delete headers.origin;
          headers['accept-encoding'] = 'identity';
          headers['host'] = targetUrl.hostname;

          const options = {
            hostname: targetUrl.hostname,
            port: 443,
            path: targetUrl.pathname + targetUrl.search,
            method: req.method,
            headers: headers,
          };

          const proxyReq = https.request(options, (proxyRes) => {
            res.statusCode = proxyRes.statusCode || 200;
            Object.keys(proxyRes.headers).forEach((key) => {
              if (key.toLowerCase() !== 'access-control-allow-origin') {
                res.setHeader(key, proxyRes.headers[key]);
              }
            });
            res.setHeader('Access-Control-Allow-Origin', '*');
            proxyRes.pipe(res);
          });

          proxyReq.on('error', (err) => {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Proxy Error: ${err.message}` }));
          });

          if (buffer.length > 0) {
            proxyReq.write(buffer);
          }
          proxyReq.end();
        });
        return;
      }
      return metroMiddleware(req, res, next);
    };
  },
};

module.exports = config;

