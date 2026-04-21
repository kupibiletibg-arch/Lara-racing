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

// Labels and pin numbers taken from the reference schema. Several categories
// (Parking, Spectator area, Track-split zone) appear at multiple physical
// locations on the map; we surface one representative pin per id.
export const facilities: Facility[] = [
  { id: '01', labelBg: 'Главен вход & контролно-пропускателна зона', labelEn: 'Main entrance & checkpoint',  x: 0.95, y: 0.72 },
  { id: '02', labelBg: 'Кафе, рецепция, магазин',                   labelEn: 'Café, reception, shop',        x: 0.33, y: 0.70 },
  { id: '03', labelBg: 'Падок',                                     labelEn: 'Paddock',                       x: 0.38, y: 0.71 },
  { id: '04', labelBg: 'Система за контрол & офиси',                labelEn: 'Race control & offices',        x: 0.50, y: 0.71 },
  { id: '05', labelBg: 'Сграда с боксове',                          labelEn: 'Pit building',                  x: 0.44, y: 0.73 },
  { id: '06', labelBg: 'Ресторант',                                 labelEn: 'Restaurant',                    x: 0.64, y: 0.72 },
  { id: '07', labelBg: 'Медицински център',                         labelEn: 'Medical centre',                x: 0.68, y: 0.73 },
  { id: '08', labelBg: 'Гаражи & сервиз',                           labelEn: 'Garages & service',             x: 0.48, y: 0.55 },
  { id: '09', labelBg: 'Паркинг',                                   labelEn: 'Parking',                       x: 0.51, y: 0.12 },
  { id: '10', labelBg: 'Зона за тренировки',                        labelEn: 'Training area',                 x: 0.36, y: 0.70 },
  { id: '11', labelBg: 'Хеликоптерна площадка',                     labelEn: 'Helipad',                       x: 0.73, y: 0.72 },
  { id: '12', labelBg: 'Зона за зрители',                           labelEn: 'Spectator area',                x: 0.81, y: 0.62 },
  { id: '13', labelBg: 'Зона за разделяне на пистата',              labelEn: 'Track-split zone',              x: 0.50, y: 0.60 },
  { id: '14', labelBg: 'Зона за разделяне на пистата',              labelEn: 'Track-split zone',              x: 0.46, y: 0.58 },
]
