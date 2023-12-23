---
  title: 大文件上传和下载解决方案
  description: 大文件上传和下载解决方案
  pubDate: Sat Dec 23 2023 21:08:16 GMT+0800 (中国标准时间)
  heroImage: ''
  keywords: 性能优化
  catalog: 前端
---

## 前言

前端处理 “大” 一直是一个痛点和难点，比如大文件、大数据量。虽然浏览器硬件有限，但是聪明的工程师总是能够最大化利用浏览器的能力和特性，优雅的解决一个个极端问题，满足用户的多样化需求。

## 断点上传

对于大文件，如果我们直接上传，用户网速够慢的话，可能需要等上几天几夜才能上传完成，这样的用户体验可能导致用户直接放弃，那么有没有一种方式能够更好的上传大文件呢？

首先我们可以想到一些浏览器常见的优化套路：

-   多线并行处理
-   缓存结果
-   按需使用

有了优化思路，那么看看浏览器支持能力：

-   HTTP 1.x，浏览器可以并行处理请求，比如 Chrome 可以并行处理 6 个请求。HTTP 2.x，理论上可以无限制并行处理请求。
-   浏览器支持 WebWorker单独子线程来处理一些耗时任务。
-   HTTP 没有状态，所以我们只能将状态缓存到服务器。

浏览器也提供了支持能力，那么我们怎么把一个文件并发上传，又如何做缓存呢？

### 文件切割和唯一标识

我们知道，计算机底层数据都是由 0 和 1 的二进制数据构成，文件也不例外，那么我们可以按照字节数将大文件切割成一个个小文件块，然后并行上传。但是切割之后的文件块是无法标识的，所以我们需要为文件确定一个唯一标识，我们常见会使用文件名来标识文件，但是文件名是可修改的，这样的标识是非常不可靠的，所以我们会基于文件内容来做一个标识，也就是计算文件的 md5 值，这样只要文件内容不修改，文件的 md5 值就不会变化。
```ts
//【前端代码】文件切割块和计算唯一标识
const CHUNK_SIZE = 10 * 1024 * 1024;
const slice = File.prototype.slice;
// 获取文件块
function getFileChunks(size: number) {
  const chunks = []
  const chunkCount = Math.ceil(size / CHUNK_SIZE)
  for (let i = 1; i < chunkCount; i++) {
    chunks.push(i * CHUNK_SIZE)
  }
  if (chunkCount) {
    chunks.push(size)
  }
  return chunks
}
// 计算 MD5 值
function computedMD5(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer()
    const reader = new FileReader()
    const chunks = getFileChunks(file.size)
    let currentChunk = 0
    reader.onload = (e: any) => {
      spark.append(e?.target?.result)
      currentChunk++
      if (currentChunk < chunks.length) {
        loadNext()
      } else {
        resolve(spark.end())
      }
    }
    reader.onerror = (error) => {
      console.error(error)
      reject('computed fail')
    }
    function loadNext() {
      const start =
        (Math.ceil(chunks[currentChunk] / CHUNK_SIZE) - 1) * CHUNK_SIZE
      const end = chunks[currentChunk]
      reader.readAsArrayBuffer(slice.call(file, start, end))
    }
    loadNext()
  })
}
```
我们通过文件大小和固定文件块大小来计算需要上传的文件块数量和每个块对应字节范围。然后使用 `spark-md5`库来计算文件的 md5 值，如果注意的是，如果文件较大，计算 md5 时间可能较长，所以需要利用 `WebWorker`来计算。

### 文件并行上传和缓存实现

通过对文件切块和 md5 值计算，我们可以并行的上传文件块，并缓存上传的文件块。
```ts
//【前端代码】缓存实现和并发请求
// 获取将要上传的块
async function getUploadChunks(file: File, md5: string): Promise<number[]> {
  // 全部文件块
  const chunks = getFileChunks(file.size)
  // 已上传的文件块索引
  const uploadChunks: number[] | boolean = await getChunks({
    md5: md5,
    filename: file.name,
  })
  // 秒传
  if (typeof uploadChunks === 'boolean') {
    return []
  }
  return chunks.filter((chunk, index) => {
    return uploadChunks.indexOf(index) === -1
  })
}
// 并发上传
async function uploadParallel(file: File, chunks: number[], md5: string) {
  const res = chunks.map((chunk: number, index) => {
    const formData = new FormData()
    formData.append('md5', md5)
    formData.append(
      'chunk',
      slice.call(
        file,
        (Math.ceil(chunks[index] / CHUNK_SIZE) - 1) * CHUNK_SIZE,
        chunks[index]
      )
    )
    formData.append('filename', file.name)
    formData.append(
      'index',
      String(Math.ceil((chunk - CHUNK_SIZE) / CHUNK_SIZE))
    )
    return uploadChunk(formData)
  })
  Promise.allSettled(res).then(() => {
    notifyCombine(file, md5)
  })
}
```
这里我们通过一个接口来保持上传的状态。使用`File.prototype.slice`来进行文件切割，并通过`Promise.allSettled`来实现并发上传。
```js
//【后端代码】获取上传的文件块和文件上传
const SAVE_DIR = "public";
router.get(
  "/getChunks",
  validQuery({
    md5: {
      type: "string",
      required: true,
    },
    filename: {
      type: "string",
      required: true,
    },
  }),
  (ctx) => {
    const { query } = ctx.request;
    const { md5, filename } = query;
    // 如果存在文件，则秒传
    const ext = path.extname(filename);
    const bool = existsSync(`${SAVE_DIR}/${md5}${ext}`);
    if (bool) {
      ctx.success({
        data: true,
      });
      return;
    }
    mkdirSync(`${UPLOAD_DIR}/${md5}`);
    const files = [];
    traverseSync(`${UPLOAD_DIR}/${md5}`, (path) => {
      files.push(+path.replace(`${UPLOAD_DIR}/${md5}/`, ""));
    });
    ctx.success({
      data: files,
    });
  }
);
router.post(
  "/uploadChunk",
  validFiles({
    chunk: {
      type: "boolean",
      required: true,
    },
  }),
  validBody({
    md5: { type: "string", required: true },
    index: { type: "string", required: true },
  }),
  async (ctx) => {
    const { body, files } = ctx.request;
    const { md5, index } = body;
    await copy(files.chunk.filepath, `${UPLOAD_DIR}/${md5}/${index}`);
    ctx.success({});
  }
);
```
### 合并文件，文件上传校验
当服务器文件块和本地切割块一致时，则通知服务器进行文件合并。
```ts
//【前端代码】文件合并
// 通知文件合并
async function notifyCombine(file: File, md5: string) {
  const chunks = await getUploadChunks(file, md5)
  if (chunks.length === 0) {
    await mergeChunk({
      md5: md5,
      filename: file.name,
    })
  } else {
    uploadParallel(file, chunks, md5)
  }
}
```
```js
// 【后端代码】文件合并
router.post(
  "/mergeChunk",
  validBody({
    md5: {
      type: "string",
      required: true,
    },
    filename: {
      type: "string",
      required: true,
    },
  }),
  async (ctx) => {
    const { body } = ctx.request;
    const { md5, filename } = body;
    const ext = path.extname(filename);
    try {
      const result = await mergeFile(
        `${UPLOAD_DIR}/${md5}`,
        `public/${md5}${ext}`
      );
      if (result) {
        rmdir(`${UPLOAD_DIR}/${md5}`);
        ctx.success({});
      } else {
        ctx.fail({});
      }
    } catch {
      ctx.fail({});
    }
  }
);
```
至此，断点续传已经完成了。
## 断点下载
对于大文件上传，上面那节我们给了解法，那么对于大文件下载，我们应该怎么做呢？\
其实原理也是一样的：利用浏览器请求并发能力和缓存能力。
### 获取文件信息
首先我们需要获取文件的总大小，从而进行分块下载。
```ts
// 【前端代码】
async function download() {
  const filepath = '34ffeb6eac2cc74423421538b2b35d68.zip'
  const res = await headDownload({
    filepath: filepath,
  })
  const length = res?.['content-length'] as number
  const filename = getFileName(res?.['content-disposition'] as string)
  const chunks = getFileChunks(+length)
  retryDownload(filepath, filename, chunks, [])
}
```
我们使用 head 请求来获取文件的大小和文件名称，从而进行分块下载。
```js
//【后端代码】获取文件信息
router.head(
  "/downloadFile",
  validQuery({
    filepath: {
      type: "string",
      required: true,
    },
  }),
  (ctx) => {
    const { query } = ctx.request;
    const { filepath } = query;
    const pathname = "public/" + filepath;
    try {
      const statObj = statSync(pathname);
      ctx.set(
        "Content-Disposition",
        `attachment;filename=${encodeURIComponent(filepath)}`
      );
      ctx.body = "success";
      ctx.length = statObj.size;
    } catch (error) {
      console.error(error);
      ctx.fail({});
      return;
    }
  }
);
```
### 分块下载和重试机制
我们利用请求头 `range`来进行分块下载，并添加重试机制。
```ts
//【前端代码】分块下载和重试
// 分块下载
async function downloadChunk(filename: string, start: number, end: number) {
  const buffer = await downloadFile(
    {
      filepath: filename,
    },
    {
      headers: { range: `bytes=${start}-${end}` },
      responseType: 'arraybuffer',
    }
  )
  return buffer
}
// 分块下载和重试
function retryDownload(
  downloadPath: string,
  filename: string,
  chunks: number[],
  result: Record<string, any>[]
) {
  const list = chunks.map((chunk, index) => {
    return downloadChunk(
      downloadPath,
      (Math.ceil(chunks[index] / CHUNK_SIZE) - 1) * CHUNK_SIZE,
      chunks[index]
    )
  })
  Promise.allSettled(list).then((res) => {
    // 下载完全
    const successList = res.filter((i, index) => {
      if (i.status === 'fulfilled') {
        result[Math.ceil((chunks[index] - CHUNK_SIZE) / CHUNK_SIZE)] = i
      }
      return i.status === 'fulfilled'
    })
    if (successList.length === list.length) {
      const buffers: Uint8Array[] = (result || []).map((i) => {
        return new Uint8Array(i?.value)
      })
      const res = mergeBlobChunk(buffers)
      if (res) {
        saveAs(filename, res)
      }
    } else {
      // 下载剩余块
      const failList = res.reduce((acc: number[], cur, index) => {
        if (cur.status === 'rejected') {
          acc.push(index)
        }
        return acc
      }, [])
      const list = chunks.filter((chunk, index) => {
        return failList.indexOf(index) !== -1
      })
      retryDownload(downloadPath, filename, list, result)
    }
  })
}
```
我们通过一个递归函数，每次上传检测下载进度，从而完成下载重试。
```js
// 【后端代码】分块下载
router.post(
  "/downloadFile",
  validBody({
    filepath: {
      type: "string",
      required: true,
    },
  }),
  (ctx) => {
    const { headers, body } = ctx.request;
    const { filepath } = body;
    const { range } = headers;
    const pathname = "public/" + filepath;
    let statObj = {};
    try {
      statObj = statSync(pathname);
    } catch (error) {
      console.error(error);
      ctx.fail({});
      return;
    }
    if (range) {
      let [, start, end] = range.match(/(\d*)-(\d*)/);
      // 文件总字节数
      let total = statObj.size;
      // 处理请求头中范围参数不传的问题
      start = start ? parseInt(start) : 0;
      end = end ? parseInt(end) : total - 1;
      ctx.status = 206;
      ctx.set("Accept-Ranges", "bytes");
      ctx.set("Content-Range", `bytes ${start}-${end}/${total}`);
      ctx.body = fs
          .createReadStream(pathname, { start, end })
          .pipe(PassThrough());
    } else {
      ctx.body = fs.createReadStream(pathname).pipe(PassThrough());
    }
  }
);
```
### 文件合并和下载
在获取到所有文件数据之后，我们需要对文件进行合并，并下载。
```ts
// 【前端代码】文件合并和下载
// 文件合并
function mergeBlobChunk(arrays: Uint8Array[]) {
  if (!arrays.length) return
  const totalLength = arrays.reduce((acc, value) => acc + value.length, 0)
  const result = new Uint8Array(totalLength)
  let length = 0
  for (const array of arrays) {
    result.set(array, length)
    length += array.length
  }
  return result
}
// 文件下载
export function saveAs(
  filename = '',
  buffers: BlobPart,
  mime = 'application/octet-stream'
) {
  const blob = new Blob([buffers], { type: mime })
  const blobUrl = URL.createObjectURL(blob)
  const a: HTMLAnchorElement = document.createElement('a')
  a.download = filename
  a.href = blobUrl
  a.click()
  URL.revokeObjectURL(blobUrl)
}
```
我们获取到的文件数据是`ArrayBuffer`类型，这个数据是不能直接操作的，所以我们需要使用类型数组来操作它，这里我们使用`Unit8Array`类型数组来合并文件数据，最后通过生成`BlobUrl`来进行文件下载。

## 总结

断点上传和断点下载都是利用常见的优化套路：并行计算和缓存。充分发挥浏览器特性能力，达到更佳的效果。其实大数据渲染也是相似套路，比如懒加载、分片渲染、虚拟列表等等，使用的是按需加载、异步渲染、按需渲染的套路来达到大数据的渲染效果。

