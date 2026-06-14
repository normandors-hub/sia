"use client"

import {
  createBank,
  deleteBank,
  updateBank,
  type BankInput,
} from "@/app/actions/banks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Bank } from "@/lib/db/schema"
import { Pencil, Plus, Star, Trash2 } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

const EMPTY: BankInput = {
  label: "",
  broker: "",
  beneficiaryBank: "",
  bankCity: "",
  swift: "",
  agency: "",
  beneficiaryName: "",
  accountIban: "",
  intermediaryBank: "",
  intermediarySwift: "",
  isDefault: false,
  notes: "",
}

export function BanksManager({ banks }: { banks: Bank[] }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Bank | null>(null)
  const [form, setForm] = useState<BankInput>(EMPTY)
  const [pending, startTransition] = useTransition()

  function openNew() {
    setEditing(null)
    setForm(EMPTY)
    setOpen(true)
  }

  function openEdit(b: Bank) {
    setEditing(b)
    setForm({
      label: b.label,
      broker: b.broker ?? "",
      beneficiaryBank: b.beneficiaryBank ?? "",
      bankCity: b.bankCity ?? "",
      swift: b.swift ?? "",
      agency: b.agency ?? "",
      beneficiaryName: b.beneficiaryName ?? "",
      accountIban: b.accountIban ?? "",
      intermediaryBank: b.intermediaryBank ?? "",
      intermediarySwift: b.intermediarySwift ?? "",
      isDefault: b.isDefault,
      notes: b.notes ?? "",
    })
    setOpen(true)
  }

  function save() {
    if (!form.label.trim()) {
      toast.error("Informe um nome/identificação para o banco.")
      return
    }
    startTransition(async () => {
      const res = editing
        ? await updateBank(editing.id, form)
        : await createBank(form)
      if (res.ok) {
        toast.success(editing ? "Banco atualizado." : "Banco cadastrado.")
        setOpen(false)
      } else {
        toast.error("Erro ao salvar o banco.")
      }
    })
  }

  function remove(b: Bank) {
    startTransition(async () => {
      await deleteBank(b.id)
      toast.success("Banco removido.")
    })
  }

  function set<K extends keyof BankInput>(key: K, value: BankInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Novo banco
        </Button>
      </div>

      {banks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum canal bancário cadastrado. Clique em &quot;Novo banco&quot; para
            adicionar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {banks.map((b) => (
            <Card key={b.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {b.label}
                    {b.isDefault ? (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3" /> Padrão
                      </Badge>
                    ) : null}
                  </CardTitle>
                  {b.broker ? (
                    <p className="mt-1 text-xs text-muted-foreground">{b.broker}</p>
                  ) : null}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(b)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(b)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
                <Info label="Beneficiary Bank" value={b.beneficiaryBank} />
                <Info label="SWIFT" value={b.swift} />
                <Info label="Agency" value={b.agency} />
                <Info label="Account / IBAN" value={b.accountIban} />
                <Info label="Beneficiary" value={b.beneficiaryName} />
                <Info label="Intermediary" value={b.intermediaryBank} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar banco" : "Novo banco"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BField label="Identificação *" value={form.label} onChange={(v) => set("label", v)} placeholder="Dourada / Banco Rendimento" />
            <BField label="Câmbio / Corretora" value={form.broker ?? ""} onChange={(v) => set("broker", v)} placeholder="Dourada Corretora de Câmbio" />
            <BField label="Beneficiary Bank" value={form.beneficiaryBank ?? ""} onChange={(v) => set("beneficiaryBank", v)} placeholder="Banco Rendimento S/A" />
            <BField label="Bank City" value={form.bankCity ?? ""} onChange={(v) => set("bankCity", v)} placeholder="São Paulo - BR" />
            <BField label="SWIFT" value={form.swift ?? ""} onChange={(v) => set("swift", v)} placeholder="RENDBRSP" />
            <BField label="Agency" value={form.agency ?? ""} onChange={(v) => set("agency", v)} placeholder="633" />
            <BField label="Beneficiary Name" value={form.beneficiaryName ?? ""} onChange={(v) => set("beneficiaryName", v)} className="sm:col-span-2" />
            <BField label="Account / IBAN" value={form.accountIban ?? ""} onChange={(v) => set("accountIban", v)} className="sm:col-span-2" />
            <BField label="Intermediary Bank" value={form.intermediaryBank ?? ""} onChange={(v) => set("intermediaryBank", v)} placeholder="Bank of America / Nova York" />
            <BField label="Intermediary SWIFT" value={form.intermediarySwift ?? ""} onChange={(v) => set("intermediarySwift", v)} placeholder="BOFAUS3N" />
          </div>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault ?? false}
              onChange={(e) => set("isDefault", e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            Definir como banco padrão para novos POs
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <p>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium">{value}</span>
    </p>
  )
}

function BField({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}
