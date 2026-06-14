import type { ReactNode } from "react"

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
    <div className="mb-6 flex items-start justify-between border-b-2 border-neutral-900 pb-4">
      <div>
        <p className="text-lg font-bold tracking-tight text-neutral-900">
          SENBRA EXPORT
        </p>
        <p className="text-[10px] leading-snug text-neutral-600">
          International Trade &amp; Export
          <br />
          Paranaguá - PR, Brazil
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
        "SENBRA EXPORT · International Trade · This document was generated electronically."}
    </div>
  )
}
