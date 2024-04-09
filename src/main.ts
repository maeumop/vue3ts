import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
// import VueGtag from 'vue-gtag';
// import { createGtm } from '@gtm-support/vue-gtm';

import MessageBox from '@/components/MessageBox';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import EventPreventDom from '@/views/common/EventPreventDom';

import CheckButton from '@/components/Form/CheckButton/index.vue';
import DatePicker from '@/components/Form/DatePicker/index.vue';
import NumberFormat from '@/components/Form/NumberFormat/index.vue';
import SelectBox from '@/components/Form/SelectBox/index.vue';
import SwitchButton from '@/components/Form/SwitchButton/index.vue';
import TextField from '@/components/Form/TextField/index.vue';
import ValidateForm from '@/components/Form/ValidateForm/index.vue';
import ValidateWrap from '@/components/Form/ValidateWrap/index.vue';
import StyledButton from '@/components/StyledButton/index.vue';
import ListTable from '@/components/ListTable/index.vue';
import Pagination from '@/components/Pagination/index.vue';
import Tooltip from '@/components/Tooltip/index.vue';
import Tabs from '@/components/Tabs/index.vue';
import DropMenu from '@/components/DropMenu/index.vue';
import Modal from '@/components/Modal/index.vue';
import Badge from '@/components/Badge/index.vue';

import SvgIcon from '@jamescoyle/vue-icon';

// prototype types
import '@/js/prototype';

// style
import '@/assets/scss/main.scss';
// import '@/assets/style/index.scss'

// library
import { createPinia } from 'pinia';
const pinia = createPinia();

// const gtm = createGtm({
//   id: 'GTM-MSNQT8GH',
//   queryParams: {
//     gtm_auth: 'AB7cDEf3GHIjkl-MnOP8qr',
//     gtm_preview: 'env-4',
//     gtm_cookies_win: 'x',
//   },
//   defer: false,
//   compatibility: false,
//   nonce: '2726c7f26c',
//   enabled: true,
//   debug: true,
//   loadScript: true,
//   vueRouter: router,
// });


createApp(App)
  .use(router)
  .use(pinia)
  // .use(gtm)
  // .use(VueGtag, {
  //   appName: 'ad-solution-dev',
  //   pageTrackerScreenviewEnabled: true,
  //   config: {
  //     id: 'GTM-MSNQT8GH',
  //     params: {
  //       send_page_view: false,
  //     }
  //   },
  //   onReady: () => {
  //     console.log('onReady');
  //   },
  //   onAfterTrack: () => {
  //     console.log('onAfterTrack');
  //   }
  // }, router)
  .use(MessageBox)
  .use(Spinner)
  .use(Toast)
  .use(EventPreventDom)
  .component('SvgIcon', SvgIcon)
  .component('CheckButton', CheckButton)
  .component('DatePicker', DatePicker)
  .component('NumberFormat', NumberFormat)
  .component('SelectBox', SelectBox)
  .component('SwitchButton', SwitchButton)
  .component('TextField', TextField)
  .component('ValidateWrap', ValidateWrap)
  .component('ValidateForm', ValidateForm)
  .component('StyledButton', StyledButton)
  .component('ListTable', ListTable)
  .component('Pagination', Pagination)
  .component('Tooltip', Tooltip)
  .component('Tabs', Tabs)
  .component('DropMenu', DropMenu)
  .component('Modal', Modal)
  .component('Badge', Badge)
  .mount('#app');
