const { getDefaultConfig } = require('expo/metro-config');
const https = require('https');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

if (!config.resolver.assetExts.includes('bin')) {
  config.resolver.assetExts.push('bin');
}

// Proxy pour contourner la politique CORS en mode Web (Expo Web local sécurisé)
config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware) => {
    return (req, res, next) => {
      if (req.url && req.url.startsWith('/byd-api/')) {
        const origin = req.headers.origin;
        const host = req.headers.host;

        // Validation de sécurité : n'autoriser que les requêtes locales de développement
        const isLocalOrigin =
          !origin ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          (host && origin.includes(host));

        if (!isLocalOrigin) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Accès refusé : origine non autorisée sur le proxy local' }));
          return;
        }

        // Restreindre CORS à l'origine locale spécifique (au lieu de '*')
        if (origin) {
          res.setHeader('Access-Control-Allow-Origin', origin);
          res.setHeader('Vary', 'Origin');
        }
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept-Encoding, User-Agent');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Méthode non autorisée sur le proxy BYD' }));
          return;
        }

        const targetPath = req.url.replace('/byd-api', '');
        // Protection contre le path traversal et injection d'URL arbitraire
        if (!targetPath.startsWith('/') || targetPath.includes('..') || /^\/[a-zA-Z]+:\/\//.test(targetPath)) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Chemin de proxy invalide' }));
          return;
        }

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
          if (buffer.length > 0) {
            headers['content-length'] = String(buffer.length);
          } else {
            delete headers['content-length'];
          }

          const options = {
            hostname: targetUrl.hostname,
            port: 443,
            path: targetUrl.pathname + targetUrl.search,
            method: 'POST',
            headers: headers,
          };

          const proxyReq = https.request(options, (proxyRes) => {
            res.statusCode = proxyRes.statusCode || 200;
            Object.keys(proxyRes.headers).forEach((key) => {
              if (key.toLowerCase() !== 'access-control-allow-origin') {
                res.setHeader(key, proxyRes.headers[key]);
              }
            });
            if (origin) {
              res.setHeader('Access-Control-Allow-Origin', origin);
            }
            proxyRes.pipe(res);
          });

          proxyReq.on('error', (err) => {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Erreur du proxy vers BYD: ${err.message}` }));
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

