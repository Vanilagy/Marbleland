import { createRouter, createWebHistory } from "vue-router";
import HomePage from '../vue/pages/HomePage.vue';
import SearchPage from '../vue/pages/SearchPage.vue';
import LevelPage from '../vue/pages/LevelPage.vue';
import SignUpPage from '../vue/pages/SignUpPage.vue';
import SignInPage from '../vue/pages/SignInPage.vue';
import ProfilePage from '../vue/pages/ProfilePage.vue';
import UploadPage from '../vue/pages/UploadPage.vue';
import PacksPage from '../vue/pages/PacksPage.vue';
import CreatePackPage from '../vue/pages/CreatePackPage.vue';
import PackPage from '../vue/pages/PackPage.vue';

const routes = [{
	path: '/',
	name: 'Home',
	component: HomePage
}, {
	path: '/search',
	name: 'Search',
	component: SearchPage
}, {
	path: '/level/:id',
	name: 'Level',
	component: LevelPage
}, {
	path: '/sign-up',
	name: 'SignUp',
	component: SignUpPage
}, {
	path: '/sign-in',
	name: 'SignIn',
	component: SignInPage
}, {
	path: '/profile/:id',
	name: 'Profile',
	component: ProfilePage
}, {
	path: '/upload',
	name: 'Upload',
	component: UploadPage
}, {
	path: '/packs',
	name: 'Packs',
	component: PacksPage
}, {
	path: '/create-pack',
	name: 'CreatePack',
	component: CreatePackPage
}, {
	path: '/pack/:id',
	name: 'Pack',
	component: PackPage
}];

const router = createRouter({
	history: createWebHistory('/'),
	routes: routes as any // Apparently this is the "solution" to the type issue here
});

export default router;