// scss
import '@/assets/scss/index.scss';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';

// main imports
import Vue from 'vue';
import Root from '@/views/root';
import router from './router';
import { store } from './store';

// vue plugins
import vuetify from './plugins/vuetify';
import i18n from './plugins/i18n';

// @/lib/vue components
import Notifications from '@/lib/vue/vue-notification';

Vue.use(Notifications);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(Root),
}).$mount('#app');
