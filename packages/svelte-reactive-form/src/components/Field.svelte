<script lang="ts">
  import { beforeUpdate, onDestroy } from "svelte";
  import { get } from "svelte/store";
  import type { Readable } from "svelte/store";

  import type { FormControl, RuleExpression } from "../types";

  export let name = "";
  export let defaultValue: any = "";
  export let bail = false;
  export let validateOnBlur = false;
  export let validateOnMount = false;
  export let control: Readable<FormControl>;
  export let rules: RuleExpression = "";
  export let type: "hidden" | "text" = "hidden";

  const form = get<FormControl>(control);
  if (!form) console.error("[svelte-reactive-form] missing form control");
  const { register, unregister, setValue, setTouched } = form;

  // reactive state
  let state$ = register<typeof defaultValue>(name, {
    defaultValue,
    rules,
    validateOnBlur,
    validateOnMount,
    bail,
  });

  let cache = Object.assign({}, $$props);

  beforeUpdate(() => {
    if (JSON.stringify(rules) !== JSON.stringify(cache.rules)) {
      const value = $state$.value;
      cache = Object.assign({}, cache, { defaultValue: value, value, rules });
      state$ = register(name, cache);
    }
  });

  const onChange = (e: any) => {
    let value = e;
    if (e.target) {
      const target = <HTMLInputElement>e.target;
      value = target.value;
    } else if (e.currentTarget) {
      const target = <HTMLInputElement>e.currentTarget;
      value = target.value;
    } else if (e instanceof CustomEvent) {
      value = e.detail;
    }
    setValue(name, value);
  };

  const onFocus = () => {
    setTouched(name, true);
  };

  const onBlur = () => {
    setTouched(name, false);
  };

  onDestroy(() => {
    unregister(name);
  });
</script>

<input {name} {type} on:input value={$state$.value} />
<slot
  pending={$state$.pending}
  valid={$state$.valid}
  errors={$state$.errors}
  dirty={$state$.dirty}
  touched={$state$.touched}
  value={$state$.value}
  {onChange}
  {onFocus}
  {onBlur}
/>
