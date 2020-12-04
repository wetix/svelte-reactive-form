<script lang="ts">
  import { useForm, Field, defineRule } from "../src/index";
  import { required, minLength } from "../src/rules";
  import Component from "./Component.svelte";
  import DynamicField from "./DynamicField.svelte";
  import Form from "./Form.svelte";
  import UserInformation from "./UserInformation.svelte";

  defineRule("required", required);
  defineRule("minLength", minLength);
  defineRule("phoneNo", (val: any) => {
    return /[0-9]+/.test(val) || "invalid phone number format";
  });

  const form$ = useForm({ validateOnChange: true });
  const { register, setValue, validate, control, onSubmit } = form$;

  let editable = false;
  register("empty_option_field");
  const state$ = register("custom_field", {
    defaultValue: "Custom",
    rules: ["required", "minLength:10"],
  });

  let toggle = true;
  const successCb = (v) => {
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

  const onChange = (v, node) => {};

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

  const onInput = (e: Event) => {
    formB$.setValue("custom_field", (<HTMLInputElement>e.target).value);
  };
</script>

<style>
  .row {
    display: flex;
  }

  .column {
    width: 50%;
  }
  .errors {
    color: red;
  }

  button[type="submit"] {
    margin: 10px 0;
    width: 100%;
  }
</style>

<section class="row">
  <div class="column">
    <form on:submit={onSubmit(successCb)}>
      <div>
        <Field
          {control}
          name="name"
          defaultValue="Testing"
          {rules}
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
        <button type="button" on:click={toggleRule}>toggle rule</button>
      </div>
      <div>
        <Field
          {control}
          name="user.lastName"
          rules={{ required: true }}
          let:errors
          let:value
          let:onChange
          let:onBlur>
          <Component {onChange} {value} {onBlur} />
          <div>Error :{JSON.stringify(errors)}</div>
          <div>Value :{value}</div>
          {#each errors as item}
            <div>{item}</div>
          {/each}
        </Field>
      </div>
      <div>
        Custom Field :<input type="text" bind:value={customValue} />
        <button type="button" on:click={setCustomValue}>ok</button>
        <div>Dirty :{$state$.dirty}</div>
        <div>Valid :{$state$.valid}</div>
        <div>Pending :{$state$.pending}</div>
        <div>Touched :{$state$.touched}</div>
        <div>
          Value :{$state$.value}<span
            style="color:green;">({$state$.value.length})</span>
        </div>
        <div class="errors">
          {#each $state$.errors as item}
            <div>{item}</div>
          {/each}
        </div>
      </div>
      <button type="button" on:click={() => (toggle = !toggle)}>toggle form</button>
      {#if toggle}
        <Form>
          <div>FORM 1</div>
        </Form>
      {:else}
        <Form>
          <div>FORM 2</div>
        </Form>
      {/if}

      <!-- <div
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
      {/each} -->
      <div>Form pending : {$form$.pending}</div>
      <div>Form valid : {$form$.valid}</div>
      <div>
        <button type="submit" disabled={!$form$.valid || $form$.submitting}>
          {#if $form$.submitting}Submit...{:else}Submit{/if}
        </button>
      </div>
    </form>
  </div>
  <div class="column">
    <form name="form-b" on:submit={formB$.onSubmit(console.log, console.log)}>
      {#if editable}
        <div
          use:formB$.field={{ defaultValue: '', rules: ['required', asyncValidation] }}>
          <input name="description" type="text" />
        </div>
        <input type="text" value={$customField$.value} on:input={onInput} />
        {JSON.stringify($customField$)}
      {:else}
        <!-- <input
          id="checkbox"
          type="checkbox"
          value="ok"
          use:formB$.field={{ rules: ['required'] }} /> -->

        <div>
          age:
          <input
            name="age"
            type="text"
            use:formB$.field={{ defaultValue: 18, rules: ['required'] }} />
        </div>
        <div>
          Raw (user.age):
          <input
            name="[user.age]"
            type="text"
            use:formB$.field={{ defaultValue: 18, rules: ['required'] }} />
        </div>
        <div>
          user.age:
          <input
            name="user.age"
            type="text"
            use:formB$.field={{ defaultValue: 18, rules: ['required'] }} />
        </div>

        <!-- 

        <div>
          users:
          <input
            name="users[10]"
            type="text"
            use:formB$.field={{ defaultValue: '', rules: ['required'] }} />
        </div> -->
        <!-- <div>
          users:
          <input
            name="users[2]"
            type="text"
            use:formB$.field={{ defaultValue: 'Oyster', rules: ['required'] }} />
        </div>
        <div>
          users:
          <input
            name="users[0]"
            type="text"
            use:formB$.field={{ defaultValue: 'John Cena', rules: ['required'] }} />
        </div> -->
        <div>
          user.name.lastName[1]:
          <input
            name="user.name.lastName[1]"
            type="text"
            use:formB$.field={{ defaultValue: 'John', rules: ['required'] }} />
        </div>
        <div>
          user.name.lastName[2]:
          <input
            name="user.name.lastName[2]"
            type="text"
            use:formB$.field={{ rules: ['required'] }} />
        </div>
        <div>
          users[0][18]:
          <input
            name="users[0][18]"
            type="text"
            value="0.18"
            use:formB$.field={{ rules: ['required'] }} />
        </div>
        <div>
          users[1][1]:
          <input
            name="users[1][1]"
            value="1.1"
            type="text"
            use:formB$.field={{ rules: ['required'] }} />
        </div>

        <div>
          users[5][7][1]:
          <input
            name="users[5][7][1]"
            value="5.7.1"
            type="text"
            use:formB$.field={{ rules: ['required'] }} />
        </div>

        <div>
          users[2][2].name :
          <input
            name="users[2][2].name"
            value="2.2.name"
            type="text"
            use:formB$.field={{ defaultValue: 'John Doe', rules: ['required'] }} />
        </div>
        <div>
          users[2][2].nickName :
          <input
            name="users[2][2].nickName"
            value="2.2.nickName"
            type="text"
            use:formB$.field={{ defaultValue: 'John Doe', rules: ['required'] }} />
        </div>
        <!-- <div>
          users[1][2]:
          <input
            name="users[1][0][2]"
            type="text"
            use:formB$.field={{ defaultValue: 'Oyster Lee', rules: ['required'] }} />
        </div> -->
        <!-- <div>
          users[0].names[1].name:
          <input
            name="users[0].names[1].name"
            type="text"
            use:formB$.field={{ defaultValue: 'John Doe', rules: ['required'] }} />
        </div>

        <div>
          users[4].names[0].nickName:
          <input
            name="users[4].names[0].nickName"
            type="text"
            use:formB$.field={{ rules: ['required'] }} />
        </div> -->
      {/if}
      <div>
        <button type="button" on:click={() => (editable = !editable)}>Toggle
          Editable</button>
      </div>
      <div>Form pending : {$formB$.pending}</div>
      <div>Form valid : {$formB$.valid}</div>
      <div>Form submitting : {$formB$.submitting}</div>
      <button type="reset" on:click={() => formB$.reset()}>Reset</button>
      <button type="submit" disabled={$formB$.submitting}>
        {#if $formB$.submitting}Submit...{:else}Submit{/if}
      </button>
    </form>
    <DynamicField />
    <UserInformation />
  </div>
</section>
