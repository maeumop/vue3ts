import { ref, computed,  } from 'vue';
import { defineStore, } from 'pinia';
import type { MenuItem } from '@/types/common';
import { menuList, mediaMenuList, memberMenuList } from '@/data/menu';
import type { ProcessEnv } from '@/types/common';
import { CONST_CODES } from '@/constants/common';

const { VUE_APP_SESSION_STORAGE_AUTHLEVEL_KEY }: ProcessEnv = process.env;


export const useMenusStore = defineStore('menusStore', () => {
  const { AUTH } = CONST_CODES;

  const authLevel: string | null = sessionStorage.getItem(VUE_APP_SESSION_STORAGE_AUTHLEVEL_KEY);

  const menuHeight: number = 42;
  const menus = ref<MenuItem[]>([]);

  // menu 리스트 설정
  const setMenus = (): void => {
    if (authLevel === AUTH.MEDIA.VAL) {
      menus.value = mediaMenuList;
    } else if (authLevel === AUTH.MEMBER.VAL) {
      menus.value = memberMenuList;
    } else {
      menus.value = menuList;
    }
  };
  setMenus();

  const active: number[] = [-1, -1, -1];

  const getMenus = computed<MenuItem[]>(() => menus.value);


  /**
   * 메뉴 활성화 해제
   *
   */
  const releaseMenu = (menu: MenuItem[] = menus.value, depth: number = 0): void => {
    for (let i = 0; i < menu.length; i++) {
      if (menu[i].active) {
        menu[i].active = false;
        menu[i].height = 0;

        if (menu[i].children.length) {
          releaseMenu(menu[i].children, depth + 1);
          break;
        }
      }
    }
  };

  /**
   * 메뉴 활성화
   */
  const activeMenu = (): void => {
    releaseMenu();

    const [main, sub, final] = active;
    const mainMenu = menus.value[main];

    if (main > -1) {
      mainMenu.active = true;
      mainMenu.height = mainMenu.children.length * menuHeight;
    }

    const subMenu = mainMenu.children[sub];

    if (sub > -1) {
      subMenu.active = true;

      if (subMenu.children.length) {
        mainMenu.height += subMenu.children.length * menuHeight;
        subMenu.height = subMenu.children.length * menuHeight;
      }
    }

    if (final > -1) {
      const finalMenu = subMenu.children[final];
      finalMenu.active = true;
    }
  };

  /**
   * 활성화 메뉴 변수 세팅
   * @param depth 메뉴 깊이
   * @param index 선택된 메뉴 index
   */
  const setActive = (depth: number, index: number): void => {
    // 1차 메뉴 토글
    if (active[depth] === index) {
      if (menus.value[index].active) {
        menus.value[index].active = false;
      } else {
        activeMenu();
      }

      return;
    }

    active[depth] = index;

    if (depth === 0) {
      active[1] = -1;
      active[2] = -1;
    } else if (depth === 1) {
      active[2] = -1;
    }

    activeMenu();
  };

  /**
   * 화면 접근 (created status) 시 메뉴 active 설정
   * @param menu
   * @param depth 메뉴 깊이
   */
  const setActiveMenu = (menu: MenuItem[] = menus.value, depth: number = 1): void => {
    const path = location.pathname.split('/');

    for (let i = 0; i < menu.length; i++) {
      const item = menu[i];

      if (path[depth] === item.path) {
        active[depth - 1] = i;

        if (item.children.length) {
          setActiveMenu(item.children, depth + 1);
        } else {
          activeMenu();
        }

        break;
      }
    }
  };

  setActiveMenu(menus.value);

  return {
    menus,
    active,
    getMenus,
    setActive,
    setActiveMenu,
  };
});