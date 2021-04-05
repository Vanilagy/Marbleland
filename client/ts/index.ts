import * as Vue from 'vue';
import App from '../vue/App.vue';
import router from './router';

Vue.createApp(App as any).use(router).mount('#app');