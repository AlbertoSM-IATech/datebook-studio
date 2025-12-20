import { SystemEventTemplate, DEFAULT_TAGS } from '@/types/calendar';

// System events - Annual key dates for editorial calendar
export const SYSTEM_EVENTS: SystemEventTemplate[] = [
  // Q1 - January to March
  {
    key: 'new_year',
    name: 'Año Nuevo',
    description: 'Celebración del inicio del año nuevo',
    month: 1,
    day: 1,
    category: 'holidays',
    defaultTags: [DEFAULT_TAGS[1]], // Promoción
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: true,
  },
  {
    key: 'valentines_day',
    name: 'San Valentín',
    description: 'Día de los enamorados - Oportunidad para promociones románticas',
    month: 2,
    day: 14,
    category: 'commercial',
    defaultTags: [DEFAULT_TAGS[1], DEFAULT_TAGS[2]], // Promoción, Marketing
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: true,
  },
  {
    key: 'international_womens_day',
    name: 'Día Internacional de la Mujer',
    description: 'Celebración del día de la mujer',
    month: 3,
    day: 8,
    category: 'awareness',
    defaultTags: [DEFAULT_TAGS[3]], // Contenido
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: true,
  },
  {
    key: 'st_patricks_day',
    name: 'San Patricio',
    description: 'Festividad irlandesa celebrada internacionalmente',
    month: 3,
    day: 17,
    category: 'holidays',
    defaultTags: [DEFAULT_TAGS[1]], // Promoción
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: false,
  },
  // Q2 - April to June
  {
    key: 'world_book_day',
    name: 'Día del Libro',
    description: 'Día Internacional del Libro - Fecha clave para promociones literarias',
    month: 4,
    day: 23,
    category: 'literary',
    defaultTags: [DEFAULT_TAGS[0], DEFAULT_TAGS[1]], // Lanzamiento, Promoción
    defaultReminders: [
      { id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true },
      { id: 'r2', offsetMinutes: 2880, channel: 'in_app', enabled: true },
    ],
    enabled: true,
  },
  {
    key: 'earth_day',
    name: 'Día de la Tierra',
    description: 'Concienciación ambiental',
    month: 4,
    day: 22,
    category: 'awareness',
    defaultTags: [DEFAULT_TAGS[3]], // Contenido
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: false,
  },
  {
    key: 'mothers_day',
    name: 'Día de la Madre',
    description: 'Celebración del día de la madre (fecha variable por país)',
    month: 5,
    day: null,
    dynamicRule: 'first_sunday_may',
    category: 'commercial',
    defaultTags: [DEFAULT_TAGS[1], DEFAULT_TAGS[2]], // Promoción, Marketing
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: true,
  },
  {
    key: 'fathers_day',
    name: 'Día del Padre',
    description: 'Celebración del día del padre',
    month: 6,
    day: null,
    dynamicRule: 'third_sunday_june',
    category: 'commercial',
    defaultTags: [DEFAULT_TAGS[1], DEFAULT_TAGS[2]], // Promoción, Marketing
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: true,
  },
  // Q3 - July to September
  {
    key: 'summer_sale',
    name: 'Rebajas de Verano',
    description: 'Inicio temporada de rebajas de verano',
    month: 7,
    day: 1,
    category: 'commercial',
    defaultTags: [DEFAULT_TAGS[1]], // Promoción
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: true,
  },
  {
    key: 'back_to_school',
    name: 'Vuelta al Cole',
    description: 'Temporada de regreso a clases',
    month: 9,
    day: 1,
    category: 'commercial',
    defaultTags: [DEFAULT_TAGS[1], DEFAULT_TAGS[2]], // Promoción, Marketing
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: true,
  },
  // Q4 - October to December
  {
    key: 'halloween',
    name: 'Halloween',
    description: 'Noche de brujas - Oportunidad para promociones temáticas',
    month: 10,
    day: 31,
    category: 'commercial',
    defaultTags: [DEFAULT_TAGS[1], DEFAULT_TAGS[3]], // Promoción, Contenido
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: true,
  },
  {
    key: 'singles_day',
    name: 'Día del Soltero (11.11)',
    description: 'Mayor evento de compras online del mundo',
    month: 11,
    day: 11,
    category: 'commercial',
    defaultTags: [DEFAULT_TAGS[1]], // Promoción
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: true,
  },
  {
    key: 'black_friday',
    name: 'Black Friday',
    description: 'Mayor evento de descuentos del año',
    month: 11,
    day: null,
    dynamicRule: 'fourth_friday_november',
    category: 'commercial',
    defaultTags: [DEFAULT_TAGS[1], DEFAULT_TAGS[2]], // Promoción, Marketing
    defaultReminders: [
      { id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true },
      { id: 'r2', offsetMinutes: 2880, channel: 'in_app', enabled: true },
    ],
    enabled: true,
  },
  {
    key: 'cyber_monday',
    name: 'Cyber Monday',
    description: 'Día de ofertas online post Black Friday',
    month: 11,
    day: null,
    dynamicRule: 'monday_after_black_friday',
    category: 'commercial',
    defaultTags: [DEFAULT_TAGS[1]], // Promoción
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: true,
  },
  {
    key: 'christmas_eve',
    name: 'Nochebuena',
    description: 'Víspera de Navidad',
    month: 12,
    day: 24,
    category: 'holidays',
    defaultTags: [DEFAULT_TAGS[1]], // Promoción
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: true,
  },
  {
    key: 'christmas',
    name: 'Navidad',
    description: 'Día de Navidad',
    month: 12,
    day: 25,
    category: 'holidays',
    defaultTags: [DEFAULT_TAGS[1], DEFAULT_TAGS[3]], // Promoción, Contenido
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: true,
  },
  {
    key: 'new_years_eve',
    name: 'Nochevieja',
    description: 'Fin de año',
    month: 12,
    day: 31,
    category: 'holidays',
    defaultTags: [DEFAULT_TAGS[3]], // Contenido
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: true,
  },
  // Additional literary/publishing dates
  {
    key: 'poetry_day',
    name: 'Día Mundial de la Poesía',
    description: 'Celebración de la poesía',
    month: 3,
    day: 21,
    category: 'literary',
    defaultTags: [DEFAULT_TAGS[3]], // Contenido
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: false,
  },
  {
    key: 'storytelling_day',
    name: 'Día del Cuento',
    description: 'Día internacional de la narración',
    month: 3,
    day: 20,
    category: 'literary',
    defaultTags: [DEFAULT_TAGS[3]], // Contenido
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: false,
  },
  {
    key: 'libraries_day',
    name: 'Día de las Bibliotecas',
    description: 'Celebración de las bibliotecas',
    month: 10,
    day: 24,
    category: 'literary',
    defaultTags: [DEFAULT_TAGS[3]], // Contenido
    defaultReminders: [{ id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }],
    enabled: false,
  },
];

// Category configuration
export const EVENT_CATEGORIES = {
  holidays: { label: 'Festividades', color: 'hsl(262 83% 58%)' },
  commercial: { label: 'Comerciales', color: 'hsl(24 94% 59%)' },
  literary: { label: 'Literarias', color: 'hsl(217 91% 60%)' },
  awareness: { label: 'Concienciación', color: 'hsl(142 71% 45%)' },
};

// Helper to calculate dynamic dates
export function calculateDynamicDate(rule: string, year: number): Date | null {
  switch (rule) {
    case 'fourth_friday_november': {
      const nov = new Date(year, 10, 1); // November
      let fridayCount = 0;
      for (let d = 1; d <= 30; d++) {
        const date = new Date(year, 10, d);
        if (date.getDay() === 5) {
          fridayCount++;
          if (fridayCount === 4) return date;
        }
      }
      return null;
    }
    case 'monday_after_black_friday': {
      const blackFriday = calculateDynamicDate('fourth_friday_november', year);
      if (blackFriday) {
        const monday = new Date(blackFriday);
        monday.setDate(monday.getDate() + 3);
        return monday;
      }
      return null;
    }
    case 'first_sunday_may': {
      for (let d = 1; d <= 7; d++) {
        const date = new Date(year, 4, d); // May
        if (date.getDay() === 0) return date;
      }
      return null;
    }
    case 'third_sunday_june': {
      let sundayCount = 0;
      for (let d = 1; d <= 30; d++) {
        const date = new Date(year, 5, d); // June
        if (date.getDay() === 0) {
          sundayCount++;
          if (sundayCount === 3) return date;
        }
      }
      return null;
    }
    default:
      return null;
  }
}
