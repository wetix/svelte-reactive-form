# Advance Usage

### Validation Behavior
By default `svelte-reactive-form` runs validation in these scenarios:

1. After field value change

When a change event is dispatched/emitted
value changed externally (model update or others)
Note that input event is not considered to be a trigger because it would make it too aggressive, you can configure the triggers in the next section to suit your needs.

2. After Rules change

Only if the field was validated before via user interaction

3. After field is blurred

Field has been blurred (blur event was emitted)

4. After form submissions

When the form has been submitted with either handleSubmit or submitForm.

### Dynamic fields validate with **yup**

> Sometime we want the fields to be dynamic, allow user to add or remove the field, and validate it with [yup](https://github.com/jquense/yup)

```svelte
<script lang="ts">
  import { v4 as uuidv4 } from "uuid";
  import * as yup from "yup";
  import { useForm } from "svelte-reactive-form";

  let items = [];

  const schema = yup.object().shape({
    users: yup.array().of(
      yup.object().shape({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        age: yup.number().required(),
      })
    ),
  });

  const form$ = useForm({
    resolver: {
      validate(data) {
        return schema
          .validate(data, { abortEarly: false })
          .catch(({ inner }) => {
            return Promise.reject(
              inner.reduce((acc, cur) => {
                const { path, errors } = cur;
                acc[path] = errors;
                return acc;
              }, {})
            );
          });
      },
    },
  });
  const { onSubmit, errors } = form$;

  const handleAdd = () => {
    items = [...items, { id: uuidv4(), name: "" }];
  };

  const handleRemove = (i) => {
    items.splice(i, 1);
    items = items;
  };

  const afterSubmit = (data, e): Promise<void> => {
    return new Promise((resolve: Function) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  };
</script>

<style>
  .errors {
    color: red;
  }
</style>

<div class="form">
  <form on:submit|preventDefault={onSubmit(afterSubmit)}>
    <div><button type="button" on:click={handleAdd}>ADD</button></div>
    <div class="errors">
      {#each Object.values($errors) as items}
        {#each items as item}
          <div>{item}</div>
        {/each}
      {/each}
    </div>
    <table>
      {#each items as item, i (item.id)}
        <tr>
          <td colspan="2">
            User Information
            <a href="#" on:click|preventDefault={() => handleRemove(i)}>remove</a>
          </td>
        </tr>
        <tr>
          <td>First name:</td>
          <td><input type="text" name={`users[${i}].firstName`} /></td>
        </tr>
        <tr>
          <td>Last name:</td>
          <td><input type="text" name={`users[${i}].lastName`} /></td>
        </tr>
        <tr>
          <td>Nickname:</td>
          <td><input type="text" name={`users[${i}].nickName`} /></td>
        </tr>
        <tr>
          <td>Age:</td>
          <td><input type="numeric" name={`users[${i}].age`} value="0" /></td>
        </tr>
      {/each}
    </table>
    <div>
      <button type="submit" disabled={$form$.submitting || items.length === 0}>
        {#if $form$.submitting}SUBMITTING...{:else}SUBMIT{/if}
      </button>
    </div>
  </form>
</div>
```