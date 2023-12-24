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
          <span class="text-primary"
            >[{{ catalogmap?.[catalog]?.length }}]</span
          >
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
          <span class="text-primary">[{{ tagmap?.[tag]?.length }}]</span>
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

const tagmap: Record<string, string[]> = {};
const catalogmap: Record<string, string[]> = {};

posts.forEach((post) => {
  const { keywords, catalog } = post?.data || {};
  if (keywords) {
    const tags = keywords?.split?.(",")?.filter((i) => i) || [];
    tags.forEach((tag) => {
      const taglist = tagmap[tag?.trim()] || [];
      taglist.push(post.slug);
      tagmap[tag] = taglist;
    });
  }
  if (catalog) {
    const cataloglist = catalogmap[catalog] || [];
    cataloglist.push(post.slug);
    catalogmap[catalog] = cataloglist;
  }
});
const tags = Object.keys(tagmap);
const catalogs = Object.keys(catalogmap);

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
