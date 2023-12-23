<template>
  <div class="flex flex-col gap-4">
    <input
      v-model="inputVal"
      class="bg-color px-2 py-1 w-fit"
      placeholder="请输入搜索分类/标签"
      @input="onInput"
    />
    <div v-show="inputVal" class="text-hint text-sm">
      共有 {{ uniqueTags.length + uniqueCatalogs.length }} 条搜索结果
    </div>
    <div class="flex gap-4 flex-col">
      <h2>分类</h2>
      <div v-if="uniqueCatalogs.length" class="flex gap-4 flex-wrap">
        <a
          :href="`/catalogs/${catalog}`"
          class="bg-color px-2 py-1 min-w-10 rounded cursor-pointer text-center"
          v-for="catalog in uniqueCatalogs"
          :key="catalog"
        >
          {{ catalog }}
        </a>
      </div>
      <div v-else class="center p-4 text-hint flex flex-col gap-2">
        <div class="i-ion-file-tray-outline text-xl"></div>
        <div class="text-sm">暂无分类结果</div>
      </div>
      <h2>标签</h2>
      <div v-if="uniqueTags.length" class="flex gap-4 flex-wrap">
        <a
          :href="`/tags/${tag}`"
          class="bg-color px-2 py-1 min-w-10 rounded cursor-pointer text-center"
          v-for="tag in uniqueTags"
          :key="tag"
        >
          {{ tag }}
        </a>
      </div>
      <div v-else class="center p-4 text-hint flex flex-col gap-2">
        <div class="i-ion-file-tray-outline text-xl"></div>
        <div class="text-sm">暂无标签结果</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { getCollection } from "astro:content";

const posts = await getCollection("blog");

let tags: string[] = [];
let catalogs: string[] = [];
posts.map((post) => {
  if (post?.data?.keywords) {
    const keywords = post?.data?.keywords?.split?.(",")?.filter((i) => i) || [];
    tags.push(...keywords);
  }
  if (post?.data?.catalog) {
    catalogs.push(post?.data?.catalog);
  }
});
tags = Array.from(new Set(tags));
catalogs = Array.from(new Set(catalogs));

const uniqueTags = ref(tags);
const uniqueCatalogs = ref(catalogs);
const inputVal = ref("");
function onInput() {
  uniqueTags.value = tags.filter((tag) =>
    tag.toLocaleLowerCase().includes(inputVal.value.toLocaleLowerCase())
  );
  uniqueCatalogs.value = catalogs.filter((catalog) =>
    catalog.toLocaleLowerCase().includes(inputVal.value.toLocaleLowerCase())
  );
}
</script>
