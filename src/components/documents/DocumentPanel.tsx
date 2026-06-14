import { useRef, useState, useEffect, useCallback } from 'react'
import { useTranslation } from '../../i18n'
import { useDocuments, useUploadDocument, useDeleteDocument } from '../../hooks/useDocuments'
import { api } from '../../api/client'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { cn } from '../../lib/utils'

interface Props { projectId: number }

type Tab = 'docs' | 'files'

interface GeneratedFile { filename: string; size: number }

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf')                 return '📄'
  if (ext === 'xlsx' || ext === 'csv') return '📊'
  if (ext === 'docx' || ext === 'doc') return '📝'
  if (ext === 'pptx')               return '📊'
  if (ext === 'md')                  return '📋'
  return '📃'
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fmtTokens(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k tk` : `${n} tk`
}

interface PendingDelete { id: number; filename: string }
interface PendingDeleteFile { filename: string }

export default function DocumentPanel({ projectId }: Props) {
  const { t } = useTranslation()
  const { data: docs = [], isLoading } = useDocuments(projectId)
  const upload = useUploadDocument(projectId)
  const remove = useDeleteDocument(projectId)
  const inputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<Tab>('docs')
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)
  const [pendingDeleteFile, setPendingDeleteFile] = useState<PendingDeleteFile | null>(null)
  const [deletingFile, setDeletingFile] = useState<string | null>(null)

  // Load generated files from backend (persisted on disk)
  const fetchFiles = useCallback(async () => {
    setLoadingFiles(true)
    try {
      const res = await api.get<GeneratedFile[]>('/files')
      setGeneratedFiles(res.data)
    } catch {
      // silently ignore
    } finally {
      setLoadingFiles(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  // When agent generates a new file: switch to files tab + refresh list
  useEffect(() => {
    const handler = (e: Event) => {
      setTab('files')
      fetchFiles()
    }
    window.addEventListener('briefscope:file_ready', handler)
    return () => window.removeEventListener('briefscope:file_ready', handler)
  }, [fetchFiles])

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((f) => upload.mutate(f))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setPendingDelete(null)
    setDeletingId(pendingDelete.id)
    try {
      await remove.mutateAsync(pendingDelete.id)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownload = (filename: string) => {
    const base = api.defaults.baseURL ?? ''
    const a = document.createElement('a')
    a.href = `${base}/files/${encodeURIComponent(filename)}`
    a.download = filename
    a.click()
  }

  const confirmDeleteFile = async () => {
    if (!pendingDeleteFile) return
    const { filename } = pendingDeleteFile
    setPendingDeleteFile(null)
    setDeletingFile(filename)
    try {
      await api.delete(`/files/${encodeURIComponent(filename)}`)
      setGeneratedFiles(prev => prev.filter(f => f.filename !== filename))
    } catch {
      // silently ignore
    } finally {
      setDeletingFile(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-card)', width: 280, minWidth: 280 }}>
      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="flex px-4" style={{ borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        {(['docs', 'files'] as Tab[]).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={cn(
              'flex-1 py-2 text-[11px] font-mono tracking-[0.04em] border-b-2 transition-colors',
              tab === tabKey
                ? 'border-text text-text'
                : 'border-transparent text-text-dim hover:text-text-muted',
            )}
            style={{ background: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
          >
            {tabKey === 'docs'
              ? `${t('docs.tabDocs')}${docs.length > 0 ? ` (${docs.length})` : ''}`
              : `${t('docs.tabFiles')}${generatedFiles.length > 0 ? ` (${generatedFiles.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* ── Documents tab ────────────────────────────────────────── */}
      {tab === 'docs' && (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !upload.isPending && inputRef.current?.click()}
            className={cn(
              'm-3 mb-1.5 border border-dashed border-border rounded-sm px-3 py-2.5',
              'text-[12px] text-text-dim text-center flex items-center justify-center gap-1.5',
              'transition-colors',
              !upload.isPending && 'cursor-pointer hover:border-accent hover:text-text-muted',
              upload.isPending && 'cursor-wait',
            )}
          >
            {upload.isPending ? (
              <>
                <span className="animate-spin-queai inline-block text-[13px]">⟳</span>
                <span>{t('docs.uploading')}</span>
              </>
            ) : (
              t('docs.dropOrClick')
            )}
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.txt,.md,.docx,.xlsx,.csv"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          <ul className="flex-1 overflow-y-auto px-2 pb-2 m-0 list-none">
            {isLoading && <li className="text-[12px] text-text-dim px-2 py-2.5">{t('common.loading')}</li>}
            {!isLoading && docs.length === 0 && (
              <li className="text-[12px] text-text-dim text-center px-2 py-6">
                {t('docs.empty')}<br />
                <span className="opacity-60">{t('docs.emptyHint')}</span>
              </li>
            )}
            {docs.map((doc) => {
              const isDeleting = deletingId === doc.id
              return (
                <li
                  key={doc.id}
                  className={cn(
                    'group flex items-center gap-2 px-2 py-2 rounded-[8px] transition-colors',
                    !isDeleting && 'hover:bg-surface',
                    isDeleting && 'opacity-50',
                  )}
                >
                  <span className="text-[17px] shrink-0">{fileIcon(doc.filename)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] text-text truncate" title={doc.filename}>{doc.filename}</p>
                    <p className="text-[10.5px] font-mono text-text-dim mt-px">{fmtTokens(doc.token_count)}</p>
                  </div>
                  {isDeleting ? (
                    <span className="animate-spin-queai text-[13px] text-text-dim shrink-0">⟳</span>
                  ) : (
                    <Button
                      variant="danger"
                      size="icon"
                      className="h-6 w-6 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => setPendingDelete({ id: doc.id, filename: doc.filename })}
                      title={t('docs.deleteDocTitle')}
                    >✕</Button>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}

      {/* ── Generated files tab ──────────────────────────────────── */}
      {tab === 'files' && (
        <div className="flex-1 overflow-y-auto p-2">
          {loadingFiles && (
            <p className="text-[12px] text-text-dim text-center px-2 py-4">{t('docs.loadingFiles')}</p>
          )}
          {!loadingFiles && generatedFiles.length === 0 && (
            <p className="text-[12px] text-text-dim text-center px-2 py-6">
              {t('docs.generatedEmpty').split('\n').map((line, i) => (
                <span key={i}>{i > 0 && <br />}{line}</span>
              ))}
            </p>
          )}
          {generatedFiles.map((file) => {
            const ext = file.filename.split('.').pop()?.toLowerCase() ?? ''
            const isDeleting = deletingFile === file.filename
            return (
              <div
                key={file.filename}
                className={cn(
                  'group flex items-center gap-2.5 px-2 py-2 rounded-[8px] transition-colors',
                  !isDeleting && 'hover:bg-surface',
                  isDeleting && 'opacity-50',
                )}
              >
                <span
                  className="text-[17px] shrink-0 cursor-pointer"
                  onClick={() => !isDeleting && handleDownload(file.filename)}
                >{fileIcon(file.filename)}</span>
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => !isDeleting && handleDownload(file.filename)}
                  title={t('docs.download', { name: file.filename })}
                >
                  <p className="text-[12.5px] text-text truncate" title={file.filename}>{file.filename}</p>
                  <p className="text-[10.5px] font-mono text-text-dim mt-px">
                    {ext.toUpperCase()} · {fmtSize(file.size)}
                  </p>
                </div>
                {isDeleting ? (
                  <span className="animate-spin-queai text-[13px] text-text-dim shrink-0">⟳</span>
                ) : (
                  <Button
                    variant="danger"
                    size="icon"
                    className="h-6 w-6 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => setPendingDeleteFile({ filename: file.filename })}
                    title={t('docs.deleteFileTitle')}
                  >✕</Button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Delete generated file dialog ─────────────────────────── */}
      <Dialog open={!!pendingDeleteFile} onOpenChange={(open) => { if (!open) setPendingDeleteFile(null) }}>
        <DialogContent showClose={false}>
          <DialogHeader><DialogTitle>{t('docs.deleteFileTitle')}</DialogTitle></DialogHeader>
          <p className="text-[13px] text-text-dim leading-relaxed">
            {t('docs.deleteConfirm', { name: `"${pendingDeleteFile?.filename ?? ''}"` })}
            {' '}{t('docs.deleteWarning')}
          </p>
          <DialogFooter className="mt-5">
            <Button variant="outline" className="flex-1" onClick={() => setPendingDeleteFile(null)}>{t('common.cancel')}</Button>
            <Button variant="destructive" className="flex-1" onClick={confirmDeleteFile}>{t('common.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete document confirmation dialog ──────────────────── */}
      <Dialog open={!!pendingDelete} onOpenChange={(open) => { if (!open) setPendingDelete(null) }}>
        <DialogContent showClose={false}>
          <DialogHeader><DialogTitle>{t('docs.deleteDocTitle')}</DialogTitle></DialogHeader>
          <p className="text-[13px] text-text-dim leading-relaxed">
            {t('docs.deleteConfirm', { name: `"${pendingDelete?.filename ?? ''}"` })}
            {' '}{t('docs.deleteWarning')}
          </p>
          <DialogFooter className="mt-5">
            <Button variant="outline" className="flex-1" onClick={() => setPendingDelete(null)}>{t('common.cancel')}</Button>
            <Button variant="destructive" className="flex-1" onClick={confirmDelete} disabled={deletingId !== null}>{t('common.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
