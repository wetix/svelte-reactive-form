<script lang="ts">
  import { useForm } from "../packages/svelte-reactive-form/src";

  let defaultValue = "";
  let name = "default";
  let value = "";
  let params = [3];
  const form$ = useForm({ validateOnChange: true });
  const { field } = form$;

  const handleInput = (e) => {
    params = [parseInt(e.target.value, 10)];
  };

  const handleClick = () => {
    form$.validate(name);
  };

  const handleChange = (v) => {
    console.log(v);
  };
</script>

<style>
  /* your styles go here */
</style>

<div>Field name : <input type="text" bind:value={name} /></div>
<div>Dynamic min length : <input type="numeric" on:input={handleInput} /></div>
<div use:field={{ rules: { minLength: params }, handleChange }}>
  <input {name} bind:value />
</div>
<button on:click={handleClick} />
<!-- markup (zero or more items) goes here -->
