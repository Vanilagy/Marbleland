import { createStore } from "vuex";
import { LevelInfo } from "../../shared/types";

export const store = createStore({
	state: {
		currentLevelInfo: null as LevelInfo
	}
});