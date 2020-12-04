<script lang="ts">
  export let onChange = (_: any) => {};
  export let onFocus = () => {
    console.log("focus");
  };
  export let onBlur = () => {};
  export let value = "";
</script>

<style>
  /* your styles go here */
</style>

<input
  type="text"
  on:input={onChange}
  on:focus={onFocus}
  on:blur={onBlur}
  {value} />
