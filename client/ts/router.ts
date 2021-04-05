import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Search from '../vue/pages/Search.vue';
import Level from '../vue/pages/Level.vue';

const routes = [{
	path: '/',
	name: 'Home',
	component: Search
}, {
	path: '/level/:id',
	name: 'Level',
	component: Level
}];

const router = createRouter({
	history: createWebHistory('/'),
	routes: routes as any
});

export default router;