# Advance Usage

### Dynamic fields for validation

> Something we want something very dynamic, let users to add and remove the field 

```svelte
<script lang="ts">
  import { v4 as uuidv4 } from "uuid";
  import { useForm, Field, defineRule } from "svelte-reactive-form";

  let items = [];

  const form$ = useForm();
  const { onSubmit } = form$;

  const handleAdd = () => {
    items = [...items, { id: uuidv4(), name: "" }];
  };

  const handleRemove = (i) => {
    items.splice(i, 1);
    items = items;
  }

  // submitting field will flag to true after submit callback completed
  const afterSubmit = (data, e): Promise<void> => {
    return new Promise((resolve: Function) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  };
</script>

<form on:submit|preventDefault={form$.onSubmit(afterSubmit)}>
  <div><button type="button" on:click={handleAdd}>ADD</button></div>
  {#each items as item, i (item.id)}
    <div>
      <div>User Information</div>
      <span on:click={() => handleRemove(i)}>x</span>
    </div>
    <div>First name: <input type="text" name={`users[${i}].firstName`} /></div>
    <div>Last name: <input type="text" name={`users[${i}].lastName`} /></div>
    <div>Nickname: <input type="text" name={`users[${i}].nickName`} /></div>
  {/each}
  <div>
    <button type="submit" disabled={$form$.submitting || items.length === 0}>
      {#if $form$.submitting}SUBMITTING...{:else}SUBMIT{/if}
    </button>
  </div>
</form>
```