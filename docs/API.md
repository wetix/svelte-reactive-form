# useForm
- [useForm](#useform)
    - [control](#control)
    - [register](#register)
    - [setValue](#setvalue)
    - [setTouched](#settouched)
    - [setError](#seterror)
    - [errors](#errors)

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