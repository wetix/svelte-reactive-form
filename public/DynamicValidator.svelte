<script>
  import { useForm, Field } from "../packages/svelte-reactive-form/src";

  const form$ = useForm({
    validateOnChange: true,
  });
  const { control } = form$;

  let len = 3;

  const onInput = (e) => {
    len = parseInt(e.target.value, 10);
    setTimeout(() => {
      form$.validate("TEXT");
    }, 0);
  };
</script>

<div>Dynamic Min Length</div>
<div>
  <input type="number" on:input={onInput} value={len} />
</div>

<div>Value</div>
<Field
  {control}
  name="TEXT"
  rules={[`minLength:${len}`]}
  let:onChange
  let:value
  let:errors
>
  <input type="text" on:input={onChange} {value} />
  <div class="errors">
    {#each errors as item}
      <div>{item}</div>
    {/each}
  </div>
</Field>

<style>
  /* your styles go here */
</style>
