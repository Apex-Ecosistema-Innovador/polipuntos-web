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

`NEXT_PUBLIC_API_URL` apunta al API (por defecto `http://localhost:4000/api/v1`). `NEXT_PUBLIC_SITE_URL` es la URL pública de la web (metadatos y Open Graph).

## Scripts
`dev`, `build`, `start`, `lint`, `typecheck`, `format`, `test`, `sync:vendor`. `dev` y `build` copian a `public/vendor/` el wasm del lector QR para que funcione sin internet.

## Estructura
`src/app` rutas · `src/components` (ui, layout, visuals) · `src/features` (auth, student, teacher, admin) · `src/content` textos tipados · `src/lib` cliente API y utilidades · `src/styles` tokens y mixins SCSS.

## PWA y modo offline
La app es instalable y el service worker (`public/sw.js`) solo se registra en producción (`pnpm build && pnpm start`). Requiere HTTPS (localhost cuenta como seguro).

- **Estudiante**: el QR y el último total conocido se guardan en IndexedDB y se muestran sin conexión (el total aparece marcado como desactualizado).
- **Profesor**: el dispositivo guarda un roster de sus estudiantes; sin conexión se escanea, se elige asignatura y se asignan puntos. Las asignaciones se encolan en IndexedDB (`src/lib/offline/award-queue.ts`) y se envían a `POST /polipoints/awards/batch` al recuperar la conexión. La firma del QR se valida en el servidor al sincronizar.
- **Asignación manual**: si el QR falla, el profesor busca al estudiante por nombre o cédula en el roster guardado (también sin conexión), elige asignatura y puntos. Queda registrada con `source = manual`.
- Dashboards, asignaturas, historial, registro e inicio de sesión requieren conexión y muestran una pantalla propia.
- `src/proxy.ts` redirige según la cookie ligera `apex_session` (solo el rol, no es un secreto; la autorización real vive en el API). Rutas inexistentes muestran `not-found`.
- Sin conexión no se puede cerrar sesión ni cambiar el QR.

## Selector de asignaturas
`src/components/ui/combobox.tsx` es una lista desplegable con búsqueda (código, nombre o profesor, sin importar tildes), navegación por teclado y ARIA de combobox. Muestra como máximo 50 filas y avisa cuántas más coinciden, para que siga siendo usable con catálogos largos. Se usa en "Agregar asignatura", en el filtro del dashboard y al asignar polipuntos.

## Horario, ranking y reinicio semestral
- Al registrarse el estudiante pasa a `/estudiante/horario`, donde sube el PDF de su horario del portal académico (máx. 2 MB). El API lo lee, comprueba que el documento sea el de la cuenta y que el periodo sea el vigente, y enlaza cada código de asignatura con la del periodo: si hay una sola se inscribe sola; si hay varios profesores elige el suyo; si aún no existe queda pendiente y se reintenta con «Buscar de nuevo». Solo se guardan códigos y nombres; el archivo no se almacena.
- Cada semestre las asignaturas se reinician: `Mis polipuntos`, el escaneo y los listados solo muestran el periodo vigente (los puntos anteriores quedan en «Periodos anteriores») y un aviso pide cargar el horario del nuevo periodo.
- `/estudiante/ranking` muestra, por asignatura, la posición del estudiante y la de sus compañeros (nombre y polipuntos, sin cédula).
- Los polipuntos pueden ser negativos (cantidad distinta de cero); el formulario de asignar ofrece atajos de -10 y -5.

## Cuenta y recuperación de contraseña
- El correo institucional (`src/content/account.ts`, dominio `elpoli.edu.co`) es obligatorio en los registros; se valida en el formulario y en el API.
- `/recuperar-contrasena` pide el correo y siempre muestra el mismo mensaje. `/restablecer-contrasena` lee el token del fragmento de la URL, lo borra de la barra de direcciones y pide la nueva contraseña.
- `/cuenta` (todos los roles) muestra los datos y permite cambiar la contraseña; las demás sesiones se cierran y la actual continúa.
- Estas pantallas requieren conexión.

## Seguridad
- `src/proxy.ts` genera un nonce por petición y aplica una CSP estricta (`src/lib/security/content-security-policy.ts`): scripts solo con nonce y `strict-dynamic`, sin `unsafe-inline` ni `unsafe-eval` en producción, `connect-src` limitado al origen de la web y al del API (`NEXT_PUBLIC_API_URL`), sin frames ni plugins. Como el nonce exige render dinámico, `RootLayout` usa `connection()`.
- Concesiones puntuales: `wasm-unsafe-eval` (decodificador QR) y `style-src-attr 'unsafe-inline'` (atributos `style` de React/next/image; no ejecutan código).
- `next.config.ts` añade `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` (cámara solo propia), `COOP` y HSTS.
- Al cerrar sesión el access token se borra de memoria de inmediato y no se vuelve a renovar; después se revoca la sesión en el API.
- El access token vive solo en memoria; el refresh token es una cookie HttpOnly del API con rotación.
- Si cambias el dominio del API, actualiza `NEXT_PUBLIC_API_URL`: la CSP lo toma de ahí.
- **Mismo origen (recomendado en producción):** con `NEXT_PUBLIC_API_URL=/api/v1` y `API_PROXY_TARGET=https://<api>`, `next.config.ts` reenvía `/api/v1/*` y `/api-health` al API. El navegador solo habla con el dominio de la web, así que la cookie de refresco es de primera parte y Safari/iPhone no la bloquea (con web y API en dominios distintos de `vercel.app` la sesión se perdería al recargar). La CSP queda con `connect-src 'self'` y el API puede usar `COOKIE_SAME_SITE=lax`. `API_PROXY_TARGET` solo se lee en el servidor.
- `DISABLE_SECURITY_HEADERS=true` apaga la CSP y las cabeceras de seguridad (solo para depurar en local; por defecto está desactivado y no debe usarse en un despliegue).

## Assets de marca
`public/brand/` contiene el símbolo y los logos usados en la interfaz; `public/icons/` y `src/app/icon.png`, `apple-icon.png`, `opengraph-image.png` se generaron a partir del símbolo.

## Probar desde otro dispositivo en la red local
Con `pnpm dev` (`NODE_ENV=development`) no necesitas configurar nada: abre `http://IP-de-tu-computador:3000` (escribe `http://` completo; Safari intenta `https` por defecto).

- Si la app no corre en producción, el cliente reemplaza `localhost` del `NEXT_PUBLIC_API_URL` por el host con el que abriste la página (`src/lib/env.ts`), la CSP permite ese origen y Next acepta los orígenes de red local (`next.config.ts`). El API acepta peticiones de `localhost` y de IPs privadas (`192.168.*`, `10.*`, `172.16-31.*`, `*.local`) cuando `NODE_ENV` no es `production`.
- En producción (`NODE_ENV=production`) nada de eso aplica: el API usa solo `CORS_ORIGINS`, la CSP añade `upgrade-insecure-requests` si `NEXT_PUBLIC_SITE_URL` es `https://` y se envían HSTS y COOP.
- `ALLOWED_DEV_ORIGINS` (opcional) añade otros hosts de desarrollo, por ejemplo un túnel.
- Limitación del navegador: la cámara, el service worker y la instalación de la PWA exigen HTTPS o `localhost`. Por IP con `http` la pantalla de asignar avisa y abre la búsqueda manual; para probar el escáner en el celular usa un túnel HTTPS (`cloudflared tunnel --url http://localhost:3000`) o `next dev --experimental-https`.
- `pnpm start` también corre con `NODE_ENV=production`; no uses un build de producción para pruebas por IP.

## Calidad antes de cada commit
Husky ejecuta `.husky/pre-commit`: `lint` (sin advertencias) y `build` (que incluye el chequeo de tipos). Si falla alguno, el commit se cancela. Los tests se corren con `pnpm test`.

## Pendientes
- **CI/CD con GitHub Actions** (aún no): workflow que corra lint, build y tests en cada push y pull request, y despliegue a Vercel.
- Pruebas en celulares reales (cámara, instalación de la PWA y modo avión).
- Pruebas de interfaz automáticas (Playwright).
