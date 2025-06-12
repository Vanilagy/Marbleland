import { createMemoryHistory, createRouter, createWebHistory } from "vue-router";
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
import NotFoundPage from '../vue/pages/NotFoundPage.vue';
import AboutUploadPage from '../vue/pages/AboutUploadPage.vue';
import ChangePasswordPage from '../vue/pages/ChangePasswordPage.vue';
import ProtocolErrorPage from '../vue/pages/ProtocolErrorPage.vue';
import ContentGuidelinesPage from "../vue/pages/ContentGuidelinesPage.vue";
import EmailVerificationPage from '../vue/pages/EmailVerificationPage.vue';
import ForgotPasswordPage from '../vue/pages/ForgotPasswordPage.vue';
import ResetPasswordPage from '../vue/pages/ResetPasswordPage.vue';
import SupportPage from '../vue/pages/SupportPage.vue';

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
	path: '/verify-email',
	name: 'EmailVerification',
	component: EmailVerificationPage
}, {
	path: '/forgot-password',
	name: 'ForgotPassword',
	component: ForgotPasswordPage
}, {
	path: '/reset-password',
	name: 'ResetPassword',
	component: ResetPasswordPage
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
}, {
	path: '/:pathMatch(.*)*',
	name: 'NotFound',
	component: NotFoundPage
}, {
	path: '/about-upload',
	name: 'AboutUpload',
	component: AboutUploadPage
}, {
	path: '/content-guidelines',
	name: 'ContentGuidelines',
	component: ContentGuidelinesPage
}, {
	path: '/change-password',
	name: 'ChangePassword',
	component: ChangePasswordPage
}, {
	path: '/protocol-error/:id',
	name: 'ProtocolError',
	component: ProtocolErrorPage
}, {
	path: '/support',
	name: 'Support',
	component: SupportPage
}];

const isServer = typeof window === 'undefined';

export const createNewRouter = () => {
	const router = createRouter({
		history: isServer? createMemoryHistory() : createWebHistory('/'),
		routes: routes as any // Apparently this is the "solution" to the type issue here
	});
	return router;
};