<template>
  <ul style="list-style: none" class="flex gap-4 flex-col flex-1">
    <li v-for="post in list" :key="post.slug" class="bg-color rounded">
      <a
        :href="`/blog/${post.slug}/`"
        class="flex h-20 justify-between flex-nowrap"
      >
        <div class="flex flex-col justify-between p-2 w-full">
          <h4>{{ post.data.title }}</h4>
          <div class="flex gap-4">
            <p class="text-hint">{{ formatTime(post?.data?.pubDate) }}</p>
            <div class="flex gap-2">
              <a
                class="px-2 rounded min-w-10 text-center"
                v-for="(item, index) in post?.data?.keywords?.split(',')"
                :key="item"
                v-show="item"
                :href="`/tags/${item}`"
                :style="{ 'background-color': ColorList[index] }"
              >
                {{ item }}
              </a>
            </div>
          </div>
        </div>
        <img
          v-show="post.data.heroImage"
          class="max-w-30% object-cover p-2 rounded-3 min-w-20%"
          :src="post.data.heroImage"
          alt="加载失败"
      /></a>
    </li>
  </ul>
  <div class="flex items-center mt-4 gap-1">
    <div
      @click="onPrev"
      :class="{ 'disabled cursor-not-allowed': current === 1 }"
      class="px-2 py-1 bg-color rounded cursor-pointer"
    >
      <div class="i-ion-ios-arrow-left"></div>
    </div>

    <div
      class="px-3 py-1 rounded bg-color cursor-pointer"
      v-for="index in length"
      :key="index"
      @click="onCurrent(index)"
      :class="{ 'bg-primary text-white': current === index }"
    >
      {{ index }}
    </div>
    <div
      @click="onNext"
      :class="{ 'disabled cursor-not-allowed': current === length }"
      class="px-2 py-1 bg-color rounded cursor-pointer"
    >
      <div class="i-ion-ios-arrow-right"></div>
    </div>
  </div>
  <div
    class="text-stroke-1 select-none pointer-events-none text-stroke-gray/10 text-transparent text-60 <sm:text-30 font-bold absolute right-8 top-1/2"
  >
    {{ formatTime(list?.[0]?.data?.pubDate, "YYYY") }}
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { getCollection } from "astro:content";
import { formatTime } from "@/utils";

import { ColorList } from "@/config";

const posts = (await getCollection("blog")).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);

const current = ref(1);
const size = ref(5);
const total = ref(posts.length);
const length = ref(Math.ceil(total.value / size.value));

const list = computed(() => {
  return posts.slice(
    (current.value - 1) * size.value,
    current.value * size.value
  );
});

function onPrev() {
  if (current.value > 1) {
    current.value -= 1;
  }
}
function onNext() {
  if (current.value < length.value) {
    current.value += 1;
  }
}
function onCurrent(index: number) {
  current.value = index;
}
</script>
