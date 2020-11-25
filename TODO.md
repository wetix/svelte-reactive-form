    // elements = ["name", "description"]
    // 1. validate "name"
    // name = name
    // value = John
    // 2. retrieve "name" store
    // 3. update "name" store (pending = true)
    // 4. name's validators = ["required", "min:3", "unique"]
    // 5. Promise.all(["required", "min:3", "unique"])