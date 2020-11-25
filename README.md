# Svelte Reactive Form


### Installation
A better form solution which 
```bash
npm install svelte-reform
yarn add svelte-reform
```

- Simple
- TypeScript as first class citizen
- Custom validation
- Reactive 
- Flexible
- Configurable


- typescript
- validation / support custom validation
- performance (no extra render)
- error handling
- custom validation

APIs:
1. Using native HTML
```svelte
<script lang="ts">
  import { useForm, Field, defineRule } from "svelte-reactive-form";

  defineRule("phoneNo", (val: any) => {
    return /[0-9]+/.test(val) || "invalid phone number format";
  });

  const form$ = useForm({});

  const { field, control, onSubmit } = form$;

  const handleSubmit = (v) => {
    console.log(v)
  }
</script>

<style>
</style>

<form on:submit={onSubmit(handleSubmit)}>
    <Field {control} name="name" rules="required" let:errors let:onChange>
        <Component {onChange} />
        {#each errors as item}
            <div>{item}</div>
        {/each}
    </Field>
    <input name="description" type="text" use:field={{ rules: ["required"] }}>
    <button disabled={!$form$.valid}>Submit</button>
</form>
```

Inspired by (react-hook-form)[https://react-hook-form.com], you may consider this as svelte-hook-form.
