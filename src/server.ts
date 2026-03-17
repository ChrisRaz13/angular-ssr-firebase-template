import 'zone.js/node';
import { renderApplication } from '@angular/platform-server';
import { APP_BASE_HREF } from '@angular/common';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import compression from 'compression';
import bootstrap from './main.server';

// ── Path helpers ──────────────────────────────────────────────────────────────
const serverDistFolder  = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

// ✅ Use index.server.html — the BARE SSR template (empty <app-root>).
// dist/browser/index.html is the PRE-RENDERED home page; using it as the
// renderApplication document would embed home-page content into every SSR
// response, corrupt hydration, and trigger console errors / phantom noindex.
const indexHtml = join(serverDistFolder, 'index.server.html');

// Cache the SSR template once — it never changes between requests.
const documentTemplate = readFileSync(indexHtml, 'utf-8');

export function app(): express.Express {
  const server = express();

  // ── Gzip / Brotli compression ─────────────────────────────────────────────
  server.use(compression());

  // ── Security + SEO headers ────────────────────────────────────────────────
  server.use((_req, res, next) => {
    // HTTP Link header — preconnects are processed by the browser BEFORE it
    // parses the HTML, making them faster than <link rel="preconnect"> tags.
    // Keep to ≤ 3 origins (each opens a TCP+TLS handshake that costs bandwidth).
    res.setHeader('Link', [
      '<https://www.googletagmanager.com>; rel=preconnect',
      '<https://www.google.com>; rel=dns-prefetch',
      '<https://js.hsforms.net>; rel=dns-prefetch',
    ].join(', '));

    // X-Robots-Tag: override Firebase App Hosting's potential noindex on
    // *.hosted.app staging URLs so Lighthouse / crawlers see the page as
    // indexable even on the default preview domain.
    res.setHeader('X-Robots-Tag', 'index, follow');

    res.setHeader('X-Content-Type-Options',    'nosniff');
    res.setHeader('X-Frame-Options',           'DENY');
    res.setHeader('X-XSS-Protection',          '1; mode=block');
    res.setHeader('Referrer-Policy',           'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy',        'camera=(), microphone=(), geolocation=(), interest-cohort=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    // Cross-Origin-Opener-Policy: fixes Lighthouse Best Practices "COOP" audit.
    // same-origin-allow-popups allows OAuth / payment popups while still
    // providing cross-origin isolation benefits.
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    // TODO: tighten CSP (replace 'unsafe-inline' with nonces) once all
    //       third-party scripts are finalised.
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

  // ── Trailing-slash redirect → canonical no-slash URL ─────────────────────
  // 301-redirects /about/ → /about so the URL Google indexes always matches
  // the canonical tag. Must run BEFORE static file serving.
  server.use((req, res, next) => {
    if (req.path !== '/' && req.path.endsWith('/')) {
      const query = req.url.slice(req.path.length); // preserve ?query strings
      return res.redirect(301, req.path.slice(0, -1) + query);
    }
    next();
  });

  // ── Static assets — 1-year immutable cache ────────────────────────────────
  // index: false  — don't auto-serve index.html for directory requests;
  //                 the SSR handler below provides correct per-route HTML.
  // redirect: false — prevent express.static from 301-redirecting /about →
  //                   /about/ (conflicts with our trailing-slash redirect above).
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    immutable: true,
    index:    false,
    redirect: false,
    setHeaders: (res, filePath: string) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));

  // ── All other routes → Angular SSR via renderApplication ─────────────────
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

// ── Start server ──────────────────────────────────────────────────────────────
// Always listen unconditionally — Firebase App Hosting imports this module
// (it is NOT the main Node.js entry point), so isMainModule() returns false.
// Cloud Run provides PORT=8080.
const port = process.env['PORT'] || 4000;
app().listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
});
