<script>
  import { useForm, Field } from "../packages/svelte-reactive-form/src";

  const uuid = () => {
    return `field-${Math.floor(Math.random() * Date.now())}`;
  };
  const form$ = useForm({
    validateOnChange: true
  });
  const { control } = form$;

  let fields = [{ id: uuid() }];

  const add = () => {
    fields = [...fields, { id: uuid() }];
  };

  const remove = () => {
    fields.pop();
    fields = fields;
  };

  const reset = () => {
    form$.reset();
  };

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

{#each fields as item, i (item.id)}
  <Field
    {control}
    defaultValue={item.defaultValue}
    name={item.id}
    rules={["required", "minLength:2", asyncPromise]}
    let:onChange
    let:value
    let:valid
    let:pending
    let:dirty
    let:touched
    let:errors
  >
    <span>Field {i + 1}</span>
    <input type="text" on:input={onChange} {value} />
    {JSON.stringify({ valid, errors, pending, dirty, touched, value })}
  </Field>
{/each}
<div>
  <button type="button" on:click={add}>add</button>
  <button type="button" on:click={remove}>remove</button>
  <button type="button" on:click={reset}>reset</button>
</div>
<div>Form : {JSON.stringify($form$)}</div>
<button disabled={!$form$.valid} on:click={onSubmit}>
  {#if $form$.pending}
    PROCESSING
  {:else}
    SUBMIT
  {/if}</button
>

<style>
  /* your styles go here */
</style>
