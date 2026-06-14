import { useState, useEffect } from 'react'
import { useTranslation } from '../../i18n'
import { useConfig, useUpdateConfig } from '../../hooks/useConfig'
import { getOllamaModels } from '../../api/config'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { SimpleSelect } from '../ui/select'

const EMBEDDING_MODELS = [
  'all-MiniLM-L6-v2',
  'BAAI/bge-small-en-v1.5',
  'all-mpnet-base-v2',
  'paraphrase-multilingual-MiniLM-L12-v2',
  'intfloat/multilingual-e5-small',
  'paraphrase-multilingual-mpnet-base-v2',
]

export default function LocalSettings() {
  const { t } = useTranslation()
  const { data: config } = useConfig()
  const update = useUpdateConfig()
  const [models, setModels] = useState<string[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [ollamaHost, setOllamaHost] = useState('')

  useEffect(() => {
    if (config) setOllamaHost(config.ollama_host ?? '')
  }, [config])

  const fetchModels = async () => {
    setLoadingModels(true)
    try {
      const m = await getOllamaModels()
      setModels(m)
    } catch {
      setModels([])
    } finally {
      setLoadingModels(false)
    }
  }

  if (!config) return null

  return (
    <div className="flex flex-col gap-5">
      {/* Ollama host */}
      <div>
        <Label>{t('local.host')}</Label>
        <div className="flex gap-2">
          <Input
            value={ollamaHost}
            onChange={(e) => setOllamaHost(e.target.value)}
            className="flex-1 w-auto font-mono text-[13px]"
          />
          <Button
            variant="outline"
            className="shrink-0"
            onClick={() => update.mutate({ ollama_host: ollamaHost })}
          >
            {t('common.save')}
          </Button>
        </div>
      </div>

      {/* Model */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="mb-0">{t('local.activeModel')}</Label>
          <Button
            variant="ghost"
            size="sm"
            disabled={loadingModels}
            onClick={fetchModels}
            className="font-mono text-[11px] px-0 h-auto"
          >
            {loadingModels ? t('common.loading') : t('local.refresh')}
          </Button>
        </div>

        {models.length > 0 ? (
          <SimpleSelect
            value={config.ollama_model ?? ''}
            onValueChange={(val) => update.mutate({ ollama_model: val })}
            options={models.map((m) => ({ value: m }))}
          />
        ) : (
          <Input
            value={config.ollama_model ?? ''}
            onChange={(e) => update.mutate({ ollama_model: e.target.value })}
            placeholder="llama3.2"
            className="font-mono text-[13px]"
          />
        )}
        <p className="mt-1.5 text-[11px] font-mono text-text-dim">
          {t('local.modelHint')}
        </p>
      </div>

      {/* Embedding model */}
      <div>
        <Label>{t('local.embedding')}</Label>
        <SimpleSelect
          value={config.embedding_model ?? 'all-MiniLM-L6-v2'}
          onValueChange={(val) => update.mutate({ embedding_model: val })}
          options={(EMBEDDING_MODELS.includes(config.embedding_model ?? '')
            ? EMBEDDING_MODELS
            : [config.embedding_model ?? 'all-MiniLM-L6-v2', ...EMBEDDING_MODELS]
          ).map((m) => ({ value: m }))}
        />
        <p className="mt-1.5 text-[11px] font-mono text-text-dim">
          {t('local.embeddingHint')}
        </p>
      </div>
    </div>
  )
}
