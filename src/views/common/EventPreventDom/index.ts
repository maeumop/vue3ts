import { h, render, isVNode } from 'vue';
import type { App, VNode } from 'vue';
import type { EventPreventDomOption, EventPreventDomModel } from '@/types/common/EventPreventDom';
import EventPreventDomCompnent from './index.vue';

export default {
  install(app: App) {
    const body = document.querySelector('body') as HTMLBodyElement;
    let VNode: VNode | null = null;

    const destroy = (): void => {
      render(null, body);
      VNode = null;
    };

    const call = async (opt: (() => any) | EventPreventDomOption): Promise<void> => {
      const props: EventPreventDomOption = {
        delay: -1,
      };

      if (opt instanceof Function) {
        props.callback = () => opt();
      } else if (opt instanceof Object) {
        const { callback, ...arg } = opt;
        Object.assign(props, arg);
        if (callback instanceof Function) {
          props.callback = () => callback();
        }
      }

      if (!isVNode(VNode)) {
        VNode = h(EventPreventDomCompnent, props);
        await render(VNode, body);
      }

      try {
        await VNode.component?.exposed?.onDo();
      } catch (err: any) {
        let e: Error = new Error('고객센터에 문의를 남겨주세요.');
        if (err instanceof Error) {
          e = err;
        }

        return Promise.reject(e);
      } finally {
        destroy();
      }
    };

    const eventPreventDom: EventPreventDomModel = {
      call,
    };

    app.provide('EventPreventDom', eventPreventDom);
  },
};
