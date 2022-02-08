<script lang="ts">
  import { useForm } from "../form";

  const form$ = useForm();
  // your script goes here
</script>

<form><slot submitting={$form$.submitting} /></form>

<style>
  /* your styles go here */
</style>
