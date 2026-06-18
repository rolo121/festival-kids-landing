const withBase = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export const eventInfo = {
  name: 'Festival Kids 2026',
  claim: 'Una aventura sin límites organizada por BTL Marketing',
  dateLabel: '4 y 5 de julio',
  location: 'Olof Palme',
  targetDate: '2026-07-04T09:00:00',
  heroCta: {
    label: '¡Quiero ir!',
    href: '#talent-show',
  },
};

export const seoInfo = {
  title: 'Festival Kids 2026 | Evento Infantil por BTL Marketing Nicaragua',
  description:
    'Viví la magia de Festival Kids 2026 este 4 y 5 de julio en el Centro de Convenciones Olof Palme. Un evento único de BTL Marketing con shows en vivo, dinámicas infantiles, peinados locos y más de 40 marcas participantes.',
  image: withBase('/images/festival-kids/reference/landing-reference.jpg'),
  keywords: 'Festival Kids 2026, BTL Marketing, marketing experimental Nicaragua, activaciones de marca Managua, eventos infantiles Managua, Olof Palme, shows en vivo para niños, peinados locos concurso, minimaraton infantil 2026',
};