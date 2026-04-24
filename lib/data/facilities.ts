export type Facility = {
  id: string // "01" … "14"
  labelBg: string
  labelEn: string
  // POI position as a fraction of the overlay viewBox (0..1).
  // Hand-placed to match the client-supplied facility schema —
  // bottom of the frame = pit straight, top = infield / outer parking.
  x: number
  y: number
}

// Labels and pin numbers come from the client-supplied
// "Схема съоръжения А1 мотор парк.png" reference (April 2026).
// Some categories (Parking, Spectator area) appear as repeated pins
// on the schema — we surface one representative position per id and
// keep a single canonical label.
export const facilities: Facility[] = [
  { id: '01', labelBg: 'Главен вход & контролно-пропускателна зона', labelEn: 'Main entrance & checkpoint',    x: 0.95, y: 0.72 },
  { id: '02', labelBg: 'Кафе, рецепция, магазин',                   labelEn: 'Café, reception, shop',          x: 0.26, y: 0.70 },
  { id: '03', labelBg: 'Сграда с боксове',                          labelEn: 'Pit building',                   x: 0.40, y: 0.70 },
  { id: '04', labelBg: 'Система за контрол & офиси',                labelEn: 'Race control & offices',         x: 0.61, y: 0.70 },
  { id: '05', labelBg: 'Ресторант',                                 labelEn: 'Restaurant',                     x: 0.48, y: 0.71 },
  { id: '06', labelBg: 'Медицински център',                         labelEn: 'Medical centre',                 x: 0.52, y: 0.71 },
  { id: '07', labelBg: 'Гаражи & сервиз',                           labelEn: 'Garages & service',              x: 0.55, y: 0.40 },
  { id: '08', labelBg: 'Падок',                                     labelEn: 'Paddock',                        x: 0.44, y: 0.70 },
  { id: '09', labelBg: 'Паркинг',                                   labelEn: 'Parking',                        x: 0.70, y: 0.70 },
  { id: '10', labelBg: 'Зона за тренировки',                        labelEn: 'Training area',                  x: 0.36, y: 0.70 },
  { id: '11', labelBg: 'Хеликоптерна площадка',                     labelEn: 'Helipad',                        x: 0.57, y: 0.71 },
  { id: '12', labelBg: 'Зона за зрители',                           labelEn: 'Spectator area',                 x: 0.31, y: 0.70 },
  { id: '13', labelBg: 'Зона за разделяне на пистата',              labelEn: 'Track-split zone',               x: 0.42, y: 0.38 },
  { id: '14', labelBg: 'Зона за разделяне на пистата',              labelEn: 'Track-split zone',               x: 0.55, y: 0.35 },
]
