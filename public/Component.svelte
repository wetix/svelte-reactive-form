<script lang="ts">
  export let onChange = (_: any) => {};
  export let onBlur = () => {};
  export let value = "";
</script>

<style>
  /* your styles go here */
</style>

<input type="text" on:input={onChange} on:blur={onBlur} {value} />
