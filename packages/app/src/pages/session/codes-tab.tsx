import { createEffect, createSignal, For, Match, onMount, Show, Switch } from "solid-js"
import { useSDK } from "@/context/sdk"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { DialogPathPicker } from "@/components/dialog-new-research-project"

interface CodeRow {
  code_id: string
  research_project_id: string
  code_name: string
  article_id: string | null
  time_created: number
  time_updated: number
}

interface ArticleOption {
  article_id: string
  filename: string
  title: string | null
}

export function CodesTab(props: { researchProjectId: string }) {
  const sdk = useSDK()
  const dialog = useDialog()
  const [codes, setCodes] = createSignal<CodeRow[]>([])
  const [articles, setArticles] = createSignal<ArticleOption[]>([])
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal(false)
  const [adding, setAdding] = createSignal(false)
  const [creating, setCreating] = createSignal(false)
  const [createError, setCreateError] = createSignal("")

  // Form fields
  const [formCodeName, setFormCodeName] = createSignal("")
  const [formSource, setFormSource] = createSignal("")
  const [formArticleId, setFormArticleId] = createSignal("")

  const fetchCodes = async () => {
    try {
      setLoading(true)
      setError(false)
      const res = await sdk.client.research.code.list({ researchProjectId: props.researchProjectId })
      if (res.data) {
        setCodes(res.data as CodeRow[])
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const fetchArticles = async () => {
    try {
      const res = await sdk.client.research.article.list({ researchProjectId: props.researchProjectId })
      if (res.data) {
        setArticles(res.data as ArticleOption[])
      }
    } catch {
      // ignore — dropdown will just be empty
    }
  }

  const articleNameMap = () => {
    const map = new Map<string, string>()
    for (const a of articles()) {
      map.set(a.article_id, a.title || a.filename)
    }
    return map
  }

  createEffect(() => {
    const projectId = props.researchProjectId
    fetchCodes()
    fetchArticles()
  })

  const handleDelete = async (codeId: string) => {
    await sdk.client.research.code.delete({ codeId })
    setCodes((prev) => prev.filter((c) => c.code_id !== codeId))
  }

  const handleAdd = async () => {
    if (!formCodeName().trim() || !formSource().trim()) return

    try {
      setCreating(true)
      setCreateError("")
      const res = await sdk.client.research.code.create({
        researchProjectId: props.researchProjectId,
        codeName: formCodeName().trim(),
        source: formSource().trim(),
        ...(formArticleId() ? { articleId: formArticleId() } : {}),
      })
      if (res.data) {
        await fetchCodes()
      }
      resetForm()
      setAdding(false)
    } catch (e: any) {
      const msg = e?.message || "Failed to create code"
      setCreateError(msg)
    } finally {
      setCreating(false)
    }
  }

  const resetForm = () => {
    setFormCodeName("")
    setFormSource("")
    setFormArticleId("")
    setCreateError("")
  }

  const openDirPicker = () => {
    dialog.show(() => (
      <DialogPathPicker
        title="Select Code Directory"
        mode="directories"
        onSelect={(v) => {
          const selected = Array.isArray(v) ? v[0] : v
          if (selected) setFormSource(selected)
          dialog.close()
        }}
        onClose={() => dialog.close()}
      />
    ))
  }

  return (
    <div class="relative flex-1 min-h-0 overflow-hidden h-full flex flex-col">
      <div class="px-3 pt-3 pb-1 flex items-center justify-between">
        <div class="text-12-semibold text-text-weak uppercase tracking-wider">Codes</div>
        <button
          class="px-2 py-1 rounded text-11-regular bg-background-stronger text-text-base hover:text-text-strong transition-colors"
          onClick={() => {
            setAdding(!adding())
            if (!adding()) resetForm()
          }}
        >
          {adding() ? "Cancel" : "+ Add"}
        </button>
      </div>

      <div class="flex-1 min-h-0 overflow-auto px-3 pb-3">
        {/* Add form */}
        <Show when={adding()}>
          <div class="rounded-md border border-border-weak-base bg-background-base p-3 mb-2 flex flex-col gap-2">
            <input
              type="text"
              placeholder="Code Name (e.g. my-repo)"
              value={formCodeName()}
              onInput={(e) => setFormCodeName(e.currentTarget.value)}
              class="rounded border border-border-weak-base bg-background-stronger px-2 py-1 text-12-regular text-text-base outline-none focus:border-border-base"
            />
            <div class="flex gap-2">
              <input
                type="text"
                placeholder="GitHub URL or local path"
                value={formSource()}
                onInput={(e) => setFormSource(e.currentTarget.value)}
                class="flex-1 rounded border border-border-weak-base bg-background-stronger px-2 py-1 text-12-regular text-text-base outline-none focus:border-border-base"
              />
              <button
                type="button"
                class="shrink-0 px-2 py-1 rounded text-11-regular bg-background-stronger text-text-base hover:text-text-strong transition-colors border border-border-weak-base"
                onClick={openDirPicker}
              >
                Browse
              </button>
            </div>
            <select
              value={formArticleId()}
              onChange={(e) => setFormArticleId(e.currentTarget.value)}
              class="rounded border border-border-weak-base bg-background-stronger px-2 py-1 text-12-regular text-text-base outline-none focus:border-border-base"
            >
              <option value="">No linked article</option>
              <For each={articles()}>
                {(article) => <option value={article.article_id}>{article.title || article.filename}</option>}
              </For>
            </select>
            <Show when={createError()}>
              <div class="text-11-regular text-icon-critical-base">{createError()}</div>
            </Show>
            <button
              class="self-end px-3 py-1 rounded text-12-regular bg-background-stronger text-text-base hover:text-text-strong transition-colors disabled:opacity-50"
              onClick={handleAdd}
              disabled={creating() || !formCodeName().trim() || !formSource().trim()}
            >
              {creating() ? "Creating..." : "Save"}
            </button>
          </div>
        </Show>

        {/* Code list */}
        <Switch>
          <Match when={loading() && codes().length === 0}>
            <div class="flex items-center justify-center py-10 text-12-regular text-text-weak">Loading...</div>
          </Match>
          <Match when={error()}>
            <div class="flex items-center justify-center py-10 text-12-regular text-text-weak">
              Failed to load codes
            </div>
          </Match>
          <Match when={codes().length === 0}>
            <div class="flex items-center justify-center py-10 text-12-regular text-text-weak">
              No code repositories added
            </div>
          </Match>
          <Match when={true}>
            <div class="flex flex-col gap-2">
              <div class="grid grid-cols-[1fr_minmax(80px,1fr)_40px] gap-2 px-2 py-1 text-11-regular text-text-weak uppercase tracking-wider">
                <div>Name</div>
                <div>Article</div>
                <div />
              </div>
              <For each={codes()}>
                {(code) => {
                  const articleLabel = () => {
                    if (!code.article_id) return "-"
                    return articleNameMap().get(code.article_id) ?? code.article_id.slice(0, 8) + "..."
                  }
                  return (
                    <div class="grid grid-cols-[1fr_minmax(80px,1fr)_40px] gap-2 items-center rounded-md border border-border-weak-base bg-background-base px-2 py-2 text-12-regular text-text-base">
                      <div class="truncate font-mono" title={code.code_name}>
                        {code.code_name}
                      </div>
                      <div class="truncate text-text-weak" title={code.article_id ?? ""}>
                        {articleLabel()}
                      </div>
                      <button
                        class="text-text-weak hover:text-text-strong transition-colors text-11-regular"
                        onClick={() => handleDelete(code.code_id)}
                        title="Delete code"
                      >
                        Del
                      </button>
                    </div>
                  )
                }}
              </For>
            </div>
          </Match>
        </Switch>
      </div>
    </div>
  )
}
