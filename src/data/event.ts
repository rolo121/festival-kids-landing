const withBase = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export const eventInfo = {
  name: 'Festival Kids',
  claim: 'Una aventura sin límites',
  dateLabel: '4 y 5 de julio',
  location: 'Olof Palme',
  targetDate: '2026-07-04T09:00:00',
  heroCta: {
    label: '¡Quiero ir!',
    href: '#talent-show',
  },
};

export const seoInfo = {
  title: 'Festival Kids | Una aventura sin límites',
  description:
    'Viví Festival Kids este 4 y 5 de julio en Olof Palme. Shows en vivo, retos, juegos, marcas participantes y actividades para niños.',
  image: withBase('/images/festival-kids/reference/landing-reference.jpg'),
};