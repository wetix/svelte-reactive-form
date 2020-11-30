<script lang="ts">
  import { v4 as uuidv4 } from "uuid";

  let items = [];

  const handleAdd = () => {
    items = [...items, { id: uuidv4(), name: "" }];

    console.log(items);
  };
</script>

<style>
  /* your styles go here */
</style>

{#each items as item, i (item.id)}
  <div>
    User Information
    <span
      on:click={() => {
        items.splice(i, 1);
        items = items;
      }}>x</span>
  </div>
  <div>First name: <input type="text" name={`${item.name}${i}`} /></div>
  <div>Last name: <input type="text" name={`${item.name}${i}`} /></div>
  <div>Nickname: <input type="text" name={`${item.name}${i}`} /></div>
{/each}
<button type="button" on:click={handleAdd}>ADD</button>
