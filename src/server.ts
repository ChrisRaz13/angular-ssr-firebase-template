import 'zone.js/node';
import { renderApplication } from '@angular/platform-server';
import { APP_BASE_HREF } from '@angular/common';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import compression from 'compression';
import bootstrap from './main.server';

// ── Resolve paths at module-load time (no engine manifest needed) ────
const serverDistFolder  = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml         = join(browserDistFolder, 'index.html');

// Cache the index template once — it never changes between requests
const documentTemplate = readFileSync(indexHtml, 'utf-8');

export function app(): express.Express {
  const server = express();

  // ── Gzip / Brotli compression ───────────────────────────────────
  server.use(compression());

  // ── Security headers ────────────────────────────────────────────
  server.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options',    'nosniff');
    res.setHeader('X-Frame-Options',           'DENY');
    res.setHeader('X-XSS-Protection',          '1; mode=block');
    res.setHeader('Referrer-Policy',           'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy',        'camera=(), microphone=(), geolocation=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    // TODO: tighten CSP once all third-party scripts are finalised
    res.setHeader('Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com https://js.hsforms.net https://www.google.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: blob: https: http:; " +
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://cloudfunctions.net; " +
      "frame-src https://www.google.com; " +
      "base-uri 'self';"
    );
    next();
  });

  // ── Static assets — 1-year immutable cache ──────────────────────
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res, filePath: string) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));

  // ── All other routes → Angular SSR via renderApplication ────────
  // Uses @angular/platform-server directly — no engine-manifest needed.
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    renderApplication(bootstrap, {
      document: documentTemplate,
      url: `${protocol}://${headers.host}${originalUrl}`,
      platformProviders: [
        { provide: APP_BASE_HREF, useValue: baseUrl },
      ],
    })
      .then((html: string) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send(html);
      })
      .catch((err: unknown) => next(err));
  });

  return server;
}

// ── Start server ─────────────────────────────────────────────────────
// Always listen unconditionally — Firebase App Hosting imports this module
// (it is NOT the main Node.js entry point), so isMainModule() returns false.
// Cloud Run provides PORT=8080.
const port = process.env['PORT'] || 4000;
app().listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
});
