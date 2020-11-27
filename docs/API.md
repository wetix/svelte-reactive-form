# useForm
- [useForm](#useform)
    - [form object](#form-object)
    - [control](#control)
    - [register](#register)
    - [setValue](#setvalue)
    - [setTouched](#settouched)
    - [setError](#seterror)
    - [errors](#errors)

### form object
Form object is a reactive object, is contains 

| Property     | Description              | Data Type | Default Value |
| ------------ | ------------------------ | --------- | ------------- |
| `valid`      | whether all fields valid | `boolean` | false         |
| `pending`    | form is validating       | `boolean` | false         |
| `submitting` | form is submitting       | `boolean` | false         |
| `dirty`      | -                        | `boolean` | false         |
| `touched`    | -                        | `boolean` | false         |

```svelte
<script>
    import { useForm } from "svelte-reactive-form";

    const form$ = useForm();
</script>

<div>Form valid : {$form$.valid}</div>
<div>Form pending : {$form$.pending}</div>
<div>Form submitting : {$form$.submitting}</div>
```

### control
The form context.

### register
```svelte
<script>
    import { useForm } from "svelte-reactive-form";
    import { required } from "svelte-reactive-form/rules";

    const form$ = useForm({});
    form$.register("fieldName", [required]);
</script>
```

### setValue
```svelte
<script>
    import { useForm } from "svelte-reactive-form";

    const { setValue } = useForm();
</script>

<input type="text" on:input={(e) => setValue("name", e.target.value)}>
```

### setTouched

### setError
```svelte
<script>
    import { useForm } from "svelte-reactive-form";

    const { errors } = useForm();
    
    setTimeout(() => {
        setError("name", ["invalid name format"]);
    })
</script>

{@debug $errors}
```

### errors