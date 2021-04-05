/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = Vue;

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _App_vue_vue_type_template_id_1ddc9ec2_scoped_true__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _App_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _App_vue_vue_type_style_index_0_id_1ddc9ec2_lang_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(14);
/* harmony import */ var _App_vue_vue_type_style_index_1_id_1ddc9ec2_scoped_true_lang_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(16);




;

_App_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_1__.default.render = _App_vue_vue_type_template_id_1ddc9ec2_scoped_true__WEBPACK_IMPORTED_MODULE_0__.render
_App_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_1__.default.__scopeId = "data-v-1ddc9ec2"
/* hot reload */
if (false) {}

_App_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_1__.default.__file = "client/vue/App.vue"

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_App_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_1__.default);

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_1_node_modules_vue_loader_dist_index_js_ruleSet_1_rules_4_use_0_App_vue_vue_type_template_id_1ddc9ec2_scoped_true__WEBPACK_IMPORTED_MODULE_0__.render)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_1_node_modules_vue_loader_dist_index_js_ruleSet_1_rules_4_use_0_App_vue_vue_type_template_id_1ddc9ec2_scoped_true__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vue__WEBPACK_IMPORTED_MODULE_0__);

const _withId = /*#__PURE__*/(0,vue__WEBPACK_IMPORTED_MODULE_0__.withScopeId)("data-v-1ddc9ec2")

;(0,vue__WEBPACK_IMPORTED_MODULE_0__.pushScopeId)("data-v-1ddc9ec2")
const _hoisted_1 = {
  key: 0,
  id: "center"
}
const _hoisted_2 = { class: "levels" }
;(0,vue__WEBPACK_IMPORTED_MODULE_0__.popScopeId)()

const render = /*#__PURE__*/_withId(function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_search_bar = (0,vue__WEBPACK_IMPORTED_MODULE_0__.resolveComponent)("search-bar")
  const _component_level_panel = (0,vue__WEBPACK_IMPORTED_MODULE_0__.resolveComponent)("level-panel")

  return (_ctx.levelList)
    ? ((0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createBlock)("div", _hoisted_1, [
        (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_component_search_bar, {
          onQueryChange: _ctx.onQueryChange,
          ref: "cuck"
        }, null, 8 /* PROPS */, ["onQueryChange"]),
        (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", _hoisted_2, [
          ((0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(true), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createBlock)(vue__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,vue__WEBPACK_IMPORTED_MODULE_0__.renderList)(_ctx.shownLevels, (entry) => {
            return ((0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createBlock)(_component_level_panel, {
              key: entry.id,
              levelEntry: entry
            }, null, 8 /* PROPS */, ["levelEntry"]))
          }), 128 /* KEYED_FRAGMENT */))
        ])
      ]))
    : (0,vue__WEBPACK_IMPORTED_MODULE_0__.createCommentVNode)("v-if", true)
})

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* reexport safe */ _node_modules_ts_loader_index_js_clonedRuleSet_2_node_modules_vue_loader_dist_index_js_ruleSet_1_rules_4_use_0_App_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_0__.default)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_2_node_modules_vue_loader_dist_index_js_ruleSet_1_rules_4_use_0_App_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
 

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vue__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _SearchBar_vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7);
/* harmony import */ var _LevelPanel_vue__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(18);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (vue__WEBPACK_IMPORTED_MODULE_0___default().defineComponent({
    components: {
        SearchBar: _SearchBar_vue__WEBPACK_IMPORTED_MODULE_1__.default,
        LevelPanel: _LevelPanel_vue__WEBPACK_IMPORTED_MODULE_2__.default
    },
    data() {
        return {
            levelList: null,
            shownLevels: []
        };
    },
    async created() {
        let response = await fetch('/api/list');
        let levelList = await response.json();
        this.levelList = levelList;
        this.onQueryChange("");
    },
    methods: {
        onQueryChange(query) {
            this.shownLevels = this.levelList.filter(x => x.name.toLowerCase().includes(query.toLowerCase())).slice(0, 50);
        }
    }
}));


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _SearchBar_vue_vue_type_template_id_3b7c922c__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _SearchBar_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(10);
/* harmony import */ var _SearchBar_vue_vue_type_style_index_0_id_3b7c922c_lang_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(12);




;
_SearchBar_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_1__.default.render = _SearchBar_vue_vue_type_template_id_3b7c922c__WEBPACK_IMPORTED_MODULE_0__.render
/* hot reload */
if (false) {}

_SearchBar_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_1__.default.__file = "client/vue/SearchBar.vue"

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_SearchBar_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_1__.default);

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_1_node_modules_vue_loader_dist_index_js_ruleSet_1_rules_4_use_0_SearchBar_vue_vue_type_template_id_3b7c922c__WEBPACK_IMPORTED_MODULE_0__.render)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_1_node_modules_vue_loader_dist_index_js_ruleSet_1_rules_4_use_0_SearchBar_vue_vue_type_template_id_3b7c922c__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vue__WEBPACK_IMPORTED_MODULE_0__);


const _hoisted_1 = /*#__PURE__*/(0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("img", { src: "/assets/svg/search_black_24dp.svg" }, null, -1 /* HOISTED */)

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return ((0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createBlock)("div", {
    class: ["search-bar", { active: _ctx.focused }]
  }, [
    _hoisted_1,
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.withDirectives)((0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("input", {
      type: "text",
      placeholder: "Search for level",
      "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => (_ctx.searchQuery = $event)),
      onFocus: _cache[2] || (_cache[2] = $event => (_ctx.focused = true)),
      onBlur: _cache[3] || (_cache[3] = $event => (_ctx.focused = false))
    }, null, 544 /* HYDRATE_EVENTS, NEED_PATCH */), [
      [vue__WEBPACK_IMPORTED_MODULE_0__.vModelText, _ctx.searchQuery]
    ])
  ], 2 /* CLASS */))
}

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* reexport safe */ _node_modules_ts_loader_index_js_clonedRuleSet_2_node_modules_vue_loader_dist_index_js_ruleSet_1_rules_4_use_0_SearchBar_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_0__.default)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_2_node_modules_vue_loader_dist_index_js_ruleSet_1_rules_4_use_0_SearchBar_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(11);
 

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vue__WEBPACK_IMPORTED_MODULE_0__);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (vue__WEBPACK_IMPORTED_MODULE_0___default().defineComponent({
    data() {
        return {
            searchQuery: '',
            focused: false
        };
    },
    watch: {
        searchQuery() {
            this.$emit('queryChange', this.searchQuery);
        }
    },
    computed: {
        styleObject() {
            return {
                'background': this.focused ? 'red' : ''
            };
        }
    }
}));


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_dist_stylePostLoader_js_node_modules_vue_loader_dist_index_js_ruleSet_1_rules_4_use_0_SearchBar_vue_vue_type_style_index_0_id_3b7c922c_lang_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_dist_stylePostLoader_js_node_modules_vue_loader_dist_index_js_ruleSet_1_rules_4_use_0_App_vue_vue_type_style_index_0_id_1ddc9ec2_lang_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(15);


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_dist_stylePostLoader_js_node_modules_vue_loader_dist_index_js_ruleSet_1_rules_4_use_0_App_vue_vue_type_style_index_1_id_1ddc9ec2_scoped_true_lang_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(17);


/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _LevelPanel_vue_vue_type_template_id_0b96a662_scoped_true__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(23);
/* harmony import */ var _LevelPanel_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(21);
/* harmony import */ var _LevelPanel_vue_vue_type_style_index_0_id_0b96a662_scoped_true_lang_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(19);




;
_LevelPanel_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_1__.default.render = _LevelPanel_vue_vue_type_template_id_0b96a662_scoped_true__WEBPACK_IMPORTED_MODULE_0__.render
_LevelPanel_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_1__.default.__scopeId = "data-v-0b96a662"
/* hot reload */
if (false) {}

_LevelPanel_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_1__.default.__file = "client/vue/LevelPanel.vue"

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_LevelPanel_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_1__.default);

/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_dist_stylePostLoader_js_node_modules_vue_loader_dist_index_js_ruleSet_1_rules_4_use_0_LevelPanel_vue_vue_type_style_index_0_id_0b96a662_scoped_true_lang_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(20);


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* reexport safe */ _node_modules_ts_loader_index_js_clonedRuleSet_2_node_modules_vue_loader_dist_index_js_ruleSet_1_rules_4_use_0_LevelPanel_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_0__.default)
/* harmony export */ });
/* harmony import */ var _node_modules_ts_loader_index_js_clonedRuleSet_2_node_modules_vue_loader_dist_index_js_ruleSet_1_rules_4_use_0_LevelPanel_vue_vue_type_script_lang_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(22);
 

/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vue__WEBPACK_IMPORTED_MODULE_0__);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (vue__WEBPACK_IMPORTED_MODULE_0___default().defineComponent({
    props: {
        levelEntry: {
            type: Object
        }
    },
    computed: {
        imageSource() {
            return `/api/level/${this.levelEntry.id}/image`;
        }
    }
}));


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_1_node_modules_vue_loader_dist_index_js_ruleSet_1_rules_4_use_0_LevelPanel_vue_vue_type_template_id_0b96a662_scoped_true__WEBPACK_IMPORTED_MODULE_0__.render)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_1_node_modules_vue_loader_dist_index_js_ruleSet_1_rules_4_use_0_LevelPanel_vue_vue_type_template_id_0b96a662_scoped_true__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(24);


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vue__WEBPACK_IMPORTED_MODULE_0__);

const _withId = /*#__PURE__*/(0,vue__WEBPACK_IMPORTED_MODULE_0__.withScopeId)("data-v-0b96a662")

;(0,vue__WEBPACK_IMPORTED_MODULE_0__.pushScopeId)("data-v-0b96a662")
const _hoisted_1 = { class: "outer" }
const _hoisted_2 = { class: "bottom" }
const _hoisted_3 = { class: "name" }
const _hoisted_4 = { class: "artist" }
;(0,vue__WEBPACK_IMPORTED_MODULE_0__.popScopeId)()

const render = /*#__PURE__*/_withId(function render(_ctx, _cache, $props, $setup, $data, $options) {
  return ((0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createBlock)("div", _hoisted_1, [
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("img", { src: _ctx.imageSource }, null, 8 /* PROPS */, ["src"]),
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", _hoisted_2, [
      (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", _hoisted_3, (0,vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString)(_ctx.levelEntry.name), 1 /* TEXT */),
      (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", _hoisted_4, (0,vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString)(_ctx.levelEntry.artist), 1 /* TEXT */)
    ])
  ]))
})

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vue__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _vue_App_vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);


vue__WEBPACK_IMPORTED_MODULE_0__.createApp(_vue_App_vue__WEBPACK_IMPORTED_MODULE_1__.default).mount('#app');

})();

/******/ })()
;