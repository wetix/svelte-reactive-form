<script lang="ts">
  import Field from "../src/components/Field.svelte";
  import { useForm } from "../packages/svelte-reactive-form/src";
  import type { FieldState } from "../packages/svelte-reactive-form/src/types";

  const form$ = useForm({ validateOnChange: true });
  const { field, getValue } = form$;

  const str = "searchterm1 asdasd";
  console.log(str.match(/[^ ]+/g));
  console.log("a|b|c".match(/[^\|]+/g));
  console.log("a|bc|".match(/[^\|]+/g));
  let desc = "";
  const showDesc = () => {
    desc = getValue("desc");
  };

  let option = "";
  const handleChange = (state: FieldState) => {
    console.log(getValue("options"));
    option = state.value;
  };
</script>

<style>
  /* your styles go here */
</style>

<form>
  <Field control={form$.control}><input type="text" /></Field>
  <div>
    <textarea name="desc" use:field={{ defaultValue: 'default text...' }} />
    <div>{desc}</div>
    <button type="button" on:click={showDesc}>get value</button>
  </div>
  <section use:field={{ defaultValue: 'a', handleChange }}>
    <div>
      <select name="options">
        <option value="a">A</option>
        <option value="b">B</option>
        <option value="c">C</option>
      </select>
    </div>
    <div>Option value : {option}</div>
  </section>
  <div>
    <div>Custom Field</div>
    <input type="checkbox" />
    <input type="radio" />
  </div>
  <div>pending : {$form$.pending}</div>
  <div>submitting : {$form$.submitting}</div>
  <div>valid : {$form$.valid}</div>
  <div>
    <button type="submit" disabled={!$form$.valid || $form$.submitting}>
      {#if $form$.submitting}Submit...{:else}Submit{/if}
    </button>
  </div>
</form>
