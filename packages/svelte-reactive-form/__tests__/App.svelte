<script lang="ts">
  import { useForm, Field, defineRule } from "../src";
  import { required } from "../../rules/src";

  defineRule("required", required);

  const form$ = useForm<{}>({
    validateOnChange: true
  });
  const { control } = form$;
</script>

<Field
  {control}
  name="email"
  rules={["required"]}
  validateOnMount={true}
  let:onFocus
  let:onChange
  let:pending
  let:dirty
  let:valid
  let:touched
  let:value
>
  <input placeholder="Email" type="text" {value} on:focus={onFocus} on:input={onChange} />
  <div data-testid="email-result">
    {JSON.stringify({ pending, dirty, valid, value, touched })}
  </div>
</Field>

<div data-testid="result">{JSON.stringify($form$)}</div>

<style>
  /* your styles go here */
</style>
