# useForm
- [useForm](#useform)
    - [control](#control)
    - [register](#register)

### control
The form context.

### register
```svelte
<script>
    import { useForm } from "svelte-reactive-form";
    import { required } from "svelte-reactive-form/rules";

    const form$ = useForm({});
    form$.register("fieldName", [required"]);
</script>
```