export type Facility = {
  id: string // "01" … "14"
  labelBg: string
  labelEn: string
  // Position as a fraction of viewBox (0..1), approximated from the user's
  // reference image. These are hand-placed for v1 — easy to fine-tune later
  // by editing the x, y below while eyeballing the rendered SVG.
  x: number
  y: number
}

export const facilities: Facility[] = [
  { id: '01', labelBg: 'Главен вход & КПП', labelEn: 'Main entrance & checkpoint', x: 0.93, y: 0.74 },
  { id: '02', labelBg: 'Кафе, рецепция, магазин', labelEn: 'Café, reception, shop', x: 0.23, y: 0.66 },
  { id: '03', labelBg: 'Сграда с боксове', labelEn: 'Pit building', x: 0.40, y: 0.68 },
  { id: '04', labelBg: 'Система за контрол & офиси', labelEn: 'Race control & offices', x: 0.46, y: 0.72 },
  { id: '05', labelBg: 'Ресторант', labelEn: 'Restaurant', x: 0.52, y: 0.70 },
  { id: '06', labelBg: 'Медицински център', labelEn: 'Medical centre', x: 0.57, y: 0.66 },
  { id: '07', labelBg: 'Хеликоптерна площадка', labelEn: 'Helipad', x: 0.62, y: 0.66 },
  { id: '08', labelBg: 'Падок', labelEn: 'Paddock', x: 0.46, y: 0.66 },
  { id: '09', labelBg: 'Зона за зрители / паркинг', labelEn: 'Spectator / parking', x: 0.32, y: 0.63 },
  { id: '10', labelBg: 'Зона за тренировки', labelEn: 'Training area', x: 0.34, y: 0.72 },
  { id: '11', labelBg: 'Хеликоптерна площадка', labelEn: 'Helipad (secondary)', x: 0.68, y: 0.66 },
  { id: '12', labelBg: 'Зона за зрители / паркинг', labelEn: 'Spectator / parking', x: 0.82, y: 0.60 },
  { id: '13', labelBg: 'Зона за разделяне на пистата', labelEn: 'Track-split junction A', x: 0.47, y: 0.54 },
  { id: '14', labelBg: 'Зона за разделяне на пистата', labelEn: 'Track-split junction B', x: 0.42, y: 0.52 },
]
