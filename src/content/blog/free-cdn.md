---
title: 免费 CDN 加速你的个人网站
description: 免费 CDN 加速你的个人网站
pubDate: 'Jul 01 2022'
heroImage: ''
keywords: 'CDN'
catalog: 运维
---
本文带你揭晓使用 `cloudflare` 加速你的个人网站

## 添加个人站点
打开 [cloudflare](https://www.cloudflare.com/) 网站，输入你的站点，这里不允许根域名，不能使用子域名

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/222d8d7577b243cdbc4d595ed1f2f7ed~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3014&h=1348&s=290118&e=png&b=fefefe)

选择一个计划，选择免费即可。当然你也可以选择付费计划，比如 `Business`，适合于初创公司，它有着 50 项页面规则 和 100 项 [waf](https://www.cloudflare.com/zh-cn/application-services/products/waf/)，帮助你构建网站安全防御，每年只需花费 `$2000 美元`

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/151015c9b8c346229915b295b0d4a5d0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3014&h=1348&s=231239&e=png&b=fefefe)

添加你的解析记录，这里主要是六类解析规则：
- A \
域名映射到 IPV4 地址
- AAAA \
域名映射到 IPV6 地址
- CNAME \
创建域名的别名，比如这条
- @ \
启动根域名服务，例如你可以直接使用 `aitimi.cn` 来访问网站
- www \
启用 www 访问服务，例如你可以使用 `www.aitimi.cn` 来访问网站
- mx \
邮箱解析服务，用来给邮箱指路的，例如 `xxxx@gmail.com`，这个只能说明你在 gmail.com 上有一个账户，但是不知道邮箱服务器所在地址，所以需要一个解析服务，帮助查找邮箱服务器地址，我们在 DNS 服务器上添加 MX记录，那么邮件通过 DNS 就可以找到 `xxxx@gmail.com` 的服务器地址了，从而完成通信过程

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f48caea5901540e6b61c2641112110ae~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2240&h=70&s=17836&e=png&b=fdfdfd)
当我访问 `ai.aitimi.cn` 时，相当于访问 `cname.vercel-dns.com`

有云朵时，代表你的网站被 `cloudflare` 代理，启动了CDN加速和网站保护，没有云朵代表你的网站只是用于 `DNS` 解析，跟你在阿里云设置域名解析一样

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d032c76af41c465595cc26e0bc9fa527~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3004&h=1344&s=299210&e=png&b=fefdfd)

如果要使用 `cloudflare` 的服务，你需要迁移你的名称服务器，以阿里云为例，我详细介绍下迁移过程

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/25e004c0bd4140fd9fca89b0e1a60501~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2998&h=1334&s=254840&e=png&b=fefefe)

## 阿里云设置
打开你的阿里云，切换到域名服务，一般我们解析都在这里设置

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/77b26195244a47c9b844b313376b4937~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2996&h=1316&s=398004&e=png&b=fefefe)
进入管理，选择 `DNS -> DNS 修改`，这里目前是 阿里云的名称服务器，点击修改 DNS 管理服务器

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a9631697767f4d348b6a08cc44323de7~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2956&h=1292&s=195265&e=png&b=fefefe)
添加前面操作中 `cloudflare` 的两个名称服务器，接下来继续回到 `cloudflare`，点击`完成，检查名称服务器`。操作完成后，`cloudflare` 会给你发邮件，然后在 24小时内处理名称服务器更新，我是过了一个晚上就好了

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5ee804db4a994a5d8ff5048e814841a2~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3020&h=1368&s=191728&e=png&b=fefefe)

## 检查 & 后续优化
完成名称服务器更换后，你可以在 [whatsmydns](https://www.whatsmydns.net/#NS/) 查询你的域名状态，可以看到全部替换成 `cloudflare` 了

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a716b39359e54309adb0f5b4c913c6c0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3018&h=1464&s=610149&e=png&b=fbfbfb)
进行一些优化操作，启用 `HTTPS`

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7e7cd87378c64fcfbe3b8cea74af7433~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3018&h=1354&s=206791&e=png&b=fdfdfd)
启用 `Brotli 压缩`，加快网站访问

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c0d6ae851f1943bfa92f70a1cf3b89ab~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3016&h=1342&s=154472&e=png&b=fdfdfd)
总结，可以看到你前面的选择项，检查是否正确

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/097c6f74e22d4156bb7f5c719fd76987~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3016&h=1344&s=143590&e=png&b=fefefe)

如果你的网站没有 SSL 证书的，你需要在 `SSL/TSL` 中选择完全，当前如果你存在 SSL 证书，可以直接选择 完成（严格）

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/197fc0b5d35540ed9c266e41cbb27570~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3018&h=1474&s=284368&e=png&b=fefefe)

## 网速检测
在站点之家测速发现，国内有些地区网速确实很慢，因为 `cloudflare` 服务器主要分布在 海外，再看海外的发现，大部分地址都还 OK 了

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/183939a73912488badd847f3b391af73~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1474&h=720&s=106017&e=png&b=fefefe)

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f73b05d9425146b3a27f42bff0fb4c2a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=866&h=430&s=84721&e=png&b=fdfdfd)
