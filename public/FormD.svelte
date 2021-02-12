<script>
  import { useForm, Field } from "../packages/svelte-reactive-form/src";
  import Input from "./Input.svelte";

  const form$ = useForm({
    // validateOnChange: true,
  });
  const { control } = form$;

  const items = [{ address: ["", "", ""] }];

  const onSubmit = () => {
    console.log(form$.getValues());
  };
</script>

<Field {control} name="phoneNo" let:errors let:valid let:onChange let:onBlur>
  <div>Phone No</div>
  <Input secondary={true} {onChange} {onBlur} />
  <div>{JSON.stringify({ valid, errors })}</div>
</Field>
<Field {control} name="password" let:errors let:valid let:onChange let:onBlur>
  <div>Password</div>
  <Input secondary={true} {onChange} {onBlur} />
  <div>{JSON.stringify({ valid, errors })}</div>
</Field>
<button disabled={!$form$.valid}>CONFIRM</button>
<!-- {JSON.stringify($form$)} -->
