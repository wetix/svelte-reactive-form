<script lang="ts">
  import { useForm, defineRule } from "../packages/svelte-reactive-form/src";
  import {
    required,
    minLength,
    alphaNum,
    integer,
    email,
    contains,
  } from "../packages/rules/src";
  import Component from "./Component.svelte";
  import DefaultValuesForm from "./DefaultValuesForm.svelte";
  import ConditionalForm from "./ConditionalForm.svelte";
  import FormC from "./FormC.svelte";
  import FormD from "./FormD.svelte";
  import DynamicForm from "./DynamicForm.svelte";
  import DynamicValidator from "./DynamicValidator.svelte";
  import Form from "./Form.svelte";
  import UserInformation from "./UserInformation.svelte";
  import FormB from "./FormB.svelte";

  defineRule("required", required);
  defineRule("alphaNum", alphaNum);
  defineRule("contains", contains);
  defineRule("email", email);
  defineRule("integer", integer);
  defineRule("minLength", minLength);
  defineRule("phoneNo", (val: any) => {
    return /[0-9]+/.test(val) || "invalid phone number format";
  });

  const url = new URL(window.location.href);

  let step = 0;

  const form$ = useForm({ validateOnChange: true });
  const { register, setValue, validate, control, onSubmit } = form$;

  let editable = false;
  register("empty_option_field");
  const state$ = register("custom_field", {
    defaultValue: "Custom",
    rules: ["required", "minLength:10"],
  });

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

  const switchForm = (i: number) => () => {
    selectedForm = i;
    history.replaceState({}, "", `?form=${i}`);
  };

  const formB$ = useForm({ validateOnChange: true });
  const customField$ = formB$.register("custom_field", {
    defaultValue: "Custom",
    rules: ["required", "minLength:10"],
  });

  const toggleRule = () => {
    validate();
    // rules = [asyncValidation, "minLength:20"];
  };

  let rules = [required, asyncValidation, "minLength:6"];

  const array$ = register("array", {
    defaultValue: [1, 2, 3, 4, 5],
    rules: ["required"],
  });
  const onEnterInput = (e: Event) => {
    const v = (<HTMLInputElement>e.target).value;
    form$.setValue("array", v.split(",").filter(Boolean));
    console.log($array$.value);
  };

  const onValidate = () => {
    form$.validate(["array", "name"]).then(console.log);
  };

  const { searchParams } = url;
  let selectedForm: number = searchParams.has("form")
    ? parseInt(searchParams.get("form")!, 10)
    : 0;
  const forms = [
    {
      name: "Default Value Form",
      component: DefaultValuesForm,
    },
    {
      name: "Form A",
      component: FormC,
    },
    {
      name: "Form B",
      component: FormB,
    },
    {
      name: "Form D",
      component: FormD,
    },
    {
      name: "Conditional Form",
      component: ConditionalForm,
    },
    {
      name: "Dynamic Form",
      component: DynamicForm,
    },
    {
      name: "Dynamic Validator",
      component: DynamicValidator,
    },
  ];

  function debounce(inner: Function, ms = 0) {
    let timer: NodeJS.Timeout;
    let resolves: any[] = [];

    return function (...args: any[]) {
      // Run the function after a certain amount of time
      clearTimeout(timer);
      timer = setTimeout(() => {
        // Get the result of the inner function, then apply it to the resolve function of
        // each promise that has been created since the last time the inner function was run
        let result = inner(...args);
        resolves.forEach((r) => r(result));
        resolves = [];
      }, ms);

      return new Promise((r) => resolves.push(r));
    };
  }

  const onInput = (e: Event) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log("ok");
        resolve("ok");
      }, 10);
    });
  };

  const debounceInput = debounce(onInput, 100);
</script>

<p>TEST FORM</p>
<input on:input={debounceInput} />
<div>
  {#each forms as item, i}
    <button
      class:selected={i === selectedForm}
      type="button"
      on:click={switchForm(i)}>{item.name}</button
    >
  {/each}
</div>
<svelte:component this={forms[selectedForm].component} />

<style>
  :global(.errors) {
    color: red;
  }

  .selected {
    border: 1px solid green;
  }
</style>
