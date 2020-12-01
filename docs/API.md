# useForm
- [useForm](#useform)
  - [form object](#form-object)
  - [control](#control)
  - [register](#register)
  - [setValue](#setvalue)
  - [setTouched](#settouched)
  - [setError](#seterror)
  - [errors](#errors)

## form object
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

## control
> The form context.

| Property     | Description            | Data Type          |
| ------------ | ---------------------- | ------------------ |
| `register`   | check all fields valid | `() => FieldState` |
| `unregister` | form is validating     | `() => void`       |

<br />

## register
> Register field with defaultValue, rules etc. It will return a reactive state.

| Property       | Description                               | Data Type  |
| -------------- | ----------------------------------------- | ---------- |
| `defaultValue` | default value of the field                | `any`      |
| `value`        | value of the field                        | `any`      |
| `pending`      | determine the current field is validating | `boolean`  |
| `valid`        | determine the current field was valid     | `boolean`  |
| `touched`      | determine the current field was touched   | `boolean`  |
| `dirty`        | determine the current field was dirty     | `boolean`  |
| `errors`       | errors of the field                       | `string[]` |

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
    const state = register("fieldA", {
        defaultValue: "hello world!",
        rules: [required, asyncFunc],
    });

    // register validation rules using string for fieldB
    register("fieldB", {
        rules: "required|minLength:2"
    });

    // register validation rules using object for fieldB
    register("fieldC", {
        rules: { required, asyncFunc },
    });
</script>

<div>Default Value : {$state.defaultValue}</div>
<div>Value : {$state.value}</div>
<div>Pending : {$state.pending}</div>
<div>Valid : {$state.valid}</div>
<div>Dirty : {$state.dirty}</div>
<div>Touched : {$state.touched}</div>
<div>Errors : {$state.errors}</div>
```

<br />

## setValue
> setValue will execute validation if `validateOnChange` is `true`.

```svelte
<script>
    import { useForm } from "svelte-reactive-form";

    const { setValue } = useForm();
</script>

<input type="text" on:input={(e) => setValue("name", e.target.value)}>
```

<br />

## setTouched
> Set field touched
```svelte
<script>
    import { useForm } from "svelte-reactive-form";

    const { setTouched } = useForm();
    register("name")
</script>

<input type="text" on:focus={() => setTouched("name", true)}>
```

<br />

## setError
> Set field error
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

## errors