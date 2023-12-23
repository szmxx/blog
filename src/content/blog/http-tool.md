---
  title: 如何使用TypeScript封装一个简单好用的Http工具
  description: 使用TypeScript封装一个简单好用的Http工具
  pubDate: 2023-12-15
  heroImage: ""
  keywords: HTTP, 代码封装
  catalog: 前端
---

## 前言

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d5f2c60d9413428a8025ac3c8938c213~tplv-k3u1fbpfcp-zoom-1.image)

Http 请求对于任何系统都是一大基石，那么如何封装一个高可用的 Http 请求工具呢？接下来手把手教你使用 `TypeScript` 封装一个高可用的 Http 请求工具。

本工具由三部分构成：Http基础层、基础方法层、业务层。

## Http基础层

`Http`基础层主要用于统一处理错误和防抖。

防抖主要使用`CancelToken`来取消相同时间内的重复请求，通过`Map`对象来记录请求，在请求拦截器中取消重复请求，响应结束则删除请求记录。根据请求`url`&`method`&`params`&`data`

来判断是否是重复请求，并对一些特殊请求，设置白名单，不做去重处理。

```ts
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosInstance,
} from 'axios'
// 取消请求
const CancelToken = axios.CancelToken

interface HttpParams {
  BASEURL?: string
  TIMEOUT?: number
  errorHandler?: (error: AxiosError, ctx?: AxiosInstance) => void
  isCancel?: boolean
}

const cancelMap = new Map()
export default class Http {
  instance: AxiosInstance
  constructor({
    BASEURL,
    TIMEOUT = 1000 * 60 * 10,
    errorHandler = () => void 0,
    isCancel = true,
  }: HttpParams) {
    // 创建实例
    this.instance = axios.create({
      baseURL: BASEURL,
      timeout: TIMEOUT,
      withCredentials: true,
    })
    // 拦截请求
    this.instance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        if (isCancel) {
          const key = uniqueKey(config)
          // if exists, abort it
          cancelHandler(key)
          if (!config.cancelToken && key) {
            config.cancelToken = new CancelToken((cancel) => {
              cancelMap.set(key, cancel)
            })
          }
        }
        return config
      },
      (error: AxiosError) => {
        if (!axios.isCancel(error)) {
          errorHandler(error, this.instance)
          return Promise.reject(error)
        }
      }
    )
    // 拦截响应
    this.instance.interceptors.response.use(
      ({ config, data, headers }: AxiosResponse) => {
        if (isCancel) {
          const key = uniqueKey(config)
          if (cancelMap.has(key)) {
            cancelMap.delete(key)
          }
        }
        if (config.method === 'head') {
          return Promise.resolve(headers)
        }
        return Promise.resolve(data)
      },
      (error: AxiosError) => {
        if (!axios.isCancel(error)) {
          errorHandler(error, this.instance)
          return Promise.reject(error)
        }
      }
    )
  }
  static async get(url: string, config?: AxiosRequestConfig) {
    return (await axios.get(url, config))?.data
  }
  static async post(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ) {
    return (await axios.post(url, data, config))?.data
  }
  static cancel(config: AxiosRequestConfig) {
    const key = uniqueKey(config)
    cancelHandler(key)
  }
}
// 对象转字符串
function obj2Str(obj: Record<string, unknown>) {
  let res = ''
  if (typeof obj !== 'object') {
    return res
  }
  try {
    res = JSON.stringify(obj)
  } catch {
    res = ''
  }
  return res
}
// 唯一ID
function uniqueKey(config: AxiosRequestConfig) {
  const bool = whiteList(config)
  return bool
    ? ''
    : `${config.method}-${config.url}-${obj2Str(config.params)}-${obj2Str(
        config.data
      )}`
}
// 取消请求
function cancelHandler(key: string) {
  if (key) {
    const cancel = cancelMap.get(key)
    if (cancel) {
      cancel()
      cancelMap.delete(key)
    }
  }
}
// 白名单，true 则不做取消
function whiteList(config: AxiosRequestConfig) {
  const { data, headers = {} } = config
  if (data instanceof FormData || headers.range) {
    return true
  }
  return false
}
```

## 基础方法层

基于`Http`基础层，我们封装了基础方法层：支持我们常见的Http请求方法：`get`、`post`、`put`、`delete`、`head`。这里增添了一个`serviceName`用来语义化接口，使得接口报错时更加友好。

```ts
// 基础get方法
const get = <T>(
  instance: AxiosInstance,
  url: string,
  serviceName = '未知服务',
  params = {},
  options = {}
) => {
  return new Promise<T>((resolve, reject) => {
    instance({
      url,
      method: 'get',
      params: params,
      ...options,
    })
      .then((res) => {
        resolve(res?.data ? res.data : res)
      })
      .catch((error) => {
        reject(error)
        console.error(`get请求---${serviceName}---接口失败！`)
      })
  })
}
// 基础post方法
const post = <T>(
  instance: AxiosInstance,
  url: string,
  serviceName = '未知服务',
  data = {},
  options = {}
) => {
  return new Promise<T>((resolve, reject) => {
    instance({
      url,
      method: 'post',
      data: data,
      ...options,
    })
      .then((res) => {
        resolve(res?.data ? res.data : res)
      })
      .catch((error) => {
        reject(error)
        console.error(`post请求---${serviceName}---接口失败！`)
      })
  })
}
// 基础put方法
const put = <T>(
  instance: AxiosInstance,
  url: string,
  serviceName = '未知服务',
  data = {},
  options = {}
) => {
  return new Promise<T>((resolve, reject) => {
    instance({
      url,
      method: 'put',
      data: data,
      ...options,
    })
      .then((res) => {
        resolve(res?.data ? res.data : res)
      })
      .catch((error) => {
        reject(error)
        console.error(`put请求---${serviceName}---接口失败！`)
      })
  })
}
// 基础delete方法
const del = <T>(
  instance: AxiosInstance,
  url: string,
  serviceName = '未知服务',
  data = {},
  options = {}
) => {
  return new Promise<T>((resolve, reject) => {
    instance({
      url,
      method: 'delete',
      data: data,
      ...options,
    })
      .then((res) => {
        resolve(res?.data ? res.data : res)
      })
      .catch((error) => {
        reject(error)
        console.error(`delete请求---${serviceName}---接口失败！`)
      })
  })
}
// 基础head方法
const head = <T>(
  instance: AxiosInstance,
  url: string,
  serviceName = '未知服务',
  params = {},
  options = {}
) => {
  return new Promise<T>((resolve, reject) => {
    instance({
      url,
      method: 'head',
      params: params,
      ...options,
    })
      .then((res) => {
        resolve(res?.data ? res.data : res)
      })
      .catch((error) => {
        reject(error)
        console.error(`head请求---${serviceName}---接口失败！`)
      })
  })
}
```

## 业务层

我们常用的请求有本地请求、业务后台请求、绝对路径请求以及其他三方后台请求，我们可以构建不同的`axios`实例来处理这些情况。

```ts
export interface AxiosConfig {
  BASEURL: {
    host: string
    port: number
    path?: string
  }
}
interface InstanceMap {
  [key: string]: AxiosInstance | null
}
const instanceMap: InstanceMap = {
  base: null, // 当前系统ip下的请求
  business: null, // 后台接口请求
}
// 初始化默认实例
export const initAxiosInstance = (config: AxiosConfig) => {
  if (!config) return
  const {
    BASEURL: { host, port },
  } = config
  const BASEURL = `//${host || location.hostname}:${port}/`
  instanceMap.base = new Http({
    BASEURL: BASEURL,
    errorHandler,
  }).instance
}
// 初始化后台实例
export const initBusinessInstance = (config: AxiosConfig) => {
  if (!config) return
  const {
    BASEURL: { host, port, path },
  } = config
  const BASEURL = `//${host || location.hostname}:${port}/${path}`
  instanceMap.business = new Http({
    BASEURL: BASEURL,
    errorHandler,
  }).instance
    // set auth headers
  instanceMap.business.defaults.headers.common['Authorization'] = `${getToken()}`
}

// 业务方法 GET
export const GET = <T>(
  url: string,
  serviceName?: string,
  params?: Record<string, any>,
  options?: Record<string, any>
): Promise<T> => {
  if (!instanceMap.base) {
    throw new Error('instanceMap.base is null')
  }
  return get<T>(instanceMap.base, url, serviceName, params, options)
}
// 业务方法 POST
export const POST = <T>(
  url: string,
  serviceName?: string,
  data?: Record<string, any>,
  options?: Record<string, any>
): Promise<T> => {
  if (!instanceMap.base) {
    throw new Error('instanceMap.base is null')
  }
  return post<T>(instanceMap.base, url, serviceName, data, options)
}
// 业务方法 PUT
export const PUT = <T>(
  url: string,
  serviceName?: string,
  data?: Record<string, any>,
  options?: Record<string, any>
): Promise<T> => {
  if (!instanceMap.base) {
    throw new Error('instanceMap.base is null')
  }
  return put<T>(instanceMap.base, url, serviceName, data, options)
}
// 业务方法 DELETE
export const DELETE = <T>(
  url: string,
  serviceName?: string,
  data?: Record<string, any>,
  options?: Record<string, any>
): Promise<T> => {
  if (!instanceMap.base) {
    throw new Error('instanceMap.base is null')
  }
  return del<T>(instanceMap.base, url, serviceName, data, options)
}
// 业务方法 HEAD
export const HEAD = <T>(
  url: string,
  serviceName?: string,
  params?: Record<string, any>,
  options?: Record<string, any>
): Promise<T> => {
  if (!instanceMap.base) {
    throw new Error('instanceMap.base is null')
  }
  return head<T>(instanceMap.base, url, serviceName, params, options)
}
```

## 代码示例

在某些情况，我们可以需要动态修改后台接口`host`、`port`或者`path`。所以我们需要动态化配置。

1、根据环境动态选择配置

我们常见的是设置不同的`env`文件，在打包时通过`DefinePlugin`插件全局替换那些变量，达到不同环境设置不同的后台接口环境。

2、配置文件

上面那种虽然实现了根据不同环境构建，但是打包之后就不能更改后台环境了。如果打包之后需要更改后台环境呢？我们只能通过配置文件来配置后台环境，这样打包可以修改配置文件来配置不同的后台环境。我们只需要将配置文件放置在`public`目录即可。

```ts
import { GET, AxiosConfig } from './index'
export interface AppConfig {
  title: string
  development?: AxiosConfig
  production?: AxiosConfig
  [key: string]: unknown | AxiosConfig
}
export function getAppConfig() {
  return GET<AppConfig>('static/appConfig.json', "获取系统配置文件")
}
```

```ts
import {
  initAxiosInstance,
  initBusinessInstance,
  AxiosConfig,
} from './api/index';
import { getAppConfig, AppConfig } from './api/public'
const envList = ['development', 'production']
export default async () => {
  const config = await getAppConfig()
  const envConfig = config[import.meta.env.MODE] as AxiosConfig
  initAxiosInstance(envConfig)
  initBusinessInstance(envConfig)
}
```

## 总结

`Http`工具由三部分组成：`Http`基础层、基础方法层、业务层。`Http`基础层提供一个统一处理错误和防抖的`axios`实例；基础方法层提供了一些基础方法，支撑业务层；业务层通过传入不同的`axios`示例，构建不同的业务请求方法。
