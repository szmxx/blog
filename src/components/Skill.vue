<template>
  <section>
    <template v-for="skill in SkillList" :key="skill.value">
      <h2 class="text-medium my-4 font-bold">{{ skill.label }}</h2>
      <div class="flex gap-2 flex-wrap">
        <template v-for="item in skill.children" :key="item.value">
          <h4 class="bg-color font-normal px-2 rounded">
            {{ item.label }}
          </h4>
        </template>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
const SkillList = [
  {
    label: "前端",
    value: "frontend",
    children: [
      {
        label: "Vue",
        value: "vue",
      },
      {
        label: "Nuxt",
        value: "nuxt",
      },
      {
        label: "微前端",
        value: "microfrontend",
      },
      {
        label: "低代码",
        value: "lowcode",
      },
      {
        label: "微信小程序",
        value: "miniprogram",
      },
      {
        label: "GIS",
        value: "gis",
      },
      {
        label: "Dojo",
        value: "dojo",
      },
      {
        label: "PWA",
        value: "pwa",
      },
    ],
  },
  {
    label: "后端",
    value: "backend",
    children: [
      {
        label: "NodeJS",
        value: "nodejs",
      },
      {
        label: "Koa",
        value: "koa",
      },
      {
        label: "Egg",
        value: "egg",
      },
      {
        label: "Nitro",
        value: "nitro",
      },
      {
        label: "Redis",
        value: "redis",
      },
      {
        label: "Prisma",
        value: "prisma",
      },
      {
        label: "TypeScript",
        value: "typescript",
      },
    ],
  },
  {
    label: "部署",
    value: "deploy",
    children: [
      {
        label: "Nginx",
        value: "nginx",
      },
      {
        label: "PM2",
        value: "pm2",
      },
      {
        label: "Docker",
        value: "docker",
      },
    ],
  },
  {
    label: "数据库",
    value: "database",
    children: [
      {
        label: "Mongo",
        value: "mongo",
      },
      {
        label: "PostgreSQL",
        value: "postgresql",
      },
      {
        label: "MySQL",
        value: "mysql",
      },
    ],
  },
  {
    label: "可视化",
    value: "visual",
    children: [
      {
        label: "Echarts",
        value: "echarts",
      },
      {
        label: "AntV",
        value: "antv",
      },
      {
        label: "L7",
        value: "l7",
      },
      {
        label: "地图可视化",
        value: "map",
      },
    ],
  },
  {
    label: "AI",
    value: "ai",
    children: [
      {
        label: "OpenAI",
        value: "openai",
      },
    ],
  },
  {
    label: "工程化",
    value: "project",
    children: [
      {
        label: "Rollup & Webpack & Vite & UnBuild",
        value: "build",
      },
      {
        label: "ESLint & Prettier & StyleLint",
        value: "lint",
      },
      {
        label: "Vitest",
        value: "vitest",
      },
      {
        label: "Husky & CommitLint & LintStaged",
        value: "commit",
      },
      {
        label: "MockJS & YApi & ApiFox",
        value: "mock",
      },
    ],
  },
];
</script>

<style scoped lang="scss"></style>
