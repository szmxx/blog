---
  title: 2023年，你该这样搭建脚手架！
  description: 通用脚手架
  pubDate: Sat Dec 23 2023 21:08:16 GMT+0800 (中国标准时间)
  heroImage: ''
  keywords: 脚手架
  catalog: 后端
---

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/363d69c4b593471f8306215e396ab65b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1794&h=858&s=102177&e=png&b=fdfdfd)
脚手架构建一般流程：
- 构建命令
- QA 过程
- 下载模版
- 安装依赖

下面介绍一种更加轻量简洁的方式搭建脚手架，看下最终效果（完整代码见文末）：

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f75ad6eefff246d9a273f982f6a5b883~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1784&h=952&s=191801&e=png&b=ffffff)

如果大家只想体验的话，可以直接输入以下命令、[查看详细文档](https://www.npmjs.com/package/@szmxx/ucli)了解更多用法：

`npm install -g @szmxx/ucli`

接下来我将详细介绍内部实现


## 构建命令
相信大家都是使用 `commander` 来构建命令的，这里我使用一个更简洁的工具 `citty`，先给大家来个栗子：
```ts
import { defineCommand } from "citty";
export default defineCommand({
  meta: {
    name: "create",
    description: "create a new project",
  },
  args: {
    name: {
      type: "positional",
      description: "<project-name>",
      required: true,
    },
  },
  async run({ args }) {
    console.log(args.name)
  }
});
```
非常简洁的实现了 `create` 命令，当然你可以把它作为一个子命令，接下来我将详细介绍。
### 定义主命令
相信大家都用过脚手架工具，比如在 `vue` 中创建模版工程，只需要输入 `vue create <project-name>` 就可以启动创建项目的流程，其实这里有三个概念：
- 主命令
- 子命令
- 位置参数

`vue` 就是主命令，`create` 是子命令，位置参数就是我们输入的 `project-name`

接下来我们使用 `citty` 来创建脚手架的主命令

```ts
import { defineCommand, runMain } from "citty";
import { name, version, description } from "../package.json";
function start() {
  try {
    const main = defineCommand({
      meta: {
        name: name,
        version: version,
        description: description,
      },
      run({ args }) {
          consola.log(
            figlet.textSync(name, {
              font: "Star Wars",
            })
          );
      },
    });
    runMain(main);
  } catch (error) {
    consola.error(error);
  }
}
start();
```
这样就定义好主命令了，如果我们指定 `package.json` 的 `bin` 链接到我们这个代码，再通过 `npm link` 托管到全局，那就可以直接在 命令行输入 `ucli`，则会打印出对应的像素化信息。这里使用 `figlet` 来打印像素化信息
### 定义子命令
如果我们想要实现 `ucli create` 的效果，那么需要在主命令中定义子命令

定义子命令很简单，只需要在主命令中声明一个 `subCommands` 字段
```ts
  const main = defineCommand({
      meta: {
        name: name,
        version: version,
        description: description,
      },
      subCommands: {
        create: () => import("./commands/create").then((r) => r.default),
      },
      run({ args }) {
          consola.log(
            figlet.textSync(name, {
              font: "Star Wars",
            })
          );
      }
    });
```
子命令本身定义和主命令是一致的
```ts
export default defineCommand({
  meta: {
    name: "create",
    description: "create a new project",
  },
  args: {
    name: {
      type: "positional",
      description: "<project-name>",
      required: true,
    },
  },
  run({ args }) {
    consola.log(args.name)
  },
});
```
这里定义了一个位置参数 `name`，这样我们就实现了 `ucli create <project-name>`，在 `run` 中我们就可以实现 `QA` 过程了
## QA 过程
`QA` 过程直接采用 `inquirer` 来实现，我们是动态 `QA`，所以使用额外使用 `rxjs`
```ts
import inquirer from "inquirer";
import { Subject } from "rxjs";
import { TemplateList } from "../config";
export function create(){
  return new Promise<Record<string, unknown>>((resolve) => {
    const prompts = new Subject();
    const result: Record<string, unknown> = {};
    inquirer
      .prompt(prompts as any)
      .ui.process.subscribe((res: Record<string, string>) => {
        result[res.name] = res.answer;
      });

    prompts.next({
      type: "list",
      name: "template",
      choices: TemplateList,
      message: "请选择一个模版",
    });
  });
```
## 下载模版
在国内，模版主要来源 `github`、`gitlab`以及企业私有部署的代码仓库，我们之前一直使用的是`download-git-repo`，这里我介绍一种新的方式：`giget`，它非常方便的实现了模版的下载，并且支持自定义来源。举个简单的栗子：
```ts
import { downloadTemplate } from "giget";
const {
  username = "szmxx",
  provider = "github",
  name,
  dirName = "",
  auth = "",
  refName = "main"
} = conf
const { dir } = await downloadTemplate(
  `${provider}:${username}/${name}#${refName}`,
  {
    auth: auth,
    dir: dirName,
  }
);
```

这里我稍微解释下(以这个链接)：
https://github.com/szmxx/ucli
- provider \
仓库的来源，比如 github
- username \
仓库所属：szmxx
- name \
仓库名称：ucli
- refName \
代码分支，默认 main
- auth \
如果是 github，那么则是你的 `Personal access tokens`
- dir \
输出的目录

那么我们根据前面的 `QA` 结果，生成对应的下载参数，直接调用下载即可
## 创建远程仓库
使用 `github openapi` 我们可以得到动态操作 github 的能力，其他平台也是如此，那么在下载完代码之后，我们需要创建对应的远程仓库
```ts
export async function createRepo(data: Record<string, unknown>, auth: string) {
  return fetch(`${baseURL}/user/repos`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      authorization: `Bearer ${auth}`,
    },
  });
}

const res = await createRepo(
  {
    name: pkg.name,
    description: pkg.description,
    homepage: pkg.homepage,
    private: pkg.private,
    license_template: pkg.license,
  },
  auth
);
```
## 其他
当然还有一些额外操作，比如 `git`、`pnpm install`等，我们可以使用 `execa` 来执行相应的命令：
```ts
import { $ } from "execa";

const sshURL = '';
await $`git init`;
// 切换 main 分支
await $`git checkout -b main`;
// 初始化远程仓库
await $`git remote add origin ${sshURL}`;
```
## 完整体验
ucli 基础版目前已经开源了，大家可以使用 
`npm install -g @szmxx/ucli` 来安装体验。

完整代码见 [github](https://github.com/szmxx/ucli) \
详细使用见 [npm](https://www.npmjs.com/package/@szmxx/ucli)

