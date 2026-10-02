# polipuntos-web

Frontend de Polipuntos (APEX). Next.js (App Router) + TypeScript + SCSS Modules. Consume `apex-api`.

## Requisitos
Node 24+, pnpm 12.

## Puesta en marcha
```
cp .env.example .env.local
pnpm install
pnpm dev
```

`NEXT_PUBLIC_API_URL` apunta al API (por defecto `http://localhost:5000/api/v1`).

## Scripts
`dev`, `build`, `start`, `lint`, `typecheck`, `format`.

## Estructura
`src/app` rutas · `src/components` (ui, layout, visuals) · `src/features` (auth, student, teacher, admin) · `src/content` textos tipados · `src/lib` cliente API y utilidades · `src/styles` tokens y mixins SCSS.

## Assets de marca
Colocar `logo.png`, `wordmark.png` y `logo-white.png` (fondo transparente) en `public/brand/`.
