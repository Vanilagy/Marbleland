import { createRouter, createWebHistory } from "vue-router";
import Search from '../vue/pages/Search.vue';
import Level from '../vue/pages/Level.vue';
import SignUp from '../vue/pages/SignUp.vue';
import SignIn from '../vue/pages/SignIn.vue';
import Profile from '../vue/pages/Profile.vue';
import Upload from '../vue/pages/Upload.vue';

const routes = [{
	path: '/',
	name: 'Home',
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
}];

const router = createRouter({
	history: createWebHistory('/'),
	routes: routes as any
});

export default router;