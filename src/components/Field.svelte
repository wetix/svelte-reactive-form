<script lang="ts">
  import type { Readable } from "svelte/store";
  import { get } from "svelte/store";

  import type { Form, RuleExpression } from "../types";

  export let name = "";
  export let defaultValue = "";
  export let control: Readable<Form>;
  export let rules: RuleExpression = "";
  export let type: "hidden" | "text" = "hidden";

  const form = get<Form>(control);
  if (!form) console.error("[svelte-reactive-form] Missing form control");
  const { register, setValue, setTouched } = form;

  // reactive state
  const state$ = register(name, rules);

  let value = defaultValue;
  const onChange = (e: any) => {
    if (e instanceof InputEvent) {
      const target = e.target as HTMLInputElement;
      value = target.value;
    } else if (e instanceof CustomEvent) {
      value = e.detail;
    } else {
      value = e;
    }
    setValue(name, value);
  };

  const onBlur = () => {
    setTouched(name, true);
  };
</script>

<span>
  <input {name} {type} on:input value={$state$.value} />
  <slot
    pending={$state$.pending}
    valid={$state$.valid}
    errors={$state$.errors}
    dirty={$state$.dirty}
    touched={$state$.touched}
    value={$state$.value}
    {onChange}
    {onBlur} />
</span>
