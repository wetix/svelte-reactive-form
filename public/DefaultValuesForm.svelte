<script lang="ts">
  import { onDestroy } from "svelte";
  import type { FormControl } from "svelte-reactive-form/src/types";
  import {
    useForm,
    Field,
    defineRule,
  } from "../packages/svelte-reactive-form/src";

  const form$ = useForm({
    validateOnChange: true,
  });

  const { control } = form$;

  // const custom$ = form$.register("custom", {
  //   rules: ["required"],
  // });

  //   form$.subscribe((state) => {
  //     console.log("State =>", state);
  //   });

  const asyncPromise = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  };

  const equalToField = (v: string, params: any[], ctx: FormControl) => {
    return v === ctx.getValue("email")
      ? true
      : "Confirmation Email must be same as Email!";
  };

  const onSubmit = () => {
    alert(JSON.stringify(form$.getValues()));
  };
</script>

<Field
  {control}
  name="name"
  validateOnMount={true}
  rules={["required", asyncPromise, "minLength:6"]}
  let:onChange
  let:value
  let:valid
  let:pending
  let:dirty
  let:touched
  let:errors
>
  Name : <input type="text" on:input={onChange} {value} />
  {JSON.stringify({ valid, errors, pending, dirty, touched, value })}
  {#each errors as item}
    <div class="error">{item}</div>
  {/each}
</Field>
<Field
  {control}
  name="email"
  defaultValue="sianloong@hotmail.com"
  rules={"required|email"}
  validateOnMount={true}
  let:onChange
  let:onFocus
  let:onBlur
  let:value
  let:valid
  let:pending
  let:dirty
  let:touched
  let:errors
>
  Email : <input
    type="text"
    {value}
    on:focus={onFocus}
    on:input={onChange}
    on:blur={onBlur}
  />
  {JSON.stringify({ valid, errors, pending, dirty, touched, value })}
  {#each errors as item}
    <div class="error">{item}</div>
  {/each}
</Field>
<Field
  {control}
  name="confirmEmail"
  rules={[equalToField]}
  validateOnMount={true}
  let:onChange
  let:onFocus
  let:onBlur
  let:value
  let:valid
  let:pending
  let:dirty
  let:touched
  let:errors
>
  Confirmation Email : <input
    type="text"
    {value}
    on:focus={onFocus}
    on:input={onChange}
    on:blur={onBlur}
  />
  {JSON.stringify({ valid, errors, pending, dirty, touched, value })}
  {#each errors as item}
    <div class="error">{item}</div>
  {/each}
</Field>
<Field
  {control}
  name="option"
  defaultValue="option-b"
  validateOnMount={true}
  rules={["required", "contains:option-a,option-b,option-c,symbol-%2C%40"]}
  let:onChange
  let:onFocus
  let:onBlur
  let:value
  let:valid
  let:pending
  let:dirty
  let:touched
  let:errors
>
  <select on:change={onChange} on:focus={onFocus} on:blur={onBlur}>
    {#each ["option-a", "option-b", "option-c", "option-d"] as item}
      <option value={item} selected={item === value}>{item}</option>
    {/each}
  </select>
  {JSON.stringify({ valid, errors, pending, dirty, touched, value })}
  {#each errors as item}
    <span class="error">{item}</span>
  {/each}
</Field>

<div>Form : {JSON.stringify($form$)}</div>
<button disabled={!$form$.valid} on:click={onSubmit}>SUBMIT</button>

<style>
  .error {
    color: red;
  }
</style>
