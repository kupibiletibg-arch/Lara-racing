'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

/**
 * "Купи ваучер" CTA on the open-track-day cards. Voucher checkout
 * isn't wired yet, so on click we surface a small "Очаквайте скоро"
 * pill next to the button — same UX vocabulary as the ContactForm
 * "sent" pill so the page doesn't introduce a new affordance.
 *
 * When voucher checkout ships we just swap the onClick body for a
 * `router.push('/checkout/...')` call and drop the pill.
 */
export function BuyVoucherButton() {
  const t = useTranslations('trackDays')
  const [shown, setShown] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => setShown(true)}
        className="inline-flex items-center gap-2 bg-brand hover:bg-brand-deep text-ink font-mono tracking-mono uppercase text-[11px] md:text-[12px] px-5 md:px-6 py-3 transition-colors"
      >
        {t('card.buy')} →
      </button>
      {shown && (
        <span className="font-mono tracking-mono uppercase text-[10px] md:text-[11px] text-data">
          {t('voucherSoon')}
        </span>
      )}
    </div>
  )
}
