"use client"

import { importPoFromPdf, type ParsedPo } from "@/app/actions/import-po"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileUp, Loader2, Upload } from "lucide-react"
import { useRef, useState, useTransition } from "react"
import { toast } from "sonner"

export function PoImportDialog({
  onParsed,
}: {
  onParsed: (data: ParsedPo) => void
}) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    const f = files?.[0]
    if (!f) return
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Selecione um arquivo PDF.")
      return
    }
    setFile(f)
  }

  function handleImport() {
    if (!file) {
      toast.error("Selecione um PDF primeiro.")
      return
    }
    const fd = new FormData()
    fd.append("file", file)
    startTransition(async () => {
      const res = await importPoFromPdf(fd)
      if (res.ok && res.data) {
        onParsed(res.data)
        toast.success("PO importado. Revise os dados antes de salvar.")
        setOpen(false)
        setFile(null)
      } else {
        toast.error(res.error ?? "Falha ao importar o PDF.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <FileUp className="h-4 w-4" />
            Importar de PDF
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar PO de PDF</DialogTitle>
          <DialogDescription>
            Envie o PDF do pedido recebido por e-mail. Os dados serão extraídos
            automaticamente e preenchidos no formulário para revisão.
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            handleFiles(e.dataTransfer.files)
          }}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-10 text-center transition-colors hover:bg-muted/70"
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {file ? file.name : "Clique ou arraste o PDF aqui"}
          </span>
          <span className="text-xs text-muted-foreground">
            Somente arquivos PDF
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={pending || !file}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Importar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
