<template>
  <div class="flex gap-4 flex-wrap">
    <a
      :href="item.link"
      target="_blank"
      v-for="item in projectList"
      class="p-4 min-w-1/4 sm:flex-1 <sm:w-full relative rounded bg-color gap-y-2 flex flex-col justify-between"
      :key="item.value"
    >
      <div class="flex-1">
        <h3>{{ item.label }}</h3>
        <div class="text-hint">{{ item.desc }}</div>
      </div>
      <img class="object-cover rounded-2" :src="item.img" />
    </a>
  </div>
</template>

<script setup lang="ts">
const projectList = [
  {
    label: "通用脚手架",
    desc: "通用脚手架工具，支持Vue、Nuxt、Node等框架，可选主题定制、国际化以及UI框架等，助力项目的快速开发和构建",
    value: "ucli",
    img: "https://raw.githubusercontent.com/szmxx/blog-imgs/main/66.awebp",
    link: "https://github.com/szmxx/ucli",
  },
  {
    label: "微信聊天生成器",
    desc: "微信聊天生成器，支持安卓、苹果样式切换、红包语音视频消息、单聊和群组模式以及图片和视频导出",
    img: "https://raw.githubusercontent.com/szmxx/blog-imgs/main/11.png",
    value: "chat",
    link: "https://github.com/szmxx/chat",
  },
  {
    label: "商城后台管理系统",
    desc: "商城后台管理系统，设计功能丰富，支持商品管理、店铺管理、订单管理、营销管理、权限管理、监控管理。此外采用新技术开发，极大降低开发和后期维护成本",
    img: "https://raw.githubusercontent.com/szmxx/blog-imgs/main/22.png",
    value: "mall",
    link: "https://github.com/szmxx/backend-mall",
  },
  {
    label: "商城后端服务",
    desc: "采用 nitro 框架开发，结合 prisma、postgresql，极大提升开发体验",
    img: "",
    value: "mallbackend",
    link: "https://github.com/szmxx/backend-node",
  },
  {
    label: "AI WebUI",
    desc: "AI UI 套壳工具，支持GPT3.5、GPT4等模型，流式输出、会话管理和记录、角色管理和Prompt优化、知识库管理、文生图、导出图片和视频等",
    img: "https://raw.githubusercontent.com/szmxx/blog-imgs/main/33.awebp",
    value: "ai",
    link: "https://github.com/szmxx/ai",
  },
  {
    label: "每日备忘",
    desc: "个人管理工具，支持每日任务记录和灵感分享，包含社区浏览、灵感发现、历史记录",
    img: "https://raw.githubusercontent.com/szmxx/blog-imgs/main/44.png",
    value: "chat",
    link: "https://github.com/szmxx/daily-app",
  },
  {
    label: "博客",
    desc: "采用 Astro 构建，支持文章的收录、搜索和发布，个人简历、项目记录",
    img: "https://raw.githubusercontent.com/szmxx/blog-imgs/main/99.png",
    value: "chat",
    link: "https://github.com/szmxx/blog",
  },
  {
    label: "馋铺",
    desc: "美食和零食社区，用户可以自行创建、搜索、浏览、收录美食和零食。用户可以热度、最新、推荐和附近查询不同的美食和零食",
    img: "https://raw.githubusercontent.com/szmxx/blog-imgs/main/77.jpeg",
    value: "chanpu",
    link: "https://github.com/szmxx/chanpu",
  },
  {
    label: "木鱼",
    desc: "微信小程序工具，木鱼净心，包括每日打卡，自动敲木鱼、沐浴佛经，佛经查看和切换等",
    img: "https://raw.githubusercontent.com/szmxx/blog-imgs/main/55.png",
    value: "chanpu",
    link: "https://github.com/szmxx/chanpu",
  },
];
</script>

<style scoped lang="scss"></style>
