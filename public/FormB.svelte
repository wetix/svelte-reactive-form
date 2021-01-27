<script>
  import { useForm, Field } from "../packages/svelte-reactive-form/src";
  import Input from "./Input.svelte";

  const form$ = useForm({
    validateOnChange: true,
  });
  const { control } = form$;

  const items = [{ address: ["", "", ""] }];

  const onSubmit = () => {
    console.log(form$.getValues());
  };
</script>

{#each items as item, i}
  <!-- content here -->
  <Field
    {control}
    name={`user[${i}].name`}
    rules={["required"]}
    let:errors
    let:onChange
  >
    <div>Name</div>
    <Input secondary={true} {onChange} />
  </Field>
  <Field
    {control}
    defaultValue={item.address}
    name={`user[${i}].address`}
    rules={["required"]}
    let:value
    let:errors
    let:onChange
  >
    <div>Addresses</div>
    {#each value as v, j}
      <Input
        secondary={true}
        onChange={({ target }) => {
          item.address[j] = target.value;
          onChange(item.address);
        }}
        value={v}
      />
    {/each}
  </Field>
{/each}

<button on:click={onSubmit} />
