---
title: '入门 ChatGPT 知识库开发'
description: ''
pubDate: 'Jul 08 2022'
heroImage: 'https://raw.githubusercontent.com/szmxx/blog-imgs/main/%E4%B8%8B%E8%BD%BD.png'
keywords: 'OpenAI,知识库'
catalog: 前端
---
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ac748f31b02e414aaa60cc1689fd1f4d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1426&h=734&s=62089&e=png&b=fdfdfd)
知识库构建一般流程：
- 上传文件
- 解析文件
- 文件分块
- 分块矢量化
- 存储

知识库查询一般流程：
- 用户输入矢量化
- 数据库矢量匹配
- ChatGPT 总结输出
- 用户显示

接下来我将一一介绍各个流程实现
## 文件解析
使用知识库，我们需要上传一系列文件，比如 txt、markdown、pdf 等，我们需要对它们一一做下解析。

使用 nuxt3 声明上传接口：
```ts 
export default defineEventHandler(async (event) => {
  const res = await readMultipartFormData(event)
  try {
    const token = res?.find?.(i => i.name === 'token')?.data?.toString?.()
    const file = res?.find(i => i.name === 'file')
    const id = res?.find(i => i.name === 'id')?.data?.toString?.()
    const data = await parseFile(file) || ''
    const filename = file?.filename || ''
    return {
      filename,
      message: '上传成功',
    }
  }
  catch (error) {
    consola.log(error)
    handleError({
      code: '500',
      message: '上传失败',
    })
  }
})

export async function parseFile(opt = {}) {
  const { type, data } = opt
  switch (type) {
    case 'text/plain':
      return data?.toString()
    case 'text/markdown':
      return parseMarkdown(data?.toString())
    case 'application/pdf':
      return await parsePDF(data)
  }
}
```
### txt 解析
直接获取原始数据转成字符串

### markdown 解析
直接使用 `markdown-it` 进行解析
```ts
import MarkdownIt from 'markdown-it'
const md = new MarkdownIt({
  html: true,
  breaks: false,
  linkify: true,
  typographer: true,
})
export function parseMarkdown(data: string) {
  const markdown = md.render(data)
  const plainText = markdown.replace(/<[^>]*>/g, '')
  return plainText
}
```

### pdf解析
直接使用 `unpdf` 解析
```ts
import { extractText, getDocumentProxy } from 'unpdf'
export async function parsePDF(data: Buffer) {
  const pdf = await getDocumentProxy(new Uint8Array(data))
  const { text } = await extractText(pdf, { mergePages: true })
  return text
}
```
## 矢量数据库
目前笔者使用的是 [supabase](https://supabase.com/dashboard/projects)，对于免费账户，它会提供 500 M 的容量

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dedd74525f0e4ad88b45bbdf3eeaaa6d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1328&h=274&s=28341&e=png&b=f7f8f9)
我们使用 `prisma` 来构建数据库模型和操作 `supabase`，有兴趣的可以 [深入了解](https://www.prisma.io/)

prisma 主要由三块组成，我们重点介绍下其中 `Client` 和 `Migrate`：
- Prisma Client \
查询器，将对象操作映射数据库
- Prisma Migrate \
命令行形式 将 schema 转换成数据库结构
- Prisma Studio \
可视化工具

新建一个 `prisma/schema.prisma` 文件，接下来步骤都在这个文件里面操作
### 构建模型
这里我把知识库和会话绑定在一起了，不需要可以去掉
```prisma
model Knowledge {
  id         String  @id @default(cuid())

  title      String
  content    String
  length     Int?
  tokens     Int?
  chunks     KnowledgeChunk[]

  session  ChatSession? @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  sessionId String?

  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  @@map("knowledge")
}


model KnowledgeChunk {
  id         String  @id @default(cuid())

  content    String
  length     Int?
  tokens     Int?

  knowledge  Knowledge? @relation(fields: [knowledgeId], references: [id], onDelete: Cascade)
  knowledgeId  String?

  embedding Unsupported("vector(1536)")?

  @@map("knowledgechunk")
}
```
### 连接数据库
在 `.env` 文件添加 `DATABASE_URL`，值为 `supabase` 以下内容：

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/45a5497a0d7a4cab935f187160ddde1f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3022&h=1474&s=243882&e=png&b=f8f9fa)

添加矢量扩展
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [vector]
}
```

### 指定客户端
使用 `prisma-client-js` 进行客户端操作，包括增删改查等等
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}
```

## Prisma 初始化
### 数据库构建和连接
在 `package.json` 的 `scripts` 中添加 `"prisma": "npx prisma migrate dev"`，这样可以直接运行 `pnpm prisma` 完成数据库的初始化

```json
{
   "scripts": {
      "prisma": "npx prisma migrate dev"
   }
}
```
### prisma client 导出
我们可以使用 `client` 来操作 `supabase` 数据库

新建 `prisma.ts`
```ts
import { PrismaClient } from '@prisma/client'
// eslint-disable-next-line import/no-mutable-exports
let prisma: PrismaClient
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
}
else {
  if (!globalThis.prisma)
    globalThis.prisma = new PrismaClient()

  prisma = globalThis.prisma
}
export default prisma
```

## ChatGPT 封装
```ts
export async function embedding(input: string, conf: IEmbeddingConf) {
  const {
    model = 'text-embedding-ada-002',
    user = '',
    token = '',
  } = conf
  openai.apiKey = token
  const res = await openai.embeddings.create({
    model,
    input,
    user,
  }).catch((error) => {
    throw error
  })
  return res?.data?.[0]?.embedding
}
```

## 构建知识库

### 数据分块
在解析文件之后，我们取得文件内容，那么接下来需要对数据进行分块
```ts
import GPT3Tokenizer from 'gpt3-tokenizer'

const TokenClass = GPT3Tokenizer?.default ? GPT3Tokenizer.default : GPT3Tokenizer
const tokenizer = new TokenClass({ type: 'gpt3' })

export function countTokens(str: string): number {
  if (str) {
    const encoded = tokenizer.encode(str)
    return encoded.bpe.length
  }
  return 0
}

const CHUNK_SIZE = 200
export function getChunkByText(text: string) {
  const tempChunks = []
  let chunkText = ''
  const list = text?.split?.('\n')
  for (let i = 0; i < list.length; i++) {
    const chunkContent = list[i]
    const sentenceTokenLength = countTokens(chunkContent)
    const chunkTextTokenLength = countTokens(chunkText)
    if (sentenceTokenLength + chunkTextTokenLength > CHUNK_SIZE) {
      tempChunks.push(chunkText.trim())
      chunkText = ''
    }
    if (chunkContent)
      chunkText = `${chunkText.trim()} ${chunkContent}`
  }

  if (chunkText)
    tempChunks.push(chunkText.trim())

  const chunks = tempChunks.map((content) => {
    const trimmedContent = content.trim()
    return {
      content: trimmedContent,
      length: trimmedContent.length,
      tokens: countTokens(trimmedContent),
    }
  })
  if (chunks.length > 1) {
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const prevChunk = chunks[i - 1]

      if (chunk.tokens < CHUNK_SIZE / 2 && prevChunk) {
        prevChunk.content += ` ${chunk.content}`
        prevChunk.length += chunk.length
        prevChunk.tokens += chunk.tokens
        chunks.splice(i, 1)
        i--
      }
    }
  }
  return chunks
}
```
### 矢量化、储存
取得文件块之后，需要转成矢量，并保存到 `supabase`
```ts
async function handler(chunk: IChunk, opt: Record<string, string> = {}) {
  const { token, knowledgeId } = opt
  const vector = await embedding(chunk?.content, { token })

  const result = await prisma.knowledgeChunk.create({
    data: {
      content: chunk.content,
      length: chunk.length,
      tokens: chunk.tokens,
      knowledgeId: `${knowledgeId}`,
    },
  })

  await prisma.$executeRaw`
        UPDATE knowledgechunk
        SET embedding = ${vector}::vector
        WHERE id = ${result.id}
        `
}

const chunks = getChunkByText(data || '')
// 创建知识库表
const knowledge = await prisma.knowledge.create({
  data: {
    title: filename,
    content: data,
    length: data?.length,
    tokens: data?.length,
    sessionId: id,
  },
})
if (knowledge) {
  consola.log(chunks.length)
  for (let i = 0; i < chunks.length; i++) {
    const chunk: IChunk = chunks[i]
    try {
      await handler(chunk, { token: token!, knowledgeId: knowledge.id })
    }
    catch (error) {
      if (error?.code === 'rate_limit_exceeded') {
        enqueue(() => {
          handler(chunk, { token, knowledgeId: knowledge.id })
        })
      }
    }
    await new Promise(resolve => setTimeout(resolve, 200))
  }
}
```
`enqueue` 添加了重试逻辑，可以先不关注这方面

### 完整上传接口
```ts
import { consola } from 'consola'

import prisma from '~/server/utils/prisma'

interface IChunk {
  content: string
  length: number
  tokens: number
  knowledgeId?: string
}
async function handler(chunk: IChunk, opt: Record<string, string> = {}) {
  const { token, knowledgeId } = opt
  const vector = await embedding(chunk?.content, { token })

  const result = await prisma.knowledgeChunk.create({
    data: {
      content: chunk.content,
      length: chunk.length,
      tokens: chunk.tokens,
      knowledgeId: `${knowledgeId}`,
    },
  })

  await prisma.$executeRaw`
        UPDATE knowledgechunk
        SET embedding = ${vector}::vector
        WHERE id = ${result.id}
        `
}
export default defineEventHandler(async (event) => {
  const res = await readMultipartFormData(event)
  try {
    const token = res?.find?.(i => i.name === 'token')?.data?.toString?.()
    const file = res?.find(i => i.name === 'file')
    const id = res?.find(i => i.name === 'id')?.data?.toString?.()
    const data = await parseFile(file) || ''
    const filename = file?.filename || ''
    const chunks = getChunkByText(data || '')
    // 创建知识库表
    const knowledge = await prisma.knowledge.create({
      data: {
        title: filename,
        content: data,
        length: data?.length,
        tokens: data?.length,
        sessionId: id,
      },
    })
    if (knowledge) {
      consola.log(chunks.length)
      for (let i = 0; i < chunks.length; i++) {
        const chunk: IChunk = chunks[i]
        try {
          await handler(chunk, { token: token!, knowledgeId: knowledge.id })
        }
        catch (error) {
          if (error?.code === 'rate_limit_exceeded') {
            enqueue(() => {
              handler(chunk, { token, knowledgeId: knowledge.id })
            })
          }
        }
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
    return {
      id: knowledge.id,
      filename,
      message: '上传成功',
    }
  }
  catch (error) {
    consola.log(error)
    handleError({
      code: '500',
      message: '上传失败',
    })
  }
})

```
## 查询
在完成知识库的构建之后，我们查询的时候，只需要把 `propmt` 转成 矢量，在矢量数据库查询相关矢量，再发送给 `ChatGPT` 就可以了
```ts
import { consola } from 'consola'
import { Role } from '~/config'
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // ids: 知识库的 id
  const { input, conf, token, ids = [] } = body
  try {
    const vector = await embedding(input, { token })
    const result: Record<string, string>[] = await prisma.$queryRaw`
      SELECT
        id,
        "content",
        1 - (embedding <=> ${vector}::vector) as similarity
      FROM knowledgechunk
      where 1 - (embedding <=> ${vector}::vector) > 0.01 AND knowledgeId IN ${ids}
      ORDER BY  similarity DESC
      LIMIT 5;
      `
    const messages = [{
      role: Role.system,
      content: `使用下面信息来回答问题: ${input}`,
    }]
    result.map((i) => {
      messages.push({
        role: Role.user,
        content: i.content,
      })
    })
    return chat(event, messages, conf)
  }
  catch (error) {
    consola.log(error)
    handleError({
      code: '500',
      message: '搜索失败',
    })
  }
})
```
## 总结
以上就是知识库构建的全部内容，有兴趣的话可以使用我构建的 [WebUI](https://ai.aitimi.cn/) 使用完整功能吧～
