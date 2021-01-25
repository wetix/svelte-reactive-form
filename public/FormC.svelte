<script lang="ts">
  import { onDestroy } from "svelte";
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

  const onSubmit = () => {
    alert(JSON.stringify(form$.getValues()));
  };
</script>

<Field
  name="name"
  {control}
  rules={["required", asyncPromise, "minLength:6"]}
  let:onChange
  let:value
  let:valid
  let:pending
  let:dirty
  let:touched
  let:errors
>
  <input type="text" on:input={onChange} />
  {JSON.stringify({ valid, errors, pending, dirty, touched, value })}
  {#each errors as item}
    <div class="error">{item}</div>
  {/each}
</Field>
<Field
  name="name2"
  {control}
  rules={["required"]}
  let:onChange
  let:value
  let:valid
  let:pending
  let:dirty
  let:touched
  let:errors
>
  <input type="text" on:input={onChange} />
  {JSON.stringify({ valid, errors, pending, dirty, touched, value })}
  {#each errors as item}
    <div class="error">{item}</div>
  {/each}
</Field>
<Field
  name="option"
  defaultValue="option-b"
  {control}
  validateOnMount={true}
  rules={["required"]}
  let:onChange
  let:value
  let:valid
  let:pending
  let:dirty
  let:touched
  let:errors
>
  <select on:blur={onChange} on:change={onChange}>
    {#each ["option-a", "option-b", "option-c"] as item}
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
