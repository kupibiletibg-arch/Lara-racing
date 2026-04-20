type Session = { label: string; time: string }

export function SessionTimes({ sessions }: { sessions?: Session[] }) {
  if (!sessions?.length) return null
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono tracking-mono text-[11px]">
      {sessions.map(s => (
        <div key={s.label} className="contents">
          <dt className="uppercase text-ink/50">{s.label}</dt>
          <dd className="text-ink/80 text-right">{s.time}</dd>
        </div>
      ))}
    </dl>
  )
}
