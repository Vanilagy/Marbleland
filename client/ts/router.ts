import { createRouter, createWebHistory } from "vue-router";
import Home from '../vue/pages/Home.vue';
import Search from '../vue/pages/Search.vue';
import Level from '../vue/pages/Level.vue';
import SignUp from '../vue/pages/SignUp.vue';
import SignIn from '../vue/pages/SignIn.vue';
import Profile from '../vue/pages/Profile.vue';
import Upload from '../vue/pages/Upload.vue';
import Packs from '../vue/pages/Packs.vue';
import CreatePack from '../vue/pages/CreatePack.vue';
import Pack from '../vue/pages/Pack.vue';

const routes = [{
	path: '/',
	name: 'Home',
	component: Home
}, {
	path: '/search',
	name: 'Search',
	component: Search
}, {
	path: '/level/:id',
	name: 'Level',
	component: Level
}, {
	path: '/sign-up',
	name: 'SignUp',
	component: SignUp
}, {
	path: '/sign-in',
	name: 'SignIn',
	component: SignIn
}, {
	path: '/profile/:id',
	name: 'Profile',
	component: Profile
}, {
	path: '/upload',
	name: 'Upload',
	component: Upload
}, {
	path: '/packs',
	name: 'Packs',
	component: Packs
}, {
	path: '/create-pack',
	name: 'CreatePack',
	component: CreatePack
}, {
	path: '/pack/:id',
	name: 'Pack',
	component: Pack
}];

const router = createRouter({
	history: createWebHistory('/'),
	routes: routes as any
});

export default router;