<script>
  import { onDestroy } from "svelte";
  import { useForm, Field, defineRule } from "../src/index";
  import { required, minLength } from "../src/rules";
  import Input from "./Input.svelte";

  defineRule("required", required);
  defineRule("minLength", minLength);

  const form$ = useForm();
  const { control } = form$;
  onDestroy(() => {
    console.log("destory");
  });
</script>

<Field {control} name="name" rules={['required']} let:errors let:onChange>
  <div>Name</div>
  <Input secondary={true} />
</Field>
