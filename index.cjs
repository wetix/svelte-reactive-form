'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function noop() { }
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
    let value;
    subscribe(store, _ => value = _)();
    return value;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
    const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
function bubble(component, event) {
    const callbacks = component.$$.callbacks[event.type];
    if (callbacks) {
        callbacks.slice().forEach(fn => fn(event));
    }
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
let outros;
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

const subscriber_queue = [];
/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
function readable(value, start) {
    return {
        subscribe: writable(value, start).subscribe
    };
}
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

/* src/components/Field.svelte generated by Svelte v3.31.0 */

const get_default_slot_changes = dirty => ({
	pending: dirty & /*$state$*/ 8,
	valid: dirty & /*$state$*/ 8,
	errors: dirty & /*$state$*/ 8,
	dirty: dirty & /*$state$*/ 8,
	touched: dirty & /*$state$*/ 8,
	value: dirty & /*value*/ 4
});

const get_default_slot_context = ctx => ({
	pending: /*$state$*/ ctx[3].pending,
	valid: /*$state$*/ ctx[3].valid,
	errors: /*$state$*/ ctx[3].errors,
	dirty: /*$state$*/ ctx[3].dirty,
	touched: /*$state$*/ ctx[3].touched,
	value: /*value*/ ctx[2],
	onChange: /*onChange*/ ctx[5],
	onBlur: /*onBlur*/ ctx[6]
});

function create_fragment(ctx) {
	let div;
	let input;
	let t;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[11].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], get_default_slot_context);

	return {
		c() {
			div = element("div");
			input = element("input");
			t = space();
			if (default_slot) default_slot.c();
			attr(input, "name", /*name*/ ctx[0]);
			attr(input, "type", /*type*/ ctx[1]);
			input.value = /*value*/ ctx[2];
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, input);
			append(div, t);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;

			if (!mounted) {
				dispose = listen(input, "input", /*input_handler*/ ctx[12]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (!current || dirty & /*name*/ 1) {
				attr(input, "name", /*name*/ ctx[0]);
			}

			if (!current || dirty & /*type*/ 2) {
				attr(input, "type", /*type*/ ctx[1]);
			}

			if (!current || dirty & /*value*/ 4 && input.value !== /*value*/ ctx[2]) {
				input.value = /*value*/ ctx[2];
			}

			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope, $state$, value*/ 1036) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, get_default_slot_changes, get_default_slot_context);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let $state$;
	let { $$slots: slots = {}, $$scope } = $$props;
	
	
	let { name = "" } = $$props;
	let { defaultValue = "" } = $$props;
	let { control } = $$props;
	let { rules = "" } = $$props;
	let { type = "hidden" } = $$props;
	const form = get_store_value(control);
	if (!form) console.error("[svelte-reactive-form] Missing form control");
	const { register, unregister, setValue, setTouched } = form;

	// reactive state
	const state$ = register(name, { defaultValue, rules });

	component_subscribe($$self, state$, value => $$invalidate(3, $state$ = value));
	let value = defaultValue;

	const onChange = e => {
		if (e.target) {
			const target = e.target;
			$$invalidate(2, value = target.value);
		} else if (e.currentTarget) {
			const target = e.currentTarget;
			$$invalidate(2, value = target.value);
		} else if (e instanceof CustomEvent) {
			$$invalidate(2, value = e.detail);
		} else {
			$$invalidate(2, value = e);
		}

		setValue(name, value);
	};

	const onBlur = () => {
		setTouched(name, true);
	};

	onDestroy(() => {
		unregister(name);
	});

	function input_handler(event) {
		bubble($$self, event);
	}

	$$self.$$set = $$props => {
		if ("name" in $$props) $$invalidate(0, name = $$props.name);
		if ("defaultValue" in $$props) $$invalidate(7, defaultValue = $$props.defaultValue);
		if ("control" in $$props) $$invalidate(8, control = $$props.control);
		if ("rules" in $$props) $$invalidate(9, rules = $$props.rules);
		if ("type" in $$props) $$invalidate(1, type = $$props.type);
		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
	};

	return [
		name,
		type,
		value,
		$state$,
		state$,
		onChange,
		onBlur,
		defaultValue,
		control,
		rules,
		$$scope,
		slots,
		input_handler
	];
}

class Field extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance, create_fragment, safe_not_equal, {
			name: 0,
			defaultValue: 7,
			control: 8,
			rules: 9,
			type: 1
		});
	}
}

let RULES = {};
const defineRule = (ruleName, cb) => {
    if (!cb)
        console.warn("[svelte-reactive-form] invalid rule function");
    RULES[ruleName] = cb;
};
const resolveRule = (ruleName) => {
    const cb = RULES[ruleName];
    if (!cb)
        console.warn(`[svelte-reactive-form] invalid rule name ${ruleName}`);
    return cb;
};

const toPromise = (fn) => {
    return function (...args) {
        const value = fn.apply(null, args);
        if (value && typeof value.then === "function") {
            return value;
        }
        if (typeof value === "function") {
            return Promise.resolve(value.apply(null, args));
        }
        return Promise.resolve(value);
    };
};

const defaultFormState = {
    dirty: false,
    submitting: false,
    touched: false,
    pending: false,
    valid: false,
};
const defaultFieldState = {
    defaultValue: "",
    value: "",
    pending: false,
    dirty: false,
    touched: false,
    valid: false,
    errors: [],
};
const fields = ["INPUT", "SELECT", "TEXTAREA"];
// TODO: test case for _normalizeObject
const _normalizeObject = (data, name, value) => {
    const escape = name.match(/^\[(.*)\]$/);
    const queue = [
        [data, escape ? [escape[1]] : name.split(".")],
    ];
    while (queue.length > 0) {
        const first = queue.shift();
        const paths = first[1];
        const name = paths.shift();
        const result = name.match(/^([a-z\_\.]+)((\[\d+\])+)/i);
        if (result && result.length > 2) {
            const name = result[1];
            // if it's not array, assign it and make it as array
            if (!Array.isArray(first[0][name])) {
                first[0][name] = [];
            }
            let cur = first[0][name];
            const indexs = result[2].replace(/^\[+|\]+$/g, "").split("][");
            while (indexs.length > 0) {
                const index = parseInt(indexs.shift(), 10);
                // if nested index is last position && parent is last position
                if (indexs.length === 0) {
                    if (paths.length === 0) {
                        cur[index] = value;
                    }
                    else {
                        if (!cur[index]) {
                            cur[index] = {};
                        }
                    }
                }
                else if (!cur[index]) {
                    // set to empty array if it's undefined
                    cur[index] = [];
                }
                cur = cur[index];
            }
            if (paths.length > 0) {
                queue.push([cur, paths]);
            }
            continue;
        }
        if (paths.length === 0) {
            first[0][name] = value;
        }
        else {
            if (!first[0][name]) {
                first[0][name] = {};
            }
            queue.push([first[0][name], paths]);
        }
    }
    return data;
};
const _strToValidator = (rule) => {
    const params = rule.split(/:/g);
    const ruleName = params.shift();
    if (!resolveRule(ruleName))
        console.error(`[svelte-reactive-form] invalid validation function "${ruleName}"`);
    return {
        name: ruleName,
        validate: toPromise(resolveRule(ruleName)),
        params: params[0] ? params[0].split(",") : [],
    };
};
const useForm = (config = { validateOnChange: true }) => {
    // cache for form fields
    const cache = new Map();
    // global state for form
    const form$ = writable(Object.assign({}, defaultFormState));
    // errors should be private variable
    const errors$ = writable({});
    const _useLocalStore = (path, state) => {
        const { subscribe, set, update } = writable(Object.assign({}, defaultFieldState, state));
        let unsubscribe;
        return {
            set,
            update,
            destroy() {
                unsubscribe && unsubscribe();
                cache.delete(path); // clean our cache
            },
            subscribe(run, invalidate) {
                unsubscribe = subscribe(run, invalidate);
                return () => {
                    // prevent memory leak
                    unsubscribe();
                    unsubscribe = null;
                };
            },
        };
    };
    const _setStore = (path, state = {}) => {
        const store$ = _useLocalStore(path, state);
        cache.set(path, [store$, []]);
    };
    const register = (path, option = {}) => {
        const value = option.defaultValue || "";
        const store$ = _useLocalStore(path, {
            defaultValue: value,
            value,
        });
        let ruleExprs = [];
        const { rules = [] } = option;
        const typeOfRule = typeof rules;
        if (typeOfRule === "string") {
            ruleExprs = rules
                .split("|")
                .map((v) => _strToValidator(v));
        }
        else if (Array.isArray(rules)) {
            ruleExprs = rules.reduce((acc, rule) => {
                const typeOfVal = typeof rule;
                if (typeOfVal === "string") {
                    acc.push(_strToValidator(rule));
                }
                else if (typeOfVal === "function") {
                    rule = rule;
                    if (rule.name === "")
                        console.error("[svelte-reactive-form] validation rule function name is empty");
                    acc.push({
                        name: rule.name,
                        validate: toPromise(rule),
                        params: [],
                    });
                }
                return acc;
            }, []);
        }
        else if (typeOfRule !== null && typeOfRule === "object") {
            ruleExprs = Object.entries(rules).reduce((acc, cur) => {
                const [ruleName, params] = cur;
                acc.push({
                    name: ruleName,
                    validate: toPromise(resolveRule(ruleName)),
                    params: Array.isArray(params) ? params : [params],
                });
                return acc;
            }, []);
        }
        else {
            console.error(`[svelte-reactive-form] invalid data type for validation rule ${typeOfRule}`);
        }
        cache.set(path, [store$, ruleExprs]);
        return {
            subscribe: store$.subscribe,
        };
    };
    const unregister = (path) => {
        if (cache.has(path)) {
            // clear subscriptions and cache
            cache.get(path)[0].destroy();
        }
    };
    const setValue = (path, value) => {
        if (cache.has(path)) {
            const [store$, validators] = cache.get(path);
            if (config.validateOnChange && validators.length > 0) {
                _validate(path, value);
            }
            else {
                store$.update((v) => Object.assign(v, { dirty: true, value }));
            }
        }
        else {
            _setStore(path);
        }
    };
    const setError = (path, errors) => {
        if (cache.has(path)) {
            const [store$] = cache.get(path);
            store$.update((v) => Object.assign(v, { errors }));
        }
        else {
            _setStore(path, { errors });
        }
        // update field errors
        errors$.update((v) => {
            if (errors.length === 0) {
                if (v[path])
                    delete v[path];
                if (Object.keys(v).length === 0)
                    form$.update((v) => Object.assign(v, { valid: true }));
                return v;
            }
            form$.update((v) => Object.assign(v, { valid: false }));
            return Object.assign(v, { [path]: errors });
        });
    };
    const setTouched = (path, touched) => {
        if (cache.has(path)) {
            const [store$, _] = cache.get(path);
            store$.update((v) => Object.assign(v, { touched }));
        }
    };
    const getValue = (path) => {
        if (cache.has(path)) {
            const [store$, _] = cache.get(path);
            const state = get_store_value(store$);
            return state.value;
        }
        return null;
    };
    const _useField = (node, option = {}) => {
        option = Object.assign({ rules: [], defaultValue: "" }, option);
        const selector = fields.join(",");
        while (!fields.includes(node.nodeName)) {
            const el = node.querySelector(selector);
            node = el;
            if (el)
                break;
        }
        const name = node.name || node.id;
        if (name === "")
            console.error("[svelte-reactive-form] empty field name");
        const { defaultValue, rules } = option;
        const state$ = register(name, { defaultValue, rules });
        const onChange = (e) => {
            setValue(name, e.currentTarget.value);
        };
        const onBlur = (_) => {
            setTouched(name, true);
        };
        if (defaultValue) {
            node.setAttribute("value", defaultValue);
        }
        const listeners = [];
        const _attachEvent = (event, cb, opts) => {
            node.addEventListener(event, cb, opts);
            listeners.push([event, cb]);
        };
        const _detachEvents = () => {
            for (let i = 0, len = listeners.length; i < len; i++) {
                const [event, cb] = listeners[i];
                node.removeEventListener(event, cb);
            }
        };
        _attachEvent("blur", onBlur, { once: true });
        if (config.validateOnChange) {
            _attachEvent("input", onChange);
            _attachEvent("change", onChange);
        }
        let unsubscribe;
        if (option.handleChange) {
            unsubscribe = state$.subscribe((v) => {
                option.handleChange(v, node);
            });
        }
        return {
            destroy() {
                _detachEvents();
                unregister(name);
                unsubscribe && unsubscribe();
            },
        };
    };
    const reset = (values, option) => {
        const defaultOption = {
            dirtyFields: false,
            errors: false,
        };
        option = Object.assign(defaultOption, option || {});
        if (option.errors) {
            errors$.set({}); // reset errors
        }
        const fields = Array.from(cache.values());
        for (let i = 0, len = fields.length; i < len; i++) {
            const [store$, _] = fields[i];
            store$.update((v) => {
                const { defaultValue } = v;
                return Object.assign({}, defaultFieldState, {
                    defaultValue,
                    value: defaultValue,
                });
            });
        }
    };
    const useField = (node, option = {}) => {
        let field = _useField(node, option);
        return {
            update(newOption = {}) {
                field.destroy();
                field = _useField(node, newOption);
            },
            destroy() {
                field.destroy();
            },
        };
    };
    const onSubmit = (successCallback, errorCallback) => async (e) => {
        form$.update((v) => Object.assign(v, { submitting: true }));
        e.preventDefault();
        e.stopPropagation();
        errors$.set({}); // reset errors
        let data = {}, valid = true;
        const { elements = [] } = e.currentTarget;
        for (let i = 0, len = elements.length; i < len; i++) {
            const name = elements[i].name || elements[i].id;
            let value = elements[i].value || "";
            if (!name)
                continue;
            if (config.resolver) {
                data = _normalizeObject(data, name, value);
                continue;
            }
            // TODO: shouldn't only loop elements, should check cache keys which not exists in elements as well
            if (cache.has(name)) {
                const store = cache.get(name);
                // TODO: check checkbox and radio
                const { nodeName, type } = elements[i];
                switch (type) {
                    case "checkbox":
                        value = elements[i].checked ? value : "";
                        break;
                }
                const result = await _validate(name, value);
                valid = valid && result.valid; // update valid
            }
        }
        if (config.resolver) {
            try {
                await config.resolver.validate(data);
            }
            catch (e) {
                valid = false;
                errors$.set(e);
            }
        }
        if (valid) {
            await toPromise(successCallback)(data, e);
        }
        else {
            errorCallback && errorCallback(get_store_value(errors$), e);
        }
        // submitting should end only after execute user callback
        form$.update((v) => Object.assign(v, { valid, submitting: false }));
    };
    const _validate = (path, value) => {
        const promises = [];
        if (cache.has(path)) {
            const [store$, validators] = cache.get(path);
            let state = get_store_value(store$);
            if (validators.length === 0) {
                state = Object.assign(state, { errors: [], valid: true });
                store$.set(state);
                return Promise.resolve(state);
            }
            form$.update((v) => Object.assign(v, { pending: true, valid: false }));
            store$.update((v) => Object.assign(v, { errors: [], dirty: true, pending: true, value }));
            for (let i = 0, len = validators.length; i < len; i++) {
                const { validate, params } = validators[i];
                promises.push(validate(value, params));
            }
            return Promise.all(promises).then((result) => {
                const errors = (result.filter((v) => v !== true));
                const valid = errors.length === 0;
                store$.update((v) => Object.assign(v, { pending: false, errors, valid }));
                setError(path, errors);
                return get_store_value(store$);
            });
        }
    };
    const validate = (paths = Array.from(cache.keys())) => {
        if (!Array.isArray(paths))
            paths = [paths];
        const promises = [];
        let data = {};
        for (let i = 0, len = paths.length; i < len; i++) {
            if (!cache.has(paths[i]))
                continue;
            const [store$] = cache.get(paths[i]);
            const state = get_store_value(store$);
            promises.push(_validate(paths[i], state.value));
            _normalizeObject(data, paths[i], state.value);
        }
        return Promise.all(promises).then((result) => {
            return {
                valid: result.every((state) => state.valid),
                data,
            };
        });
    };
    return {
        control: readable({
            register,
            unregister,
            setValue,
            getValue,
            setError,
            setTouched,
            reset,
        }, () => { }),
        subscribe(run, invalidate) {
            const unsubscribe = form$.subscribe(run, invalidate);
            return () => {
                // prevent memory leak
                unsubscribe();
                cache.clear(); // clean our cache
            };
        },
        errors: {
            subscribe: errors$.subscribe,
        },
        field: useField,
        register,
        unregister,
        setValue,
        getValue,
        setError,
        setTouched,
        onSubmit,
        reset,
        validate,
    };
};

exports.Field = Field;
exports.defineRule = defineRule;
exports.useForm = useForm;
