module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Component;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util__ = __webpack_require__(3);
/**
 * The basic idea behind Component is marking on prototype
 * and then process these marks to collect options and modify class/instance.
 *
 * A decorator will mark `internalKey` on prototypes, storgin meta information
 * Then register `DecoratorProcessor` on Component, which will be called in `Component` decorator
 * `DecoratorProcessor` can execute custom logic based on meta information stored before
 *
 * For non-annotated fields, `Component` will treat them as `methods` and `computed` in `option`
 * instance variable is treated as the return value of `data()` in `option`
 *
 * So a `DecoratorProcessor` may delete fields on prototype and instance,
 * preventing meta properties like lifecycle and prop to pollute `method` and `data`
 */


// option is a full-blown Vue compatible option
// meta is vue.ts specific type for annotation, a subset of option
function makeOptionsFromMeta(meta, name) {
    meta.name = meta.name || name;
    for (var _i = 0, _a = ['props', 'computed', 'watch', 'methods']; _i < _a.length; _i++) {
        var key = _a[_i];
        if (!__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__util__["d" /* hasOwn */])(meta, key)) {
            meta[key] = {};
        }
    }
    return meta;
}
// given a vue class' prototype, return its internalKeys and normalKeys
// internalKeys are for decorators' use, like $$Prop, $$Lifecycle
// normalKeys are for methods / computed property
function getKeys(cls, Super) {
    var proto = cls.prototype;
    var _a = [cls, proto, Super].map(Object.getOwnPropertyNames), clsKeys = _a[0], protoKeys = _a[1], superKeys = _a[2];
    var internalKeys = [];
    var normalKeys = [];
    var optionKeys = clsKeys.diff(superKeys);
    for (var _i = 0, protoKeys_1 = protoKeys; _i < protoKeys_1.length; _i++) {
        var key = protoKeys_1[_i];
        if (key === 'constructor') {
            continue;
        }
        else if (key.substr(0, 2) === '$$') {
            internalKeys.push(key);
        }
        else {
            normalKeys.push(key);
        }
    }
    return {
        internalKeys: internalKeys, normalKeys: normalKeys, optionKeys: optionKeys
    };
}
var registeredProcessors = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__util__["a" /* createMap */])();
// delegate to processor
function collectInternalProp(propKey, proto, instance, optionsToWrite) {
    var processor = registeredProcessors[propKey];
    if (!processor) {
        return;
    }
    processor(proto, instance, optionsToWrite);
}
// un-annotated and undeleted methods/getters are handled as `methods` and `computed`
function collectMethodsAndComputed(propKey, proto, optionsToWrite) {
    var descriptor = Object.getOwnPropertyDescriptor(proto, propKey);
    if (!descriptor) {
        return;
    }
    if (typeof descriptor.value === 'function') {
        optionsToWrite.methods[propKey] = descriptor.value;
    }
    else if (descriptor.get || descriptor.set) {
        optionsToWrite.computed[propKey] = {
            get: descriptor.get,
            set: descriptor.set,
        };
    }
}
// find all undeleted instance property as the return value of data()
// need to remove Vue keys to avoid cyclic references
function collectData(cls, instance, keys, optionsToWrite) {
    // already implemented by @Data
    if (optionsToWrite.data)
        return;
    var obj = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__util__["a" /* createMap */])();
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var key = keys_1[_i];
        obj[key] = instance[key];
    }
    // what a closure! :(
    optionsToWrite.data = function () {
        if (this === undefined) {
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__util__["c" /* objAssign */])({}, obj);
        }
        var selfData = {};
        var vm = this;
        var insKeys = Object.keys(vm).concat(Object.keys(vm.$props || {}));
        // _init is the only method required for `cls` call
        // for not data property, set as a readonly prop
        // so @Prop does not rewrite it to undefined
        cls.prototype._init = function () {
            var _loop_1 = function (key) {
                if (keys.indexOf(key) >= 0)
                    return "continue";
                Object.defineProperty(this_1, key, {
                    get: function () { return vm[key]; },
                    set: __WEBPACK_IMPORTED_MODULE_1__util__["e" /* NOOP */]
                });
            };
            var this_1 = this;
            for (var _i = 0, insKeys_1 = insKeys; _i < insKeys_1.length; _i++) {
                var key = insKeys_1[_i];
                _loop_1(key);
            }
        };
        var proxy = new cls();
        for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
            var key = keys_2[_i];
            selfData[key] = proxy[key];
        }
        return selfData;
    };
}
// find proto's superclass' constructor to correctly extend
function findSuper(proto) {
    // prototype:   {}  -> VueInst -> ParentInst, aka. proto
    // constructor: Vue -> Parent  -> Child
    var superProto = Object.getPrototypeOf(proto);
    var Super = superProto instanceof __WEBPACK_IMPORTED_MODULE_0_vue___default.a
        ? superProto.constructor // TS does not setup constructor :(
        : __WEBPACK_IMPORTED_MODULE_0_vue___default.a;
    return Super;
}
function collectOptions(cls, keys, optionsToWrite) {
    var newOptions = keys.mapToObject(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__util__["f" /* makeObject */])(cls));
    for (var _i = 0, keys_3 = keys; _i < keys_3.length; _i++) {
        var key = keys_3[_i];
        if (typeof newOptions[key] === 'object') {
            optionsToWrite[key] = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__util__["c" /* objAssign */])({}, newOptions[key], optionsToWrite[key]);
        }
        else {
            optionsToWrite[key] = newOptions[key];
        }
    }
}
function Component_(meta) {
    if (meta === void 0) { meta = {}; }
    function decorate(cls) {
        Component.inDefinition = true;
        cls.prototype._init = __WEBPACK_IMPORTED_MODULE_1__util__["e" /* NOOP */];
        var instance = null;
        try {
            instance = new cls();
        }
        finally {
            Component.inDefinition = false;
        }
        delete cls.prototype._init;
        var proto = cls.prototype;
        var Super = findSuper(proto);
        var options = makeOptionsFromMeta(meta, cls['name']);
        var _a = getKeys(cls, Super), internalKeys = _a.internalKeys, normalKeys = _a.normalKeys, optionKeys = _a.optionKeys;
        for (var _i = 0, internalKeys_1 = internalKeys; _i < internalKeys_1.length; _i++) {
            var protoKey = internalKeys_1[_i];
            collectInternalProp(protoKey, proto, instance, options);
        }
        for (var _b = 0, normalKeys_1 = normalKeys; _b < normalKeys_1.length; _b++) {
            var protoKey = normalKeys_1[_b];
            collectMethodsAndComputed(protoKey, proto, options);
        }
        // everything on instance is packed into data
        collectData(cls, instance, Object.keys(instance), options);
        collectOptions(cls, optionKeys, options);
        return Super.extend(options);
    }
    return decorate;
}
function Component(target) {
    if (typeof target === 'function') {
        return Component_()(target);
    }
    return Component_(target);
}
(function (Component) {
    function register(key, logic) {
        registeredProcessors[key] = logic;
    }
    Component.register = register;
    Component.inDefinition = false;
})(Component || (Component = {}));


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return State; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Getter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return Action; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return Mutation; });
/* harmony export (immutable) */ __webpack_exports__["e"] = namespace;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_vuex__);


var STATE_KEY = '$$State';
var GETTER_KEY = '$$Getter';
var ACTION_KEY = '$$Action';
var MUTATION_KEY = '$$Mutation';
var State = createBindingHelper(STATE_KEY, 'computed', __WEBPACK_IMPORTED_MODULE_1_vuex__["mapState"]);
var Getter = createBindingHelper(GETTER_KEY, 'computed', __WEBPACK_IMPORTED_MODULE_1_vuex__["mapGetters"]);
var Action = createBindingHelper(ACTION_KEY, 'methods', __WEBPACK_IMPORTED_MODULE_1_vuex__["mapActions"]);
var Mutation = createBindingHelper(MUTATION_KEY, 'methods', __WEBPACK_IMPORTED_MODULE_1_vuex__["mapMutations"]);
function namespace(namespace, helper) {
    function namespacedHelper(a, b) {
        if (typeof b === 'string') {
            var key = b;
            var proto = a;
            return helper(key, { namespace: namespace })(proto, key);
        }
        var type = a;
        var options = merge(b || {}, { namespace: namespace });
        return helper(type, options);
    }
    return namespacedHelper;
}
function createBindingHelper(propKey, bindTo, mapFn) {
    __WEBPACK_IMPORTED_MODULE_0__core__["a" /* Component */].register(propKey, function (proto, instance, options) {
        var bindings = proto[propKey];
        if (!options[bindTo]) {
            options[bindTo] = {};
        }
        for (var _i = 0, bindings_1 = bindings; _i < bindings_1.length; _i++) {
            var binding = bindings_1[_i];
            var key = binding.key;
            var map = binding.map;
            var namespace_1 = binding.namespace;
            var mapObject = (_a = {}, _a[key] = map, _a);
            options[bindTo][key] = namespace_1 !== undefined
                ? mapFn(namespace_1, mapObject)[key]
                : mapFn(mapObject)[key];
        }
        var _a;
    });
    function makeDecorator(map, namespace) {
        return function (target, key) {
            (target[propKey] = target[propKey] || []).push({
                key: key, map: map, namespace: namespace
            });
        };
    }
    function helper(a, b) {
        if (typeof b === 'string') {
            var key = b;
            var proto = a;
            return makeDecorator(key, undefined)(proto, key);
        }
        var namespace = extractNamespace(b);
        var type = a;
        return makeDecorator(type, namespace);
    }
    return helper;
}
function extractNamespace(options) {
    var n = options && options.namespace;
    if (typeof n !== 'string') {
        return undefined;
    }
    if (n[n.length - 1] !== '/') {
        return n + '/';
    }
    return n;
}
function merge(a, b) {
    var res = {};
    [a, b].forEach(function (obj) {
        Object.keys(obj).forEach(function (key) {
            res[key] = obj[key];
        });
    });
    return res;
}


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("vue");

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["e"] = NOOP;
/* harmony export (immutable) */ __webpack_exports__["b"] = getReflectType;
/* harmony export (immutable) */ __webpack_exports__["a"] = createMap;
/* harmony export (immutable) */ __webpack_exports__["d"] = hasOwn;
/* harmony export (immutable) */ __webpack_exports__["c"] = objAssign;
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return makeObject; });
/* unused harmony export global */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_reflect_metadata__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_reflect_metadata___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_reflect_metadata__);

function NOOP() { }
function getReflectType(target, key) {
    if (typeof Reflect === "object" && typeof Reflect.getMetadata === "function") {
        return Reflect.getMetadata('design:type', target, key);
    }
    return null;
}
function createMap() {
    var ret = Object.create(null);
    ret["__"] = undefined;
    delete ret["__"];
    return ret;
}
function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
function objAssign(target, source1, source2) {
    if (source1) {
        for (var _i = 0, _a = Object.getOwnPropertyNames(source1); _i < _a.length; _i++) {
            var n = _a[_i];
            Object.defineProperty(target, n, Object.getOwnPropertyDescriptor(source1, n));
        }
    }
    if (source2) {
        for (var _b = 0, _c = Object.getOwnPropertyNames(source2); _b < _c.length; _b++) {
            var n = _c[_b];
            Object.defineProperty(target, n, Object.getOwnPropertyDescriptor(source2, n));
        }
    }
    return target;
}
var makeObject = function (obj) { return function (key) {
    return (_a = {}, _a[key] = obj[key], _a);
    var _a;
}; };
var global;
(function (global) {
    Array.prototype.diff =
        function (list) {
            return this.filter(function (elem) { return list.indexOf(elem) === -1; });
        };
    Array.prototype.mapToObject =
        function (transform) {
            var transformed = {};
            for (var _i = 0, _a = this; _i < _a.length; _i++) {
                var elem = _a[_i];
                objAssign(transformed, transform(elem));
            }
            return transformed;
        };
})(global || (global = {}));


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_core__ = __webpack_require__(0);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Component", function() { return __WEBPACK_IMPORTED_MODULE_1__src_core__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__src_lifecycle__ = __webpack_require__(7);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Lifecycle", function() { return __WEBPACK_IMPORTED_MODULE_2__src_lifecycle__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__src_prop__ = __webpack_require__(8);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Prop", function() { return __WEBPACK_IMPORTED_MODULE_3__src_prop__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "resultOf", function() { return __WEBPACK_IMPORTED_MODULE_3__src_prop__["b"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__src_render__ = __webpack_require__(9);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Render", function() { return __WEBPACK_IMPORTED_MODULE_4__src_render__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__src_transition__ = __webpack_require__(10);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Transition", function() { return __WEBPACK_IMPORTED_MODULE_5__src_transition__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__src_filter__ = __webpack_require__(6);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Filter", function() { return __WEBPACK_IMPORTED_MODULE_6__src_filter__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__src_watch__ = __webpack_require__(11);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Watch", function() { return __WEBPACK_IMPORTED_MODULE_7__src_watch__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__src_data__ = __webpack_require__(5);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Data", function() { return __WEBPACK_IMPORTED_MODULE_8__src_data__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__src_vuex__ = __webpack_require__(1);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "State", function() { return __WEBPACK_IMPORTED_MODULE_9__src_vuex__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Getter", function() { return __WEBPACK_IMPORTED_MODULE_9__src_vuex__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Action", function() { return __WEBPACK_IMPORTED_MODULE_9__src_vuex__["c"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Mutation", function() { return __WEBPACK_IMPORTED_MODULE_9__src_vuex__["d"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "namespace", function() { return __WEBPACK_IMPORTED_MODULE_9__src_vuex__["e"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__src_functions__ = __webpack_require__(17);
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "Mix", function() { return __WEBPACK_IMPORTED_MODULE_10__src_functions__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__src_aliases__ = __webpack_require__(15);
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "data", function() { return __WEBPACK_IMPORTED_MODULE_11__src_aliases__["a"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "prop", function() { return __WEBPACK_IMPORTED_MODULE_11__src_aliases__["b"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "watch", function() { return __WEBPACK_IMPORTED_MODULE_11__src_aliases__["c"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "render", function() { return __WEBPACK_IMPORTED_MODULE_11__src_aliases__["d"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "state", function() { return __WEBPACK_IMPORTED_MODULE_11__src_aliases__["e"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "getter", function() { return __WEBPACK_IMPORTED_MODULE_11__src_aliases__["f"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "action", function() { return __WEBPACK_IMPORTED_MODULE_11__src_aliases__["g"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "filter", function() { return __WEBPACK_IMPORTED_MODULE_11__src_aliases__["h"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "Trait", function() { return __WEBPACK_IMPORTED_MODULE_11__src_aliases__["i"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "trait", function() { return __WEBPACK_IMPORTED_MODULE_11__src_aliases__["j"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "Mixin", function() { return __WEBPACK_IMPORTED_MODULE_11__src_aliases__["k"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "mixin", function() { return __WEBPACK_IMPORTED_MODULE_11__src_aliases__["l"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "mutation", function() { return __WEBPACK_IMPORTED_MODULE_11__src_aliases__["m"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "component", function() { return __WEBPACK_IMPORTED_MODULE_11__src_aliases__["n"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "lifecycle", function() { return __WEBPACK_IMPORTED_MODULE_11__src_aliases__["o"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "transition", function() { return __WEBPACK_IMPORTED_MODULE_11__src_aliases__["p"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__src_context__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__src_context___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_12__src_context__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_12__src_context__) if(["Component","Lifecycle","Prop","resultOf","Render","Transition","Filter","Watch","Data","State","Getter","Action","Mutation","namespace","Mix","data","prop","watch","render","state","getter","action","filter","Trait","trait","Mixin","mixin","mutation","component","lifecycle","transition","Vue","default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_12__src_context__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "Vue", function() { return __WEBPACK_IMPORTED_MODULE_0_vue___default.a; });
















/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Data;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core__ = __webpack_require__(0);

var DATA_KEY = '$$data';
function Data(target, key, _) {
    target[DATA_KEY] = target[key];
}
__WEBPACK_IMPORTED_MODULE_0__core__["a" /* Component */].register(DATA_KEY, function (proto, instance, options) {
    options.data = proto['data'];
    delete proto['data'];
});


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Filter;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core__ = __webpack_require__(0);

var FILTER_KEY = '$$Filter';
function Filter(target, key) {
    var filters = target[FILTER_KEY] = target[FILTER_KEY] || [];
    filters.push(key);
}
__WEBPACK_IMPORTED_MODULE_0__core__["a" /* Component */].register(FILTER_KEY, function (proto, instance, options) {
    var filterMethods = proto[FILTER_KEY];
    options.filters = options.filters || {};
    for (var _i = 0, filterMethods_1 = filterMethods; _i < filterMethods_1.length; _i++) {
        var filter = filterMethods_1[_i];
        options.filters[filter] = proto[filter];
        delete proto[filter];
    }
});


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Lifecycle;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util__ = __webpack_require__(3);



var LIFECYCLE_KEY = '$$Lifecycle';
function Lifecycle(target, life) {
    function makeDecorator(life) {
        return function (target, method) {
            var lifecycles = target[LIFECYCLE_KEY] = target[LIFECYCLE_KEY] || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__util__["a" /* createMap */])();
            lifecycles[life] = lifecycles[life] || [];
            lifecycles[life].push(method);
        };
    }
    if (target instanceof __WEBPACK_IMPORTED_MODULE_0_vue___default.a) {
        return makeDecorator(life)(target, life);
    }
    else {
        return makeDecorator(target);
    }
}
__WEBPACK_IMPORTED_MODULE_1__core__["a" /* Component */].register(LIFECYCLE_KEY, function (proto, instance, options) {
    var lifecycles = proto[LIFECYCLE_KEY];
    var _loop_1 = function (lifecycle) {
        // lifecycles must be on proto because internalKeys is processed before method
        var methods = lifecycles[lifecycle];
        // delete proto[lifecycle]
        options[lifecycle] = function () {
            var _this = this;
            var args = arguments;
            // console.log(this)
            methods.forEach(function (method) {
                var _v = _this || instance || proto;
                // this[method] does not exist on beforeCreate
                if (_v[method]) {
                    _v[method].apply(_v, args);
                }
                else if (_v['$options']) {
                    // but maybe we could just always do this one?
                    _v['$options'].methods[method].apply(_v, args)();
                }
            });
        };
    };
    for (var lifecycle in lifecycles) {
        _loop_1(lifecycle);
    }
});


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Prop;
/* harmony export (immutable) */ __webpack_exports__["b"] = resultOf;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util__ = __webpack_require__(3);



var PROP_KEY = '$$Prop';
var PROP_DEF = '$$PropDefault';
function Prop(target, key) {
    var types = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        types[_i - 2] = arguments[_i];
    }
    if (target instanceof __WEBPACK_IMPORTED_MODULE_0_vue___default.a && typeof key === 'string') {
        return makePropDecorator()(target, key);
    }
    if (target instanceof Function) {
        types.push(target);
        if (key instanceof Function) {
            types.push(key);
        }
        return makePropDecorator({ type: types });
    }
    return makePropDecorator(target);
}
function makePropDecorator(options) {
    if (options === void 0) { options = {}; }
    return function (target, key) {
        var propKeys = target[PROP_KEY] = target[PROP_KEY] || {};
        propKeys[key] = options;
    };
}
__WEBPACK_IMPORTED_MODULE_1__core__["a" /* Component */].register(PROP_KEY, function (proto, instance, options) {
    var mappedProps = proto[PROP_KEY];
    var props = options.props = options.props || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__util__["a" /* createMap */])();
    var _loop_1 = function (key) {
        var prop = {};
        if (instance[key] && instance[key][PROP_DEF]) {
            prop.default = instance[key][PROP_DEF];
            prop.type = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__util__["b" /* getReflectType */])(proto, key);
        }
        else if (instance[key] && typeof instance[key] === 'object') {
            var obj_1 = instance[key];
            prop.default = function () { return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__util__["c" /* objAssign */])({}, obj_1); };
            prop.type = Object;
        }
        else {
            prop.default = instance[key];
            prop.type = instance[key] == null
                ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__util__["b" /* getReflectType */])(proto, key)
                : Object.getPrototypeOf(instance[key]).constructor;
        }
        prop.required = instance[key] === undefined;
        props[key] = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__util__["c" /* objAssign */])({}, prop, mappedProps[key]);
        delete instance[key];
    };
    for (var key in mappedProps) {
        _loop_1(key);
    }
    options.props = props;
});
function resultOf(fn) {
    if (!__WEBPACK_IMPORTED_MODULE_1__core__["a" /* Component */].inDefinition) {
        return undefined;
    }
    return _a = {}, _a[PROP_DEF] = fn, _a;
    var _a;
}


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Render;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core__ = __webpack_require__(0);

var RENDER_KEY = '$$Render';
var RENDER = 'render';
function Render(target, key, _) {
    target[RENDER_KEY] = true;
}
__WEBPACK_IMPORTED_MODULE_0__core__["a" /* Component */].register(RENDER_KEY, function (proto, instance, options) {
    if (proto[RENDER_KEY]) {
        options[RENDER] = proto[RENDER];
        delete proto[RENDER];
    }
});


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Transition;
// for type checking only
function Transition(target, key, _) {
}


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Watch;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util__ = __webpack_require__(3);


var WATCH_PROP = '$$Watch';
function Watch(keyOrPath, opt) {
    if (opt === void 0) { opt = {}; }
    var key = Array.isArray(keyOrPath) ? keyOrPath.join('.') : keyOrPath;
    return function (target, method) {
        var watchedProps = target[WATCH_PROP] = target[WATCH_PROP] || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__util__["a" /* createMap */])();
        opt['handler'] = method;
        watchedProps[key] = opt;
    };
}
__WEBPACK_IMPORTED_MODULE_0__core__["a" /* Component */].register(WATCH_PROP, function (target, instance, optionsToWrite) {
    var watchedProps = target[WATCH_PROP];
    var watch = optionsToWrite.watch;
    for (var key in watchedProps) {
        watch[key] = watchedProps[key];
    }
});


/***/ }),
/* 12 */,
/* 13 */,
/* 14 */
/***/ (function(module, exports) {

module.exports = require("vuex");

/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__data__ = __webpack_require__(5);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__data__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__prop__ = __webpack_require__(8);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_1__prop__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__watch__ = __webpack_require__(11);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return __WEBPACK_IMPORTED_MODULE_2__watch__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__render__ = __webpack_require__(9);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return __WEBPACK_IMPORTED_MODULE_3__render__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__vuex__ = __webpack_require__(1);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return __WEBPACK_IMPORTED_MODULE_4__vuex__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return __WEBPACK_IMPORTED_MODULE_4__vuex__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return __WEBPACK_IMPORTED_MODULE_4__vuex__["c"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__filter__ = __webpack_require__(6);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return __WEBPACK_IMPORTED_MODULE_5__filter__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__core__ = __webpack_require__(0);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return __WEBPACK_IMPORTED_MODULE_6__core__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "j", function() { return __WEBPACK_IMPORTED_MODULE_6__core__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "k", function() { return __WEBPACK_IMPORTED_MODULE_6__core__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return __WEBPACK_IMPORTED_MODULE_6__core__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "m", function() { return __WEBPACK_IMPORTED_MODULE_4__vuex__["d"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "n", function() { return __WEBPACK_IMPORTED_MODULE_6__core__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__lifecycle__ = __webpack_require__(7);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "o", function() { return __WEBPACK_IMPORTED_MODULE_7__lifecycle__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__transition__ = __webpack_require__(10);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "p", function() { return __WEBPACK_IMPORTED_MODULE_8__transition__["a"]; });


















/***/ }),
/* 16 */
/***/ (function(module, exports) {



/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Mix;
function Mix(parent) {
    var mixins = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        mixins[_i - 1] = arguments[_i];
    }
    return parent.extend({ mixins: mixins });
}


/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = require("reflect-metadata");

/***/ })
/******/ ]);