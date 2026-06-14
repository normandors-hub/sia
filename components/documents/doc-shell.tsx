import type { ReactNode } from "react"
import { COMPANY } from "@/lib/company"

// Folha A4 para visualizacao e impressao dos documentos.
export function DocSheet({ children }: { children: ReactNode }) {
  return (
    <div className="doc-sheet mx-auto w-full max-w-[210mm] bg-white p-[14mm] text-[11px] leading-relaxed text-neutral-900 shadow-sm print:max-w-none print:p-0 print:shadow-none">
      {children}
    </div>
  )
}

export function DocHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-6 border-b-2 border-neutral-900 pb-4">
      <div className="max-w-[60%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={COMPANY.logo || "/placeholder.svg"}
          alt={COMPANY.legalName}
          className="mb-2 h-12 w-auto object-contain"
        />
        <p className="text-[10px] font-semibold leading-snug text-neutral-800">
          {COMPANY.legalName}
        </p>
        {COMPANY.addressLines.map((l) => (
          <p key={l} className="text-[9px] leading-snug text-neutral-600">
            {l}
          </p>
        ))}
        <p className="text-[9px] leading-snug text-neutral-600">
          CNPJ {COMPANY.cnpj} · IE {COMPANY.ie}
        </p>
      </div>
      <div className="text-right">
        <p className="text-base font-bold uppercase tracking-wide text-neutral-900">
          {title}
        </p>
        {subtitle ? (
          <p className="text-[10px] text-neutral-600">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}

export function DocSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="mb-4">
      <p className="mb-1 border-b border-neutral-300 pb-0.5 text-[9px] font-semibold uppercase tracking-wider text-neutral-500">
        {title}
      </p>
      <div className="text-[11px] text-neutral-800">{children}</div>
    </div>
  )
}

export function DocFooter({ text }: { text?: string }) {
  return (
    <div className="mt-8 border-t border-neutral-300 pt-3 text-center text-[9px] text-neutral-500">
      {text ??
        `${COMPANY.legalName} · ${COMPANY.website} · This document was generated electronically.`}
    </div>
  )
}
