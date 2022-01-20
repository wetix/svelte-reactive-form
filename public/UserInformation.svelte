<script lang="ts">
  import { v4 as uuidv4 } from "uuid";
  import * as yup from "yup";
  import { useForm } from "../packages/svelte-reactive-form/src";

  let items: { id: string; name: string }[] = [];

  const schema = yup.object().shape({
    users: yup.array().of(
      yup.object().shape({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        age: yup.number().required()
      })
    )
  });

  const form$ = useForm({
    resolver: {
      validate(data) {
        return schema.validate(data, { abortEarly: false }).catch(({ inner }) => {
          return Promise.reject(
            inner.reduce((acc: Record<string, unknown>, cur: any) => {
              const { path, errors } = cur;
              acc[path] = errors;
              return acc;
            }, {})
          );
        });
      }
    }
  });
  const { onSubmit, errors } = form$;

  const handleAdd = () => {
    items = [...items, { id: uuidv4(), name: "" }];
  };

  const handleRemove = (i: number) => {
    items.splice(i, 1);
    items = items;
  };

  const afterSubmit = (): Promise<void> => {
    return new Promise((resolve: Function) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  };
</script>

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
            <a
              class="close"
              href={item.id}
              on:click|preventDefault={() => handleRemove(i)}>remove</a
            >
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

<style>
  .close {
    margin-left: 10px;
    cursor: pointer;
  }

  .form {
    padding: 10px;
    border: 1px solid #dcdcdc;
  }

  .errors {
    color: red;
  }
</style>
