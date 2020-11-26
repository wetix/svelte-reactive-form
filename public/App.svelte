<script lang="ts">
  import { useForm, Field, defineRule } from "../src/index";
  import { required, minLength } from "../src/rules";
  import Component from "./Component.svelte";
  import * as yup from "yup";

  defineRule("required", required);
  defineRule("minLength", minLength);
  defineRule("phoneNo", (val: any) => {
    return /[0-9]+/.test(val) || "invalid phone number format";
  });

  const form$ = useForm(
    {},
    {
      validateOnChange: true,
    }
  );
  const { field, register, setValue, control, onSubmit } = form$;

  const state$ = register("custom_field", ["required", "minLength:10"]);

  const handleSubmit = (v) => {
    console.log("submit =>", v);
  };

  const asyncValidation = () => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1500);
    });
  };

  let ruleOption = 1;
  let customValue = "default";
  const setCustomValue = () => {
    setValue("custom_field", customValue);
  };

  const items = [
    {
      name: "name.firstName",
      type: "text",
    },
    {
      name: "name.lastName",
      type: "type",
    },
    {
      name: "dob",
      type: "date",
    },
  ];

  const onChange = (v, node) => {};
</script>

<style>
  .errors {
    color: red;
  }
</style>

<form on:submit={onSubmit(handleSubmit)}>
  <div>
    <Field
      {control}
      name="name"
      defaultValue="Testing"
      rules={[required, asyncValidation, 'minLength:6']}
      let:dirty
      let:touched
      let:pending
      let:value
      let:valid
      let:errors
      let:onChange
      let:onBlur>
      <Component {onChange} {value} {onBlur} />
      <div class="errors">
        {#each errors as item}
          <div>{item}</div>
        {/each}
      </div>
      <div>Dirty :{dirty}</div>
      <div>Valid :{valid}</div>
      <div>Pending :{pending}</div>
      <div>Touched :{touched}</div>
      <div>Value :{value}</div>
    </Field>
  </div>
  <div>
    <Field
      {control}
      name="name2"
      rules={{ required: true }}
      let:errors
      let:value
      let:onChange>
      <Component {onChange} {value} />
      <div>Error :{JSON.stringify(errors)}</div>
      <div>Value :{value}</div>
      {#each errors as item}
        <div>{item}</div>
      {/each}
    </Field>
  </div>
  <div>
    <input type="text" bind:value={customValue} />
    <button type="button" on:click={setCustomValue}>ok</button>
    <div>Dirty :{$state$.dirty}</div>
    <div>Valid :{$state$.valid}</div>
    <div>Pending :{$state$.pending}</div>
    <div>Touched :{$state$.touched}</div>
    <div>Value :{`${$state$.value} (${$state$.value.length})`}</div>
    <div class="errors">
      {#each $state$.errors as item}
        <div>{item}</div>
      {/each}
    </div>
  </div>
  <div
    use:field={{ defaultValue: '', rules: ruleOption === 1 ? ['required'] : [], onChange }}>
    <input name="description" type="text" />
    <div>
      <button type="button" on:click={() => (ruleOption = 1)}>Rule 1</button>
      <button type="button" on:click={() => (ruleOption = 2)}>Rule 2</button>
    </div>
  </div>
  {#each items as { name, type }}
    <input
      {type}
      {name}
      on:input={(e) => setValue(name, e.currentTarget.value)} />
  {/each}
  <div><button type="submit" disabled={!$form$.valid}>Submit</button></div>
</form>
