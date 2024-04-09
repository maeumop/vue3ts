<script setup lang="ts">
import { ref, } from 'vue';
import { mdiCog, mdiChevronDown } from '@/assets/svg/path';
import { accountMenu } from '@/data/menu';
import { useRouter } from 'vue-router';
import { useClientStore, useSessionStore } from '@/store';

const router = useRouter();
const sessionStore = useSessionStore();
const clientStore = useClientStore();

const props = withDefaults(defineProps<{
  title: string,
}>(), {
  title: 'DB관리',
});

let isShow = ref<boolean>(false);

const toggleMenu = (): void => {
  isShow.value = !isShow.value;
};

const closeMenu = () => {
  isShow.value = false;
};

const routing = (path: string): void => {
  if (!path) {
    clientStore.clear();
    sessionStore.clear();

    localStorage.clear();

    router.push('/');
  } else {
    router.push(path);
  }
};
</script>

<template>
  <div class="global-header">
    <h2>{{ props.title }}</h2>

    <div class="myMenu">
      <a
        href="#"
        @click.prevent="toggleMenu"
        @focusout="closeMenu"
      >
        <SvgIcon
          type="mdi"
          size="20"
          class="font-head mr-2"
          :path="mdiCog"
        />

        <span>{{ sessionStore.getMemberEmail }}</span>

        <SvgIcon
          type="mdi"
          size="20"
          :class="['font-large ml-2', isShow ? 'on' : '', 'arrow']"
          :path="mdiChevronDown"
        />
      </a>

      <Transition name="slide-down">
        <ul class="submenu" v-show="isShow">
          <li
            :key="`gnb-menu-${item.path}`"
            v-for="item in accountMenu"
          >
            <a href="#" @click.prevent="routing(item.path)">{{ item.menu }}</a>
          </li>
        </ul>
      </Transition>
    </div>
  </div>
</template>