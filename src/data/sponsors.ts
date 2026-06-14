const withBase = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export const sponsors = {
  presentan: [
    {
      name: 'Nido',
      logo: withBase('/images/festival-kids/sponsors/presentan/nido.webp'),
    },
    {
      name: 'Dog Chow',
      logo: withBase('/images/festival-kids/sponsors/presentan/dog-chow.webp'),
    },
    {
      name: 'Maggi',
      logo: withBase('/images/festival-kids/sponsors/presentan/maggi.webp'),
    },
    {
      name: 'Purina',
      logo: withBase('/images/festival-kids/sponsors/presentan/purina.webp'),
    },
  ],
  patrocinan: [
    {
      name: 'Nestum',
      logo: withBase('/images/festival-kids/sponsors/patrocinan/nestum.webp'),
    },
    {
      name: 'Gerber',
      logo: withBase('/images/festival-kids/sponsors/patrocinan/gerber.webp'),
    },
    {
      name: 'Colgate',
      logo: withBase('/images/festival-kids/sponsors/patrocinan/colgate.webp'),
    },
    {
      name: 'Protex',
      logo: withBase('/images/festival-kids/sponsors/patrocinan/protex.webp'),
    },
    {
      name: 'Tostito',
      logo: withBase('/images/festival-kids/sponsors/patrocinan/tostito.webp'),
    },
  ],
  marcas: [
    {
      name: 'Marca participante',
      logo: withBase('/images/festival-kids/sponsors/marcas/logo-placeholder.webp'),
    },
  ],
};