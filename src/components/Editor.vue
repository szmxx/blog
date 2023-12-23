<template>
  <MdEditor :toolbars="toolbars" v-model="markdown" class="h-full! w-full!">
    <template #defToolbars>
      <Mark>
        <template #trigger>
          <div class="i-ion-md-color-wand"></div>
        </template>
      </Mark>
      <OriginalImg>
        <template #trigger>
          <div class="i-ion-ios-image"></div>
        </template>
      </OriginalImg>
      <div class="mt-1">
        <ExportPDF :modelValue="markdown"> </ExportPDF>
      </div>
      <ModalToolbar
        :visible="visible"
        modalTitle="导出Markdown"
        @click="onToggleModal"
        @close="onToggleModal"
      >
        <template #trigger>
          <div class="i-ion-logo-markdown"></div>
        </template>
        <form class="flex flex-col gap-2 sm:px-8 overflow-y-auto max-w-80vw">
          <div class="flex items-center gap-2">
            <label for="name" class="whitespace-nowrap">文件名称：</label>
            <input
              class="px-2 py-1 bg-color rounded w-full"
              type="text"
              id="name"
              name="name"
              placeholder="文件名称"
              v-model="model.name"
            />
          </div>
          <div class="flex items-center gap-2">
            <label for="title" class="whitespace-nowrap">文章名称：</label>
            <input
              class="px-2 py-1 bg-color rounded w-full"
              type="text"
              id="title"
              name="title"
              placeholder="文章名称"
              v-model="model.title"
            />
          </div>
          <div class="flex items-start gap-2">
            <label for="desc">文章描述：</label>
            <textarea
              class="px-2 py-1 bg-color rounded"
              row="4"
              id="desc"
              name="desc"
              placeholder="文章描述"
              v-model="model.desc"
            />
          </div>
          <div class="flex items-center gap-2">
            <div class="whitespace-nowrap">文章图片：</div>
            <input
              class="px-2 py-1 bg-color rounded w-full"
              type="text"
              id="hero"
              name="hero"
              placeholder="文章图片"
              v-model="model.hero"
            />
          </div>

          <div class="flex items-center gap-2">
            <label for="keywords" class="whitespace-nowrap">文章标签：</label>
            <input
              class="px-2 py-1 bg-color rounded w-full"
              type="text"
              id="keywords"
              name="keywords"
              placeholder="文章标签"
              v-model="model.keywords"
            />
          </div>
          <div class="flex items-center gap-2">
            <label for="catalog" class="whitespace-nowrap">文章分类：</label>
            <input
              class="px-2 py-1 bg-color rounded w-full"
              type="text"
              id="catalog"
              name="catalog"
              placeholder="文章分类"
              v-model="model.catalog"
            />
          </div>
          <div class="flex items-center gap-2">
            <div>发布时间：</div>
            <input type="date" v-model="model.date" />
          </div>
          <div
            @click="onExportMarkdown"
            class="bg-primary text-white py-1 rounded mt-4 text-center cursor-pointer"
          >
            导出 Markdown
          </div>
        </form>
      </ModalToolbar>
    </template>
  </MdEditor>
</template>

<script setup lang="ts">
import { MdEditor, config, ModalToolbar } from "md-editor-v3";
import { ExportPDF } from "@vavt/v3-extension";
import "md-editor-v3/lib/style.css";
import "@vavt/v3-extension/lib/asset/style.css";
import { Mark } from "@vavt/v3-extension";
import MarkExtension from "markdown-it-mark";
import { OriginalImg } from "@vavt/v3-extension";
import { ref } from "vue";
import { saveAs } from "@/utils";
import { ColorList } from "@/config";

config({
  markdownItConfig(md) {
    md.use(MarkExtension);
  },
});

const markdown = ref("");
const toolbars = [
  "bold",
  "underline",
  "italic",
  "strikeThrough",
  0,
  1,
  "sub",
  "sup",
  "quote",
  "orderedList",
  "task", // ^2.4.0
  "image",
  "table",
  "mermaid",
  "katex",
  "revoke",
  "next",
  "save",
  "=",
  "pageFullscreen",
  "preview",
  "catalog",
  2,
  3,
];

const visible = ref(false);

function onToggleModal() {
  visible.value = !visible.value;
}

const model = ref({
  name: "",
  title: "",
  desc: "",
  date: new Date(),
  hero: "",
  keywords: [],
  catalog: "",
});
function onExportMarkdown() {
  const {
    title = "",
    name = "",
    desc = "",
    date = new Date(),
    catalog = "",
    keywords = [],
    hero = "",
  } = model.value;
  const prefix = `---
  title: ${title}
  description: ${desc}
  pubDate: ${date}
  heroImage: ${hero}
  keywords: ${keywords}
  catalog: ${catalog}
---

`;
  saveAs(`${name}.md`, prefix + markdown.value);
}
</script>
