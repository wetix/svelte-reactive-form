<script lang="ts">
  import { useForm } from "../src/index";
  import type { FieldState } from "../src/types";

  const form$ = useForm({}, { validateOnChange: true });
  const { field, getValue } = form$;

  let desc = "";
  const showDesc = () => {
    desc = getValue("desc");
  };

  let option = "";
  const onChange = (state: FieldState) => {
    option = state.value;
  };
</script>

<style>
  /* your styles go here */
</style>

<form>
  <div>
    <textarea name="desc" use:field={{ defaultValue: 'default text...' }} />
    <div>{desc}</div>
    <button type="button" on:click={showDesc}>get value</button>
  </div>
  <section use:field={{ onChange }}>
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
