export type Facility = {
  id: string // "01" … "14"
  labelBg: string
  labelEn: string
}

// Labels taken verbatim from the client-supplied facility map schema
// (public/facilities/map.jpg). IDs 09, 12, 13 and 14 intentionally repeat
// categories because the map has multiple pins for those same POI types.
export const facilities: Facility[] = [
  { id: '01', labelBg: 'Главен вход & контролно-пропускателна зона', labelEn: 'Main entrance & checkpoint' },
  { id: '02', labelBg: 'Кафе, рецепция, магазин',                   labelEn: 'Café, reception, shop' },
  { id: '03', labelBg: 'Падок',                                     labelEn: 'Paddock' },
  { id: '04', labelBg: 'Система за контрол & офиси',                labelEn: 'Race control & offices' },
  { id: '05', labelBg: 'Сграда с боксове',                          labelEn: 'Pit building' },
  { id: '06', labelBg: 'Ресторант',                                 labelEn: 'Restaurant' },
  { id: '07', labelBg: 'Медицински център',                         labelEn: 'Medical centre' },
  { id: '08', labelBg: 'Гаражи & сервиз',                           labelEn: 'Garages & service' },
  { id: '09', labelBg: 'Паркинг',                                   labelEn: 'Parking' },
  { id: '10', labelBg: 'Зона за тренировки',                        labelEn: 'Training area' },
  { id: '11', labelBg: 'Хеликоптерна площадка',                     labelEn: 'Helipad' },
  { id: '12', labelBg: 'Зона за зрители',                           labelEn: 'Spectator area' },
  { id: '13', labelBg: 'Зона за разделяне на пистата',              labelEn: 'Track-split zone' },
  { id: '14', labelBg: 'Зона за разделяне на пистата',              labelEn: 'Track-split zone' },
]
