<script lang="ts">
  import { useForm, Field } from "../packages/svelte-reactive-form/src";

  const form$ = useForm({
    validateOnChange: true,
  });

  const { control } = form$;

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
  bail={true}
  rules={["required", asyncPromise, "minLength:6"]}
  let:onChange
  let:value
  let:valid
  let:pending
  let:dirty
  let:touched
  let:errors
>
  Name : <input type="text" on:input={onChange} />
  {JSON.stringify({ valid, errors, pending, dirty, touched, value })}
  {#each errors as item}
    <div class="error">{item}</div>
  {/each}
</Field>
<Field
  name="email"
  {control}
  rules="required|email"
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
  name="option"
  defaultValue="option-b"
  {control}
  validateOnMount={true}
  rules={["required"]}
  let:onChange
  let:onBlur
  let:value
  let:valid
  let:pending
  let:dirty
  let:touched
  let:errors
>
  <select on:change={onChange} on:blur={onBlur}>
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
