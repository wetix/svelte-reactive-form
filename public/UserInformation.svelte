<script lang="ts">
  import { v4 as uuidv4 } from "uuid";
  import * as yup from "yup";
  import { useForm, Field, defineRule } from "../src/index";

  let items = [];

  const form$ = useForm();
  const { onSubmit } = form$;

  const handleAdd = () => {
    items = [...items, { id: uuidv4(), name: "" }];

    console.log(items);
  };

  const handleSubmit = (v) => {
    console.log(v);
  };

  const schema = yup.object().shape({
    users: yup.array().of(
      yup.object().shape({
        name: yup.string().required(),
        age: yup.number().required(),
      })
    ),
  });

  console.log(schema);

  const validateForm = () => {
    // console.log()
    schema
      .validate({
        user: "",
      })
      .then((v) => {
        console.log(v);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const afterSubmit = (data, e): Promise<void> => {
    console.log("debug =>", data);
    console.log("Event =>", e);
    return new Promise((resolve: Function) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  };
</script>

<style>
  /* your styles go here */
</style>

<form on:submit|preventDefault={form$.onSubmit(afterSubmit)}>
  <div><button type="button" on:click={handleAdd}>ADD</button></div>
  {#each items as item, i (item.id)}
    <div>
      User Information
      <span
        on:click={() => {
          items.splice(i, 1);
          items = items;
        }}>x</span>
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
