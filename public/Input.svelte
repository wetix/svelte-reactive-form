<script>
  import { onMount } from "svelte";

  export let name = "";
  export let label;
  export let type = "text";
  export let placeholder = "";
  export let value = "";
  export let autofocus = false;
  export let secondary = false;
  export let onChange = (_) => {};
  export let onBlur = (_) => {};

  let active = false,
    input;

  onMount(() => {
    if (input && autofocus) {
      input.focus();
    }
  });

  const onInput = (e) => {
    value = e.target.value;
    onChange(e);
    if (value.trim() != "") {
      active = true;
    } else {
      active = false;
    }
  };
</script>

<div class="ditto-input">
  {#if label}
    <div class="label" class:active>{label}</div>
  {/if}
  <input
    class:secondary
    {name}
    bind:this={input}
    {type}
    {placeholder}
    {value}
    on:blur={onBlur}
    on:input={onInput} />
</div>
