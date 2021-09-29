<script lang="ts">
  import { onDestroy } from "svelte";
  import { useForm, Field } from "../packages/svelte-reactive-form/src";
  import Input from "./Input.svelte";

  const form$ = useForm<{ name: string; email: string }>();
  const { control } = form$;
  onDestroy(() => {
    console.log("destory");
    form$.onSubmit((data) => {
      console.log(data);
    });
    form$.validate().then(({ valid, data }) => {});
  });
</script>

<Field {control} name="name" rules={["required"]} let:errors let:onChange>
  <div>Name</div>
  <Input secondary={true} />
</Field>
