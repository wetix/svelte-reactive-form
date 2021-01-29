<script>
  import { useForm, Field } from "../packages/svelte-reactive-form/src";
  import Input from "./Input.svelte";

  const form$ = useForm({
    validateOnChange: true,
  });

  const { control } = form$;

  form$.subscribe((v) => {
    console.log("Form State =>", v);
    console.log(form$.getValues());
  });

  let items = [
    {
      name: "Field1",
      checked: false,
    },
    {
      name: "Field2",
      checked: true,
    },
  ];

  const toggleCheck = (i) => () => {
    items[i].checked = !items[i].checked;
    items = [...items];
  };
</script>

<Field
  {control}
  name="number"
  rules={["required", "integer"]}
  let:onChange
  let:dirty
  let:pending
  let:valid
  let:value
  let:errors
>
  <span><input type="text" {value} on:input={onChange} /></span>
  {JSON.stringify({ dirty, pending, valid, value, errors })}
</Field>
{#each items as item, i}
  <div style="border: 1px solid red;">
    <input type="checkbox" checked={item.checked} on:change={toggleCheck(i)} />
    {#if item.checked}
      <Field
        {control}
        name={`form[${i}].value`}
        rules={["required"]}
        let:onChange
        let:dirty
        let:pending
        let:valid
        let:value
        let:errors
      >
        <span>{item.name}</span>
        <span><input type="text" {value} on:input={onChange} /></span>
        {JSON.stringify({ dirty, pending, valid, value, errors })}
      </Field>
    {/if}
  </div>
{/each}

{JSON.stringify($form$)}

<style>
  /* your styles go here */
</style>
