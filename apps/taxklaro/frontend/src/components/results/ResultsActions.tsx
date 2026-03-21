import { Button } from '@/components/ui/button'
export function ResultsActions({ onDownloadPdf, onShareLink, onEditInputs }: { onDownloadPdf: () => void; onShareLink: () => void; onEditInputs?: () => void }) {
  return (
    <div className="flex gap-2 mt-6">
      <Button className="flex-1" onClick={onDownloadPdf}>Download PDF</Button>
      <Button className="flex-1" variant="outline" onClick={onShareLink}>Share Link</Button>
      {onEditInputs && <Button className="flex-1" variant="outline" onClick={onEditInputs}>Edit Inputs</Button>}
    </div>
  )
}
