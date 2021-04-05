import * as Vue from 'vue';
import App from '../vue/App.vue';
import router from './router';
import { store } from './store';

Vue.createApp(App as any).use(router).use(store).mount('#app');