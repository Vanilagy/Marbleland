import { createApp } from '../../shared/app';
import { store } from './store';

let { app } = createApp();
if ((window as any)["INITIAL_STATE"]) store.replaceState((window as any)["INITIAL_STATE"]);

app.mount('#app');