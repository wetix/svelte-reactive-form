<p align="center">

[![Build Status](https://github.com/wetix/svelte-reactive-form/workflows/ci/badge.svg?branch=master)](https://github.com/wetix/svelte-reactive-form)
[![npm](https://img.shields.io/npm/v/svelte-reactive-form.svg)](https://www.npmjs.com/package/svelte-reactive-form)
[![Bundle Size](https://badgen.net/bundlephobia/minzip/svelte-reactive-form)](https://bundlephobia.com/result?p=svelte-reactive-form@0.4.4-beta)
[![LICENCE](https://img.shields.io/github/license/wetix/svelte-reactive-form)](https://github.com/wetix/svelte-reactive-form/blob/master/LICENSE)

</p>

# Svelte Reactive Form

> A better version of form validation. 

Installation and Usage
--------------------------

```bash
npm install svelte-reactive-form
```
or
```bash
yarn add svelte-reactive-form
```

Features
--------------------------
- Simple
- TypeScript as first class citizen
- Custom validation
- Reactive 
- Flexible
- Configurable

How to use
--------------------------
[https://svelte.dev/repl/2afb74650f36429fa15871b6998d60c9?version=3.30.0](https://svelte.dev/repl/2afb74650f36429fa15871b6998d60c9?version=3.30.0)

```svelte
<script lang="ts">
  import { useForm, Field, defineRule } from "svelte-reactive-form";
  import { required, minLength } from "svelte-reactive-form/rules";

  // define the global validation rules
  defineRule("required", required);
  defineRule("minLength", minLength);
  defineRule("numeric", (val: any) => {
    return /[0-9]+/.test(val) || "invalid numeric format";
  });

  // initialize the form instance
  const form$ = useForm();
  const { field, register, setValue, control, onSubmit } = form$;

  // you can register your field manually
  register("pin", { 
    defaultValue: "", 
    rules: ["required", "minLength:4", "numeric"]
  });

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
  <!-- manually handle set value -->
  <input type="text" on:input={(e) => setValue("pin", e.target.value)} />
  <!-- register field using svelte actions -->
  <input name="description" type="text" use:field={{ rules: ["required"] }}>
  <button disabled={!$form$.valid}>
    {#if $form$.submitting}Submit{:else}Submiting...{/if}
  </button>
</form>
```

API
--------------------------
Check out the [API](https://github.com/wetix/svelte-reactive-form/blob/master/docs/API.md) documentation.

For advance usage, you may refer to [Advance API](https://github.com/wetix/svelte-reactive-form/blob/master/docs/ADVANCE_USAGE.md).

Sponsors
--------------------------

<img src="https://asset.wetix.my/images/logo/wetix.png" alt="WeTix" width="240px">


License
--------------------------
[svelve-reactive-form](https://github.com/wetix/svelte-reactive-form) is 100% free and open-source, under the [MIT license](https://github.com/wetix/svelte-reactive-form/blob/master/LICENSE). 


Big Thanks To
--------------------------
Thanks to these awesome companies for their support of Open Source developers ❤

[![GitHub](https://jstools.dev/img/badges/github.svg)](https://github.com/open-source)
[![NPM](https://jstools.dev/img/badges/npm.svg)](https://www.npmjs.com/)

Inspired by [react-hook-form](https://react-hook-form.com/).


