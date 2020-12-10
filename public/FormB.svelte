<script>
  import { useForm, Field, defineRule } from "../src/index";
  import { required, minLength } from "../src/rules";
  import Input from "./Input.svelte";

  defineRule("required", required);
  defineRule("minLength", minLength);

  const form$ = useForm();
  const { control } = form$;
</script>

<Field {control} name="nam2" rules={['required']} let:errors let:onChange>
  <div>Name2</div>
  <Input secondary={true} {onChange} />
</Field>
