# Festival Kids Landing - Astro Starter

Estructura base para implementar la landing de Festival Kids sección por sección.

## Requisitos

- Node.js 20 o superior recomendado.
- npm.

## Instalación

```bash
npm install
npm run dev
```

Abrir:

```bash
http://localhost:4321
```

## Estructura

```txt
src/
├── components/
│   ├── common/        # Componentes reutilizables
│   ├── forms/         # Formularios
│   └── landing/       # Secciones principales
├── data/              # Textos, sponsors, fechas y configuraciones
├── layouts/           # Layout base SEO
├── pages/             # Páginas Astro
└── scripts/           # JS de countdown, forms y tracking

public/images/festival-kids/
├── reference/         # Visual de referencia
├── hero/
├── countdown/
├── talent-show/
├── marathon/
├── hairstyles/
└── sponsors/
```

## Orden recomendado de trabajo

1. Colocar assets reales en `public/images/festival-kids/`.
2. Ajustar `src/data/event.ts`.
3. Trabajar `HeroSection.astro`.
4. Trabajar `CountdownSection.astro`.
5. Trabajar `TalentShowSection.astro`.
6. Trabajar `MiniMarathonSection.astro`.
7. Trabajar `CrazyHairstylesSection.astro`.
8. Trabajar `SponsorsSection.astro`.
9. Conectar formularios a Google Sheets, Netlify Forms o Supabase.

## Formularios

Actualmente los formularios están listos para maquetación y validación frontend. La integración real se puede conectar desde `src/scripts/forms.js`.

## Referencia visual

El arte compartido está copiado en:

```txt
public/images/festival-kids/reference/landing-reference.jpg
```

No se recomienda usarlo como landing final completa. Debe funcionar como referencia de composición.
