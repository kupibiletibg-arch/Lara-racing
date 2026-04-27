'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

const RECIPIENT = 'info@a1motorpark.com'

/**
 * Contact form on /contact. The site doesn't ship a backend mailer, so
 * a successful submit hands the prefilled message off to the visitor's
 * default mail client via a `mailto:` URL — honest UX, no fake-spinner
 * theatre. Once we wire up an SMTP route this component just swaps the
 * `window.location.href = mailto…` line for a `fetch('/api/contact')`.
 */
export function ContactForm() {
  const t = useTranslations('contact')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return
    const subject = encodeURIComponent(t('formSubject'))
    const body = encodeURIComponent(
      `${name}\n${email}\n\n${message}`,
    )
    window.location.href = `mailto:${RECIPIENT}?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-4 max-w-lg" noValidate>
      <Field label={t('formName')} required>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          className="w-full bg-transparent border-b rule pb-2 text-[15px] text-ink placeholder-ink/30 focus:outline-none focus:border-brand transition-colors"
        />
      </Field>
      <Field label={t('formEmail')} required>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full bg-transparent border-b rule pb-2 text-[15px] text-ink placeholder-ink/30 focus:outline-none focus:border-brand transition-colors"
        />
      </Field>
      <Field label={t('formMessage')} required>
        <textarea
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          className="w-full bg-transparent border-b rule pb-2 text-[15px] text-ink placeholder-ink/30 focus:outline-none focus:border-brand transition-colors resize-y"
        />
      </Field>

      <div className="mt-2 flex items-center gap-4">
        <button
          type="submit"
          className="inline-flex items-center justify-center bg-brand hover:bg-brand-deep text-ink font-mono tracking-mono uppercase text-[11px] md:text-[12px] px-5 md:px-6 py-3 transition-colors"
        >
          {t('formSubmit')} →
        </button>
        {sent && (
          <p className="font-mono tracking-mono uppercase text-[10px] md:text-[11px] text-data">
            {t('formSuccess')}
          </p>
        )}
      </div>
    </form>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="telemetry mb-1 block">
        {label}
        {required && <span aria-hidden className="text-brand"> *</span>}
      </span>
      {children}
    </label>
  )
}
