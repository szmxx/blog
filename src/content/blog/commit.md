---
title: 聊一聊代码提交规范化
description: 代码提交规范化
pubDate: "Jul 02 2022"
heroImage: ""
keywords: '代码规范'
catalog: 工程化
---


## 前言

这篇来讲一下代码提交规范，如果你想要在 gitlab/github 看到一个赏心悦目的提交格式，想要靠团队成员自觉，一段时间后，你绝对会 &x%$x...。所以我们还是得靠工具，**人不可靠，工具是可靠的**。

## 代码提交规范

代码提交规范其实是分为两个部分的：

-   提交信息 QA 过程
-   提交信息的校验

这两者是相辅相成的，你先根据 QA 过程生成一个`commit-msg`，然后在利用配置规则来校验这个`commit-msg`。

### 1. 提交信息 QA 过程

`yarn add commitizen -D`。这个会提供三个[可执行命令](https://javascript.ruanyifeng.com/nodejs/packagejson.html#toc4)：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/326e11dc8a9a4737a793605539ff015b~tplv-k3u1fbpfcp-zoom-1.image)

`commitizen`又叫作[自定义 Git 命令](https://github.com/commitizen/cz-cli/issues/166)，它提供了一个`cz`(别名:`git-cz`)命令，原理很简单：执行 `yarn cz` 或者 `yarn git-cz` 唤起 QA 过程，根据 QA 过程用户输入拼接成 `commit-msg`，然后利用`child_process.spawn` 执行真正的 `git commit`。所以我们使用一个自定义命令来提交。

```json
// package.json 配置
{
   "scripts":{
      "commit":"git-cz"
  }
}
```

那么我们 QA 过程的问答语句怎么来的呢?

### 2. 提交信息的校验

`yarn add @commitlint/cz-commitlint -D`。上面的`commitizen`其实需要配置一个 path 来指向 QA 问答语句配置的，这个路径指向的文件需要暴露一个问答配置的，而我们的 `@commitlint/cz-commitlint` 不仅提供了配置问答语句功能，还集成了提交信息校验的功能，所以这里我们使用`@commitlint/cz-commitlint`。

```json
// package.json 配置
{
  "config": {
    "commitizen": {
      "path": "@commitlint/cz-commitlint"
    }
  }
}
```

它的配置文件是`commitlint.config.js`，那么它其中的配置是怎样的呢？

### 3. 提交规范配置

`yarn add @commitlint/config-conventional -D`。每一份提交规范配置都是基于其他提交规范配置，`@commitlint/config-conventional`就是一个基础的提交规范配置（[更多配置](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint)）。我们基于这个配置就可以扩展我们自己的提交规范配置了。

```js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  // 0: 禁止这个规则，1: 代表警告，2: 代表错误
  // always | never , never 不能。always 必须
  // value
  rules: {
    'type-empty': [2, 'never'],
    'scope-enum': [
      2,
      'always',
      [
				"scope1",
        "scope2"
      ],
    ],
  },
  prompt: {
    settings: {
      enableMultipleScopes: true, // scope 多个切换
      scopeEnumSeparator: ',',
    },
    messages: {
      skip: ':skip',
      max: 'upper %d chars',
      min: '%d chars at least',
      emptyWarning: 'can not be empty',
      upperLimitWarning: 'over limit',
      lowerLimitWarning: 'below limit',
    },
    questions: {
      type: {
        description: "Select the type of change that you're committing:",
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
            emoji: '📚',
          },
          style: {
            description:
              'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
            title: 'Styles',
            emoji: '💎',
          },
          refactor: {
            description: 'A code change that neither fixes a bug nor adds a feature',
            title: 'Code Refactoring',
            emoji: '📦',
          },
          perf: {
            description: 'A code change that improves performance',
            title: 'Performance Improvements',
            emoji: '🚀',
          },
          test: {
            description: 'Adding missing tests or correcting existing tests',
            title: 'Tests',
            emoji: '🚨',
          },
          build: {
            description:
              'Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)',
            title: 'Builds',
            emoji: '🛠',
          },
          ci: {
            description:
              'Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)',
            title: 'Continuous Integrations',
            emoji: '⚙️',
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: 'Chores',
            emoji: '♻️',
          },
          revert: {
            description: 'Reverts a previous commit',
            title: 'Reverts',
            emoji: '🗑',
          },
        },
      },
      scope: {
        description: 'scope',
      },
      subject: {
        description: 'Write a short, imperative tense description of the change',
      },
      body: {
        description: 'Provide a longer description of the change',
      },
      isBreaking: {
        description: 'Are there any breaking changes?',
      },
      breakingBody: {
        description:
          'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself',
      },
      breaking: {
        description: 'Describe the breaking changes',
      },
      isIssueAffected: {
        description: 'Does this change affect any open issues?',
      },
      issuesBody: {
        description:
          'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself',
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".)',
      },
    },
  },
};
```

至此我们基本上完成代码提交规范化，但是还是有点缺陷的，你发现了没？(๑*◡*๑)，因为用户还是可以通过输入`git commit`来绕过你辛辛苦苦建立的机制的，所以我们得“断根”...

### 4. 断根

这根怎么断呢？我们可以通过`husky`来解决，在`commit-msg`阶段再次校验提交信息。

#### 1、添加 husky

```bash
# 安装husky
yarn add husky -D
# 启用 git hook
npx husky install
# 安装具体 git hook，注意需要是单引号
npx husky add .husky/commit-msg 'yarn commitlint --edit $1'

# package.json 添加配置，为了安装后自动启动 git hook
# https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks
{
	"scripts":{
  	"prepare":"husky install"
  }
}
```

`npx husky add .husky/commit-msg 'yarn commitlint --edit $1'`，`$1` 就是你提交的信息，你添加了`git hook`，需要注意使用`git add .`添加到暂存区里面，再进行提交操作。

#### 2、代码校验

`yarn add @commitlint/cli -D`，这个会提供一个 `commintlint` 的可执行命令，我们可以使用`yarn commitlint` 来调用 `@commitlint/cz-commitlint` 来校验 `commit-msg`。校验不成功，即使你使用`git commit`也没办法通过，这样彻底断绝了提交不规范的问题了。

### 5. QA语句定制化的另一种方式

在前面我们讲到，QA 过程的语句可以定制化，我们采用的是`@commitlint/cz-commitlint`，你也可以使用 `cz-customizable` 来定制化 QA 语句，它提供一个 `.cz-config.js` [配置文件](https://github.com/leoforfree/cz-customizable)进行配置 QA 语句，并且完全将QA过程和提交信息校验分开了。也就是说在 QA 过程是没办法利用规则去校验的，只有等你触发 Husky 的 `commit-msg` 钩子才会进行校验，而`@commitlint/cz-commitlint` 可以在 QA 过程进行规则校验，其实如果不是拦截 `git commit` 操作，使用`@commitlint/cz-commitlint`可以不需要Husky的 `commit-msg` 钩子。

### 6. 更多操作

我们可以在git hook 做利用 shell 命令更多的操作，比如跑自动化测试、自动推拉代码等等。

这里介绍下推拉代码：

`npx husky add .husky/post-commit ''`，然后找到`.husky/post-commit`文件，我们往里面增加以下内容：

```bash
# 不能有空格
branch=$(git symbolic-ref --short -q HEAD)
git pull origin $branch
if [ "$?" == "0" ]; then
    git push origin $branch
    if [ "$?" == "0" ]; then
        echo "✨✨✨ 推送成功！"
    else 
        echo '推送代码失败！'
        exit 1
    fi
else 
    echo '拉取代码失败！'
    exit 1
fi
```

这样我们在提交完成之后会自动拉去当前代码分支的远程分支，并把本地该分支推送到远程对应分支。

## 总结

这篇我们讲了代码提交规范化，主要这些内容：

-   提交信息的 QA 过程
-   提交信息校验
-   如何拦截用户 `git commit` 操作
-   QA 过程语句配置的两种方式以及差异

## 参考链接

-   [@commitlint](https://commitlint.js.org/#/guides-local-setup)
-   [commitlint](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint)
-   [cz-customizable](https://github.com/leoforfree/cz-customizable)
