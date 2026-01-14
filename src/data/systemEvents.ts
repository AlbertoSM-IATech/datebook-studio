import { SystemEventTemplate, Tag } from '@/types/calendar';

// ============================================
// EVENTOS SISTEMA - CALENDARIO EDITORIAL KDP
// ============================================
// Eventos estratégicos para publishers independientes (Amazon KDP)
// Enfocados en campañas comerciales y estacionales relevantes

// Tags específicos para eventos sistema KDP
const SYSTEM_TAGS: Record<string, Tag> = {
  blackFriday: { id: 'black-friday', name: 'Black Friday', color: 'hsl(0 0% 10%)' },
  ventas: { id: 'ventas', name: 'Ventas', color: 'hsl(142 71% 45%)' },
  promocion: { id: 'promocion', name: 'Promoción', color: 'hsl(24 94% 59%)' },
  ads: { id: 'ads', name: 'Ads', color: 'hsl(217 91% 60%)' },
  cyberMonday: { id: 'cyber-monday', name: 'Cyber Monday', color: 'hsl(217 91% 60%)' },
  ebook: { id: 'ebook', name: 'eBook', color: 'hsl(262 83% 58%)' },
  navidad: { id: 'navidad', name: 'Navidad', color: 'hsl(0 84% 60%)' },
  regalos: { id: 'regalos', name: 'Regalos', color: 'hsl(340 82% 52%)' },
  temporadaAlta: { id: 'temporada-alta', name: 'Temporada Alta', color: 'hsl(38 92% 50%)' },
  anoNuevo: { id: 'ano-nuevo', name: 'Año Nuevo', color: 'hsl(262 83% 58%)' },
  habitos: { id: 'habitos', name: 'Hábitos', color: 'hsl(142 71% 45%)' },
  objetivos: { id: 'objetivos', name: 'Objetivos', color: 'hsl(217 91% 60%)' },
  sanValentin: { id: 'san-valentin', name: 'San Valentín', color: 'hsl(340 82% 52%)' },
  romance: { id: 'romance', name: 'Romance', color: 'hsl(340 75% 60%)' },
  parejas: { id: 'parejas', name: 'Parejas', color: 'hsl(340 70% 55%)' },
  halloween: { id: 'halloween', name: 'Halloween', color: 'hsl(25 95% 53%)' },
  terror: { id: 'terror', name: 'Terror', color: 'hsl(0 0% 20%)' },
  fantasia: { id: 'fantasia', name: 'Fantasía', color: 'hsl(262 83% 58%)' },
  diaLibro: { id: 'dia-del-libro', name: 'Día del Libro', color: 'hsl(217 91% 60%)' },
  branding: { id: 'branding', name: 'Branding', color: 'hsl(38 92% 50%)' },
  editorial: { id: 'editorial', name: 'Editorial', color: 'hsl(262 83% 58%)' },
  primeDay: { id: 'prime-day', name: 'Prime Day', color: 'hsl(38 92% 50%)' },
  amazon: { id: 'amazon', name: 'Amazon', color: 'hsl(38 92% 50%)' },
  vueltaCole: { id: 'vuelta-al-cole', name: 'Vuelta al Cole', color: 'hsl(142 71% 45%)' },
  educacion: { id: 'educacion', name: 'Educación', color: 'hsl(217 91% 60%)' },
  diaMujer: { id: 'dia-de-la-mujer', name: 'Día de la Mujer', color: 'hsl(340 82% 52%)' },
  inspiracion: { id: 'inspiracion', name: 'Inspiración', color: 'hsl(262 83% 58%)' },
};

// ============================================
// EVENTOS SISTEMA - PRIORIDAD ALTA
// ============================================
export const SYSTEM_EVENTS: SystemEventTemplate[] = [
  // 1) BLACK FRIDAY - Prioridad ALTA
  {
    key: 'black_friday',
    name: 'Black Friday',
    description: 'Mayor pico anual de ventas. Activar descuentos, bundles, relanzamientos y campañas de Ads agresivas.',
    month: 11,
    day: null,
    dynamicRule: 'fourth_friday_november',
    category: 'comercial',
    defaultTags: [
      SYSTEM_TAGS.blackFriday,
      SYSTEM_TAGS.ventas,
      SYSTEM_TAGS.promocion,
      SYSTEM_TAGS.ads,
    ],
    defaultReminders: [
      { id: 'r1', offsetMinutes: 30240, channel: 'in_app', enabled: true }, // 21 días antes
      { id: 'r2', offsetMinutes: 10080, channel: 'in_app', enabled: true }, // 7 días antes
      { id: 'r3', offsetMinutes: 1440, channel: 'in_app', enabled: true },  // 1 día antes
    ],
    enabled: true,
    priorityLevel: 'high',
    campaignType: 'comercial',
    recommendedNiches: ['todos'],
    campaignWindowDays: 21,
  },

  // 2) CYBER MONDAY - Prioridad ALTA
  {
    key: 'cyber_monday',
    name: 'Cyber Monday',
    description: 'Extensión digital del Black Friday. Ideal para ebooks y campañas con ROAS optimizado.',
    month: 11,
    day: null,
    dynamicRule: 'monday_after_black_friday',
    category: 'comercial',
    defaultTags: [
      SYSTEM_TAGS.cyberMonday,
      SYSTEM_TAGS.ebook,
      SYSTEM_TAGS.ads,
    ],
    defaultReminders: [
      { id: 'r1', offsetMinutes: 20160, channel: 'in_app', enabled: true }, // 14 días antes
      { id: 'r2', offsetMinutes: 1440, channel: 'in_app', enabled: true },  // 1 día antes
    ],
    enabled: true,
    priorityLevel: 'high',
    campaignType: 'comercial',
    recommendedNiches: ['no ficción', 'ficción digital'],
    campaignWindowDays: 14,
  },

  // 3) NAVIDAD - Prioridad ALTA
  {
    key: 'christmas',
    name: 'Navidad',
    description: 'Campañas orientadas a regalo y packs. Alta intención emocional.',
    month: 12,
    day: 25,
    category: 'estacional',
    defaultTags: [
      SYSTEM_TAGS.navidad,
      SYSTEM_TAGS.regalos,
      SYSTEM_TAGS.temporadaAlta,
    ],
    defaultReminders: [
      { id: 'r1', offsetMinutes: 43200, channel: 'in_app', enabled: true }, // 30 días antes
      { id: 'r2', offsetMinutes: 20160, channel: 'in_app', enabled: true }, // 14 días antes
      { id: 'r3', offsetMinutes: 10080, channel: 'in_app', enabled: true }, // 7 días antes
    ],
    enabled: true,
    priorityLevel: 'high',
    campaignType: 'estacional',
    recommendedNiches: ['infantil', 'ficción', 'regalos', 'desarrollo personal'],
    campaignWindowDays: 30,
  },

  // 4) AÑO NUEVO - Prioridad ALTA
  {
    key: 'new_year',
    name: 'Año Nuevo',
    description: 'Pico de intención de cambio. Ideal para libros prácticos y de mejora personal.',
    month: 1,
    day: 1,
    category: 'estacional',
    defaultTags: [
      SYSTEM_TAGS.anoNuevo,
      SYSTEM_TAGS.habitos,
      SYSTEM_TAGS.objetivos,
    ],
    defaultReminders: [
      { id: 'r1', offsetMinutes: 30240, channel: 'in_app', enabled: true }, // 21 días antes
      { id: 'r2', offsetMinutes: 10080, channel: 'in_app', enabled: true }, // 7 días antes
    ],
    enabled: true,
    priorityLevel: 'high',
    campaignType: 'estacional',
    recommendedNiches: ['no ficción', 'hábitos', 'productividad', 'salud', 'fitness'],
    campaignWindowDays: 21,
  },

  // 5) SAN VALENTÍN - Prioridad ALTA
  {
    key: 'valentines_day',
    name: 'San Valentín',
    description: 'Fecha clave para romance y regalos emocionales.',
    month: 2,
    day: 14,
    category: 'estacional',
    defaultTags: [
      SYSTEM_TAGS.sanValentin,
      SYSTEM_TAGS.romance,
      SYSTEM_TAGS.parejas,
    ],
    defaultReminders: [
      { id: 'r1', offsetMinutes: 20160, channel: 'in_app', enabled: true }, // 14 días antes
      { id: 'r2', offsetMinutes: 4320, channel: 'in_app', enabled: true },  // 3 días antes
    ],
    enabled: true,
    priorityLevel: 'high',
    campaignType: 'estacional',
    recommendedNiches: ['romance', 'parejas', 'diarios', 'regalos'],
    campaignWindowDays: 14,
  },

  // 6) HALLOWEEN - Prioridad ALTA
  {
    key: 'halloween',
    name: 'Halloween',
    description: 'Alto engagement temático. Ideal para ficción oscura y campañas visuales.',
    month: 10,
    day: 31,
    category: 'estacional',
    defaultTags: [
      SYSTEM_TAGS.halloween,
      SYSTEM_TAGS.terror,
      SYSTEM_TAGS.fantasia,
    ],
    defaultReminders: [
      { id: 'r1', offsetMinutes: 20160, channel: 'in_app', enabled: true }, // 14 días antes
      { id: 'r2', offsetMinutes: 4320, channel: 'in_app', enabled: true },  // 3 días antes
    ],
    enabled: true,
    priorityLevel: 'high',
    campaignType: 'estacional',
    recommendedNiches: ['terror', 'fantasía oscura', 'infantil temático'],
    campaignWindowDays: 14,
  },

  // 7) DÍA INTERNACIONAL DEL LIBRO - Prioridad ALTA
  {
    key: 'world_book_day',
    name: 'Día Internacional del Libro',
    description: 'Campañas de visibilidad, relanzamientos suaves y posicionamiento de marca.',
    month: 4,
    day: 23,
    category: 'visibilidad',
    defaultTags: [
      SYSTEM_TAGS.diaLibro,
      SYSTEM_TAGS.branding,
      SYSTEM_TAGS.editorial,
    ],
    defaultReminders: [
      { id: 'r1', offsetMinutes: 10080, channel: 'in_app', enabled: true }, // 7 días antes
      { id: 'r2', offsetMinutes: 1440, channel: 'in_app', enabled: true },  // 1 día antes
    ],
    enabled: true,
    priorityLevel: 'high',
    campaignType: 'visibilidad',
    recommendedNiches: ['todos'],
    campaignWindowDays: 7,
  },

  // ============================================
  // EVENTOS SISTEMA - PRIORIDAD MEDIA
  // ============================================

  // 8) PRIME DAY (Amazon) - Prioridad MEDIA
  {
    key: 'prime_day',
    name: 'Prime Day (Amazon)',
    description: 'Evento de Amazon con impacto moderado. Útil si el libro ya tiene tracción.',
    month: 7,
    day: null,
    dynamicRule: 'second_tuesday_july',
    category: 'comercial',
    defaultTags: [
      SYSTEM_TAGS.primeDay,
      SYSTEM_TAGS.amazon,
      SYSTEM_TAGS.promocion,
    ],
    defaultReminders: [
      { id: 'r1', offsetMinutes: 14400, channel: 'in_app', enabled: true }, // 10 días antes
      { id: 'r2', offsetMinutes: 1440, channel: 'in_app', enabled: true },  // 1 día antes
    ],
    enabled: true,
    priorityLevel: 'medium',
    campaignType: 'comercial',
    recommendedNiches: ['todos'],
    campaignWindowDays: 10,
  },

  // 9) VUELTA AL COLE - Prioridad MEDIA
  {
    key: 'back_to_school',
    name: 'Vuelta al Cole',
    description: 'Buen momento para libros educativos y organización.',
    month: 8,
    day: null,
    dynamicRule: 'last_monday_august',
    category: 'estacional',
    defaultTags: [
      SYSTEM_TAGS.vueltaCole,
      SYSTEM_TAGS.educacion,
    ],
    defaultReminders: [
      { id: 'r1', offsetMinutes: 30240, channel: 'in_app', enabled: true }, // 21 días antes
      { id: 'r2', offsetMinutes: 10080, channel: 'in_app', enabled: true }, // 7 días antes
    ],
    enabled: true,
    priorityLevel: 'medium',
    campaignType: 'estacional',
    recommendedNiches: ['infantil', 'educación', 'planners', 'workbooks'],
    campaignWindowDays: 21,
  },

  // 10) DÍA INTERNACIONAL DE LA MUJER - Prioridad MEDIA
  {
    key: 'international_womens_day',
    name: 'Día Internacional de la Mujer',
    description: 'Campañas alineadas con empoderamiento y contenido social.',
    month: 3,
    day: 8,
    category: 'estacional',
    defaultTags: [
      SYSTEM_TAGS.diaMujer,
      SYSTEM_TAGS.inspiracion,
    ],
    defaultReminders: [
      { id: 'r1', offsetMinutes: 20160, channel: 'in_app', enabled: true }, // 14 días antes
      { id: 'r2', offsetMinutes: 4320, channel: 'in_app', enabled: true },  // 3 días antes
    ],
    enabled: true,
    priorityLevel: 'medium',
    campaignType: 'estacional',
    recommendedNiches: ['desarrollo personal', 'biografías', 'ensayo'],
    campaignWindowDays: 14,
  },
];

// ============================================
// CATEGORÍAS DE EVENTOS
// ============================================
export const EVENT_CATEGORIES = {
  comercial: { label: 'Comerciales', color: 'hsl(24 94% 59%)' },
  estacional: { label: 'Estacionales', color: 'hsl(262 83% 58%)' },
  visibilidad: { label: 'Visibilidad', color: 'hsl(217 91% 60%)' },
};

// ============================================
// NICHOS RECOMENDADOS - Catálogo
// ============================================
export const RECOMMENDED_NICHES = [
  'todos',
  'no ficción',
  'ficción',
  'ficción digital',
  'romance',
  'parejas',
  'diarios',
  'regalos',
  'terror',
  'fantasía oscura',
  'infantil',
  'infantil temático',
  'educación',
  'planners',
  'workbooks',
  'desarrollo personal',
  'biografías',
  'ensayo',
  'hábitos',
  'productividad',
  'salud',
  'fitness',
];

// ============================================
// CÁLCULO DE FECHAS DINÁMICAS
// ============================================
export function calculateDynamicDate(rule: string, year: number): Date | null {
  switch (rule) {
    // Black Friday: cuarto viernes de noviembre
    case 'fourth_friday_november': {
      const nov = new Date(year, 10, 1);
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

    // Cyber Monday: lunes posterior a Black Friday
    case 'monday_after_black_friday': {
      const blackFriday = calculateDynamicDate('fourth_friday_november', year);
      if (blackFriday) {
        const monday = new Date(blackFriday);
        monday.setDate(monday.getDate() + 3);
        return monday;
      }
      return null;
    }

    // Prime Day: segundo martes de julio (aproximado, varía cada año)
    case 'second_tuesday_july': {
      let tuesdayCount = 0;
      for (let d = 1; d <= 31; d++) {
        const date = new Date(year, 6, d);
        if (date.getDay() === 2) {
          tuesdayCount++;
          if (tuesdayCount === 2) return date;
        }
      }
      return null;
    }

    // Vuelta al Cole: último lunes de agosto
    case 'last_monday_august': {
      for (let d = 31; d >= 1; d--) {
        const date = new Date(year, 7, d);
        if (date.getDay() === 1) return date;
      }
      return null;
    }

    // Día de la Madre: primer domingo de mayo (España)
    case 'first_sunday_may': {
      for (let d = 1; d <= 7; d++) {
        const date = new Date(year, 4, d);
        if (date.getDay() === 0) return date;
      }
      return null;
    }

    // Día del Padre: tercer domingo de junio
    case 'third_sunday_june': {
      let sundayCount = 0;
      for (let d = 1; d <= 30; d++) {
        const date = new Date(year, 5, d);
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
