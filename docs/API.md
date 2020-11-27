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
> Form object is a reactive object, is contains 

| Property     | Description            | Data Type | Default Value |
| ------------ | ---------------------- | --------- | ------------- |
| `valid`      | check all fields valid | `boolean` | false         |
| `pending`    | form is validating     | `boolean` | false         |
| `submitting` | form is submitting     | `boolean` | false         |
| `dirty`      | -                      | `boolean` | false         |
| `touched`    | -                      | `boolean` | false         |

<br />

```svelte
<script>
    import { useForm } from "svelte-reactive-form";

    const form = useForm();
</script>

<!-- use svelte reactive syntax $ to get value -->
<!-- https://svelte.dev/tutorial/reactive-statements -->
<div>Form valid : {$form.valid}</div>
<div>Form pending : {$form.pending}</div>
<div>Form submitting : {$form.submitting}</div>
```
<br />

### control
> The form context.

<br />

### register
```svelte
<script>
    import { useForm } from "svelte-reactive-form";
    import { required } from "svelte-reactive-form/rules";

    const { register } = useForm();

    const asyncFunc = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true)
            }, 3000);
        });
    }

    // register validation rules using array for fieldA
    register("fieldA", [required, asyncFunc]);

    // register validation rules using string for fieldB
    register("fieldB", "required|minLength:2");

    // register validation rules using object for fieldB
    register("fieldC", { required, asyncFunc });
</script>
```

<br />

### setValue
> setValue will execute validation if `validateOnChange` is `true`.
```svelte
<script>
    import { useForm } from "svelte-reactive-form";

    const { setValue } = useForm();
</script>

<input type="text" on:input={(e) => setValue("name", e.target.value)}>
```

<br />

### setTouched

<br />

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

<br />

### errors