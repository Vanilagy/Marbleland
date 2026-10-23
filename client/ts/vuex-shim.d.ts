import { StoreType } from "./store";

declare module 'vue' {
	interface ComponentCustomProperties {
		$store: StoreType;
	}
}