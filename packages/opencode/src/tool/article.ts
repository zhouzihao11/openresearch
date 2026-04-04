import z from "zod"
import path from "path"
import { Tool } from "./tool"
import { Database, eq } from "../storage/db"
import { ArticleTable, CodeTable } from "../research/research.sql"
import { Research } from "../research/research"
import { Filesystem } from "../util/filesystem"
import { Instance } from "../project/instance"

type ArticleRow = typeof ArticleTable.$inferSelect

function getCodePaths(articleId: string): string[] {
  const codes = Database.use((db) => db.select().from(CodeTable).where(eq(CodeTable.article_id, articleId)).all())
  return codes.map((c) => path.join(Instance.directory, "code", c.code_name))
}

function formatArticle(row: ArticleRow): string {
  const kind = Filesystem.stat(row.path)?.isDirectory() ? "latex_directory" : "pdf"
  const codePaths = getCodePaths(row.article_id)
  return [
    `article_id: ${row.article_id}`,
    row.title ? `title: ${row.title}` : null,
    `kind: ${kind}`,
    `path: ${row.path}`,
    codePaths.length > 0 ? `code_paths: ${codePaths.join(", ")}` : null,
    row.source_url ? `source_url: ${row.source_url}` : null,
  ]
    .filter(Boolean)
    .join("\n")
}

export const ArticleQueryTool = Tool.define("article_query", {
  description:
    "Query research articles (PDFs or LaTeX source folders) in the current research project. " +
    "IMPORTANT: Always use this tool — not glob, ls, read, or other generic tools — when listing or querying articles/papers in a research project. " +
    "It is the ONLY tool that can query the research project article database. " +
    "When called without an articleId, lists all articles with their metadata (id, title, path, etc.). " +
    "When called with an articleId, returns the article metadata including its file path. " +
    "To read the actual article content, use the returned path with the read tool.",
  parameters: z.object({
    articleId: z
      .string()
      .optional()
      .describe("The article ID to query. If omitted, lists all articles in the project."),
  }),
  async execute(params, ctx) {
    const researchProjectId = await Research.getResearchProjectId(ctx.sessionID)
    if (!researchProjectId) {
      return {
        title: "Failed",
        output: "Current session is not associated with any research project.",
        metadata: { count: 0 },
      }
    }

    // List mode
    if (!params.articleId) {
      const articles = Database.use((db) =>
        db.select().from(ArticleTable).where(eq(ArticleTable.research_project_id, researchProjectId)).all(),
      )
      if (articles.length === 0) {
        return {
          title: "No articles",
          output: "No articles found in this research project.",
          metadata: { count: 0 },
        }
      }
      const output = articles.map((a, i) => `--- Article ${i + 1} ---\n${formatArticle(a)}`).join("\n\n")
      return {
        title: `${articles.length} article(s)`,
        output,
        metadata: { count: articles.length },
      }
    }

    // Query mode
    const article = Database.use((db) =>
      db.select().from(ArticleTable).where(eq(ArticleTable.article_id, params.articleId!)).get(),
    )
    if (!article) {
      return {
        title: "Not found",
        output: `Article not found: ${params.articleId}`,
        metadata: { count: 0 },
      }
    }

    return {
      title: article.title ?? article.article_id,
      output: formatArticle(article),
      metadata: { count: 1 },
    }
  },
})
