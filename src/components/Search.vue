<template>
  <a @click="toggleDialog" class="i-ion-search cursor-pointer"></a>
  <div
    v-show="visible"
    @click="toggleDialog"
    class="fixed center top-0 left-0 w-full h-full bg-dark/20 backdrop-blur-2 z-99"
  >
    <div
      @click.stop="void 0"
      class="bg-color p-4 top-60px w-1/3 <lg:w-60% <sm:w-90% absolute rounded flex flex-col gap-y-4"
    >
      <div class="flex gap-x-2 items-center">
        <input
          ref="inputref"
          v-model="inputVal"
          autofocus
          class="w-full py-1 px-2 rounded bg-default"
          placeholder="请输入搜索内容"
          @input="onInput"
        />
        <button @click="onClear" class="whitespace-nowrap text-primary">
          清除
        </button>
      </div>
      <div v-if="loading" class="text-hint text-sm">结果搜索中...</div>
      <div
        v-if="resultList.length"
        class="flex flex-col gap-4 max-h-75vh overflow-y-auto"
      >
        <div class="text-hint text-sm">
          共有 {{ resultList.length }} 条搜索结果
        </div>
        <a
          class="bg-default p-2 rounded"
          :href="item.url"
          v-for="item in resultList"
          :key="item.id"
        >
          <h3 class="flex gap-2">
            {{ item.title }}
            <div v-if="item.url?.startsWith('/catalogs')">
              <span class="px-1 py-0.5 bg-primary text-sm text-white rounded">
                分类
              </span>
            </div>
            <div v-if="item.url?.startsWith('/tags')">
              <span class="px-1 py-0.5 bg-primary text-sm text-white rounded">
                标签
              </span>
            </div>
          </h3>
          <p v-html="item.excerpt"></p>
        </a>
      </div>
      <div v-else class="center p-4 text-hint flex flex-col gap-2">
        <div class="i-ion-file-tray-outline text-xl"></div>
        <div class="text-sm">暂无搜索结果</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const visible = ref(false);
const inputref = ref();
function toggleDialog() {
  visible.value = !visible.value;
  if (visible.value) {
    setTimeout(() => {
      inputref?.value?.focus?.();
    });
  }
}

const inputVal = ref("");
function onClear() {
  inputVal.value = "";
  resultList.value = [];
}

const resultList = ref<Record<string, string>[]>([]);
const loading = ref(false);
async function onInput(evt: Event) {
  const el = evt.target as HTMLInputElement;
  if (el.dataset.loaded !== "true") {
    el.dataset.loaded = "true";
    // @ts-ignore
    window.pagefind = await import("/pagefind/pagefind.js");
  }
  resultList.value = [];
  loading.value = true;
  try {
    // @ts-ignore
    const search = await window?.pagefind?.search?.(el?.value);
    for (const result of search?.results || []) {
      const data = await result.data();
      resultList.value.push({
        id: crypto.randomUUID(),
        url: data.url,
        title: data.meta.title,
        excerpt: data.excerpt,
      });
    }
  } catch {
  } finally {
    loading.value = false;
  }
}
</script>
