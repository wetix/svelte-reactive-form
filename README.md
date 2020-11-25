# Svelte Reactive Form
> A better version of form validation. 

## Installation and Usage

```bash
npm install svelte-reactive-form
```
or
```bash
yarn add svelte-reactive-form
```

## Features
- Simple
- TypeScript as first class citizen
- Custom validation
- Reactive 
- Flexible
- Configurable

## How to use
```svelte
<script lang="ts">
  import { useForm, Field, defineRule } from "svelte-reactive-form";
  import { required } from "svelte-reactive-form/rules";

  defineRule("required", required);
  defineRule("phoneNo", (val: any) => {
    return /[0-9]+/.test(val) || "invalid phone number format";
  });

  const form$ = useForm({});
  const { field, register, setValue, control, onSubmit } = form$;

  register("custom-field", { rules: ["required"] });

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

## API
Check out the [API](https://github.com/wetix/svelte-reactive-form/blob/master/docs/API.md) documentation for using:

## Sponsors

<img src="https://asset.wetix.my/images/logo/wetix.png" alt="WeTix" width="240px">

## License
[MIT](https://github.com/wetix/svelte-reactive-form/blob/master/LICENSE)

Inspired by [react-hook-form](https://react-hook-form.com/).
