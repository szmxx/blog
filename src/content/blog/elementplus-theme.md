---
title: 跟着 ElementPlus 学主题定制
description: ElementPlus 主题定制
pubDate: 'Jul 15 2022'
heroImage: '/blog-placeholder-2.jpg'
keywords: ElementPlus,源码
catalog: 前端
---

## 前言

最近看了下 `ElementPlus` 的源码，发现其主题定制挺有意思的，这篇文章就跟大家揭开一角。

## 主题定制方案

### CSS 优先级覆盖

利用CSS 的权重进行样式覆盖，达到主题切换的效果

### CSS 动态增减

动态加载样式

1、直接切换样式库。

2、通过`JavaScript`来切换样式规则。

```js
// 动态添加样式库
const link = document.createElement('link');
link.rel = "stylesheet";
link.type = "text/css";
link.href = linkUrl;
document.head.appendChild(link);

// 动态添加样式规则
const style = document.createElement('style');
style.innerHTML = styleRules;
document.head.appendChild(style);
```

### CSS 变量

通过定制变量，达到主题定制。

1、通过预处理器来定制变量。

2、通过 `Var` 来定制变量

ElementPlus 就基于 `Var`来实现主题的定制，下面详细介绍下它的解决方案。

## ElementPlus 主题定制

ElementPlus 主题定制我简单分为`变量配置`，`SCSS 函数`、`变量生成`、`主题切换`四个部分来开展。

### 变量配置

变量划分品牌色、背景色、字体颜色、边框颜色、填充颜色、遮罩颜色、覆盖颜色、字体、字体大小、字重、行高、层级、边框大小、边框弧度、边框样式、间距、禁用、阴影、过渡等等。这些都是设计的基础元素，详细可以看看我之前这篇[设计原则文章](https://juejin.cn/post/7171073305128992805)。

*以下变量经过改造，适配于项目：*

```scss
// 基础配置
$namespace: 'el' !default;
$font-family: (
  '':
  "Roboto, 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif",
);
$font-size: (
  'extra-large': 20px,
  'large': 18px,
  'medium': 16px,
  '': 14px,
  'small': 13px,
  'extra-small': 12px,
);
$font-weight: (
  'bolder': 600,
  'bold': 500,
  '': 400,
  'light': 300,
);
$line-height: (
  'large': 1.8em,
  'medium': 1.6em,
  '': 1.4em,
  'small': 1.2em,
);
$space: (
  'extra-large': 44px,
  'large': 32px,
  'medium': 24px,
  '': 16px,
  'small': 8px,
  'extra-small': 4px,
);
$z-index: (
  '': 1,
  'top': 1000,
  'popper': 2000,
);
$border-radius: (
  '': 4px,
  'medium': 8px,
  'round': 20px,
  'circle': 100%,
);
$border-width: (
  'large': 3px,
  'medium': 2px,
  '': 1px,
  'none': 0,
);

// 主题配置
$colors: (
  'white': #fff,
  'black': #000,
  'primary': #409eff,
  'success': #67c23a,
  'warning': #e6a23c,
  'error': #f56c6c,
  'info': #909399,
);
$text-color: (
  'primary': #303133,
  'regular': #606266,
  'secondary': #909399,
  'placeholder': #a8abb2,
);
$border-color: (
  '': #dcdfe6,
  'light': #e4e7ed,
  'lighter': #ebeef5,
  'extra-light': #f2f6fc,
  'dark': #d4d7de,
  'darker': #cdd0d6,
);
$bg-color: (
  '': #fff,
  'page': #f2f3f5,
  'overlay': #fff,
);
$box-shadow: (
  '': (
    0 12px 32px 4px rgb(0 0 0 / 4%),
    0 8px 20px rgb(0 0 0 / 8%),
  ),
  'light': (
    0 0 12px rgb(0 0 0 / 12%),
  ),
  'lighter': (
    0 0 6px rgb(0 0 0 / 12%),
  ),
  'dark': (
    0 16px 48px 16px rgb(0 0 0 / 8%),
    0 12px 32px rgb(0 0 0 / 12%),
    0 8px 16px -8px rgb(0 0 0 / 16%),
  ),
);
$fill-color: (
  '': #f0f2f5,
  'light': #f5f7fa,
  'lighter': #fafafa,
  'extra-light': #fafcff,
  'dark': #ebedf0,
  'darker': #e6e8eb,
  'blank': #fff,
);
```

### SCSS 函数

ElementPlus 利用了强大的`SCSS`函数来生成类名，并且使用`BEM`规范来规范类名命名，使得整体显得非常干净利落。下面介绍其中一些常用的函数（一些基础概念详见[官方文档](https://www.sass.hk/docs/)）。

```scss
// 连接类名，使用统一命名空间管控
// joinVarName(('button', 'text-color')) => '--el-button-text-color'
@function joinVarName($list) {
  $name: '' !default;
  @if config.$namespace != '' {
    $name: '--' + config.$namespace;
  } @else {
    $name: '-' + config.$namespace;
  }
  @each $item in $list {
    @if $item != '' {
      $name: $name + '-' + $item;
    }
  }
  @return $name;
}

// 生成 var 变量
// getCssVar('button', 'text-color') => var(--el-button-text-color)
@function getCssVar($args...) {
  @return var(#{joinVarName($args)});
}
// 获取规范类名
// getCssVarName(('button', 'text-color')) => '--el-button-text-color'
@function getCssVarName($args...) {
  @return joinVarName($args);
}
// 颜色转换
@function rgb2hex($color) {
  @return unquote('#' + #{string.slice(color.ie-hex-str($color), 4)});
}
                          
// 生成梯度颜色变量
@mixin set-color-mix-level(
  $type,
  $number,
  $mode: 'light',
  $mix-color: $color-white
) {
  // hex mix color
  $colors: map.deep-merge(
    (
      $type: (
        '#{$mode}-#{$number}':
          color.mix(
            $mix-color,
            map.get($colors, $type, 'base'),
            math.percentage(math.div($number, 10))
          ),
      ),
    ),
    $colors
  ) !global;
}
// 生成标准style规则
@mixin set-css-var-value($name, $value) {
  @if $value {
    #{joinVarName($name)}: #{$value};
  }
}
// 生成剃度颜色规则
@mixin set-css-color-type($colors, $type) {
  @include set-css-var-value(('color', $type), map.get($colors, $type, 'base'));

  @each $i in (3, 5, 7, 8, 9) {
    @include set-css-var-value(
      ('color', $type, 'light', $i),
      map.get($colors, $type, 'light-#{$i}')
    );
  }

  @include set-css-var-value(
    ('color', $type, 'dark-2'),
    map.get($colors, $type, 'dark-2')
  );
}
// 生成一系列标准组件规则
@mixin set-component-css-var($name, $variables) {
  @each $attribute, $value in $variables {
    @if $attribute == 'default' {
      #{getCssVarName($name)}: #{$value};
    } @else {
      #{getCssVarName($name, $attribute)}: #{$value};
    }
  }
}
```

### 变量生成

1、生成`SCSS`变量，利用`map.merge`来合并之前配置变量

2、利用`SCSS`函数生成`Var`变量

```scss
@use 'sass:map';
@use 'config' as config;

// zIndex
$z-index: () !default;
$z-index: map.merge(config.$z-index, $z-index);

// Typography
$font-family: () !default;
$font-family: map.merge(config.$font-family, $font-family);
$font-size: () !default;
$font-size: map.merge(config.$font-size, $font-size);
$font-weight: () !default;
$font-weight: map.merge(config.$font-weight, $font-weight);
$line-height: () !default;
$line-height: map.merge(config.$line-height, $line-height);

// Padding Margin
$space: () !default;
$space: map.merge(config.$space, $space);

// Border
$border-width: () !default;
$border-width: map.merge(config.$border-width, $border-width);
$border-radius: () !default;
$border-radius: map.merge(config.$border-radius, $border-radius);

$types: primary, success, warning, error, info;
$status: default, click, hover, active, focus, disable;
$colors: () !default;
@each $key, $value in config.$colors {
  @if $key != 'white' and $key != 'black' {
    $colors: map.deep-merge(
      (
        $key: (
          base: $value,
        ),
      ),
      $colors
    ) !global;
  } @else {
    $colors: map.deep-merge(
      (
        $key: $value,
      ),
      $colors
    ) !global;
  }
}

$color-white: map.get($colors, 'white') !default;
$color-black: map.get($colors, 'black') !default;
$text-color: () !default;
$text-color: map.merge(config.$text-color, $text-color);

// Border
$border-color-hover: getCssVar('text-color', 'disabled') !default;
$border-color: () !default;
$border-color: map.merge(config.$border-color, $border-color);

// Background
$bg-color: () !default;
$bg-color: map.merge(config.$bg-color, $bg-color);

// Box-shadow
$box-shadow: () !default;
$box-shadow: map.merge(config.$box-shadow, $box-shadow);

$fill-color: () !default;
$fill-color: map.merge(config.$fill-color, $fill-color);

@each $type in $types {
  @for $i from 1 through 9 {
    @include set-color-mix-level($type, $i, 'light', map.get($bg-color, ''));
  }
}

@each $type in $types {
  @include set-color-mix-level($type, 2, 'dark', $color-black);
}
```

```scss
:root[data-theme='default'] {
  @each $type in $types {
    @include set-css-color-type($colors, $type);
  }
  @include set-css-var-value('border-color-hover', $border-color-hover);
  @include set-component-css-var('text-color', $text-color);
  @include set-component-css-var('bg-color', $bg-color);
  @include set-component-css-var('border-color', $border-color);
  @include set-component-css-var('box-shadow', $box-shadow);
  @include set-component-css-var('fill-color', $fill-color);

  color-scheme: light;
}
```

```scss
$icon-filter: invert(100%);
$icon-filter-hover: invert(40%);
$img-filter: brightness(0.8) contrast(1.2);

:root[data-theme='dark'] {
  @each $type in $types {
    @include set-css-color-type($colors, $type);
  }
  @include set-css-var-value('border-color-hover', $border-color-hover);
  @include set-component-css-var('bg-color', $bg-color);
  @include set-component-css-var('text-color', $text-color);
  @include set-component-css-var('border-color', $border-color);
  @include set-component-css-var('box-shadow', $box-shadow);
  @include set-component-css-var('fill-color', $fill-color);

  color-scheme: dark;
}

// global style
html[data-theme='dark'] {
  img:not([src*='.svg']) {
    filter: $img-filter;
  }

  img[src*='.svg'] {
    filter: $icon-filter;
  }

  img[src*='.svg']:hover {
    filter: $icon-filter-hover;
  }
}
```

### 主题切换

1、异步加载所有的主题

2、根据当前系统，匹配不同的主题

3、提高 `useTheme`函数，手动切换主题，实现按需加载主题

```ts
let themes = import.meta.glob('@/theme/*/index.scss')
themes = Object.keys(themes).reduce(
  (acc: Record<string, () => Promise<unknown>>, cur) => {
    const name = cur.match(/.*/(.*)//)?.at(-1)
    if (name && !acc[name] && name !== 'common') {
      acc[name] = themes[cur]
    }
    return acc
  },
  {}
)
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
darkModeMediaQuery.addListener((e) => {
  useTheme(e.matches ? 'dark' : 'default')
})

export const currentTheme = ref(localStorage.getItem('theme') || 'default')

export async function useTheme(theme: string) {
  if (!theme) {
    theme = currentTheme.value
  } else {
    currentTheme.value = theme
  }
  document.documentElement?.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
  await themes?.[theme]?.()
}
```

### 最终结果

默认和暗黑主题`Var`变量

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c1fd43112ff94a42a3cb8c4db213c28f~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ecc4040f1ab34600a6108470cbc5c700~tplv-k3u1fbpfcp-zoom-1.image)

## 总结

本来通过剖析 ElementPlus 源码来解析其主题定制方案，主要涉及`变量配置`、`SCSS函数`、`变量生成`、`主题切换`四步，达到主题定制的效果。此外ElementPlus 广泛使用 `SCSS`，通过封装了一系列`SCSS函数`和 `Mixin`，结合命名空间、BEM规范等构建了一个完整的 CSS 工程化系统，值得我们更加深入的学习和应用。
