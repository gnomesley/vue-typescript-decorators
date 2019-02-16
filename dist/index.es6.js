import Vue from 'vue';
export { default as Vue } from 'vue';
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';

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
    var _a;
    return (_a = {}, _a[key] = obj[key], _a);
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
        if (!hasOwn(meta, key)) {
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
var registeredProcessors = createMap();
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
    if (!descriptor) { // in case original descriptor is deleted
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
    var obj = createMap();
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var key = keys_1[_i];
        obj[key] = instance[key];
    }
    // what a closure! :(
    optionsToWrite.data = function () {
        if (this === undefined) {
            return objAssign({}, obj);
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
                    set: NOOP
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
    var Super = superProto instanceof Vue
        ? superProto.constructor // TS does not setup constructor :(
        : Vue;
    return Super;
}
function collectOptions(cls, keys, optionsToWrite) {
    var newOptions = keys.mapToObject(makeObject(cls));
    for (var _i = 0, keys_3 = keys; _i < keys_3.length; _i++) {
        var key = keys_3[_i];
        if (typeof newOptions[key] === 'object') {
            optionsToWrite[key] = objAssign({}, newOptions[key], optionsToWrite[key]);
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
        cls.prototype._init = NOOP;
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

var LIFECYCLE_KEY = '$$Lifecycle';
function Lifecycle(target, life) {
    function makeDecorator(life) {
        return function (target, method) {
            var lifecycles = target[LIFECYCLE_KEY] = target[LIFECYCLE_KEY] || createMap();
            lifecycles[life] = lifecycles[life] || [];
            lifecycles[life].push(method);
        };
    }
    if (target instanceof Vue) {
        return makeDecorator(life)(target, life);
    }
    else {
        return makeDecorator(target);
    }
}
Component.register(LIFECYCLE_KEY, function (proto, instance, options) {
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

var PROP_KEY = '$$Prop';
var PROP_DEF = '$$PropDefault';
function Prop(target, key) {
    var types = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        types[_i - 2] = arguments[_i];
    }
    if (target instanceof Vue && typeof key === 'string') {
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
Component.register(PROP_KEY, function (proto, instance, options) {
    var mappedProps = proto[PROP_KEY];
    var props = options.props = options.props || createMap();
    var _loop_1 = function (key) {
        var prop = {};
        if (instance[key] && instance[key][PROP_DEF]) {
            prop.default = instance[key][PROP_DEF];
            prop.type = getReflectType(proto, key);
        }
        else if (instance[key] && typeof instance[key] === 'object') {
            var obj_1 = instance[key];
            prop.default = function () { return objAssign({}, obj_1); };
            prop.type = Object;
        }
        else {
            prop.default = instance[key];
            prop.type = instance[key] == null
                ? getReflectType(proto, key)
                : Object.getPrototypeOf(instance[key]).constructor;
        }
        prop.required = instance[key] === undefined;
        props[key] = objAssign({}, prop, mappedProps[key]);
        delete instance[key];
    };
    for (var key in mappedProps) {
        _loop_1(key);
    }
    options.props = props;
});
function resultOf(fn) {
    var _a;
    if (!Component.inDefinition) {
        return undefined;
    }
    return _a = {}, _a[PROP_DEF] = fn, _a;
}

var RENDER_KEY = '$$Render';
var RENDER = 'render';
function Render(target, key, _) {
    target[RENDER_KEY] = true;
}
Component.register(RENDER_KEY, function (proto, instance, options) {
    if (proto[RENDER_KEY]) {
        options[RENDER] = proto[RENDER];
        delete proto[RENDER];
    }
});

// for type checking only
function Transition(target, key, _) {
}

var FILTER_KEY = '$$Filter';
function Filter(target, key) {
    var filters = target[FILTER_KEY] = target[FILTER_KEY] || [];
    filters.push(key);
}
Component.register(FILTER_KEY, function (proto, instance, options) {
    var filterMethods = proto[FILTER_KEY];
    options.filters = options.filters || {};
    for (var _i = 0, filterMethods_1 = filterMethods; _i < filterMethods_1.length; _i++) {
        var filter = filterMethods_1[_i];
        options.filters[filter] = proto[filter];
        delete proto[filter];
    }
});

var WATCH_PROP = '$$Watch';
function Watch(keyOrPath, opt) {
    if (opt === void 0) { opt = {}; }
    var key = Array.isArray(keyOrPath) ? keyOrPath.join('.') : keyOrPath;
    return function (target, method) {
        var watchedProps = target[WATCH_PROP] = target[WATCH_PROP] || createMap();
        opt['handler'] = method;
        watchedProps[key] = opt;
    };
}
Component.register(WATCH_PROP, function (target, instance, optionsToWrite) {
    var watchedProps = target[WATCH_PROP];
    var watch = optionsToWrite.watch;
    for (var key in watchedProps) {
        watch[key] = watchedProps[key];
    }
});

var DATA_KEY = '$$data';
function Data(target, key, _) {
    target[DATA_KEY] = target[key];
}
Component.register(DATA_KEY, function (proto, instance, options) {
    options.data = proto['data'];
    delete proto['data'];
});

var STATE_KEY = '$$State';
var GETTER_KEY = '$$Getter';
var ACTION_KEY = '$$Action';
var MUTATION_KEY = '$$Mutation';
var State = createBindingHelper(STATE_KEY, 'computed', mapState);
var Getter = createBindingHelper(GETTER_KEY, 'computed', mapGetters);
var Action = createBindingHelper(ACTION_KEY, 'methods', mapActions);
var Mutation = createBindingHelper(MUTATION_KEY, 'methods', mapMutations);
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
    Component.register(propKey, function (proto, instance, options) {
        var _a;
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

function Mix(parent) {
    var mixins = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        mixins[_i - 1] = arguments[_i];
    }
    return parent.extend({ mixins: mixins });
}

export { Component, Component as Trait, Component as trait, Component as Mixin, Component as mixin, Component as component, Lifecycle, Lifecycle as lifecycle, Prop, Prop as prop, resultOf, Render, Render as render, Transition, Transition as transition, Filter, Filter as filter, Watch, Watch as watch, Data, Data as data, State, State as state, Getter, Getter as getter, Action, Action as action, Mutation, Mutation as mutation, namespace, Mix };
