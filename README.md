# simple-database-json

## Introduction

The "simple-database-json" library exported as [Node.js](https://nodejs.org/) modules. It allows you to manage a database in a simple and lisible json file.

## Installation

Using [npm](https://npmjs.com/):

```
npm i simple-database-json
```

In your *index.js*:
```javascript
const { JsonDataBase } = require("simple-database-json")

const db = new JsonDataBase("data/example.json")
```

## Documentation
**Warning**: it is not recommended to modify the contents of the file manually, let alone when running your script.

<!-- 
###  `new JsonDataBase(tablename)`
| Name     | Type       | Description                                                    |
|----------|------------|----------------------------------------------------------------|
| filename | string     | Relative name of the file in which the database is or will be. |

#### Example
```js
const db = new JsonDataBase("data/example.json")
```
-->

---
### `JsonDataBase.hasTable(tablename)`

Checks if the specified table exist.
| Name      | Type   | Description |
|-----------|--------|-------------|
| tablename | string | Table name. |

#### Returns: `boolean`

#### Example
```js
const db = new JsonDataBase("data/example.json")

if (db.hasTable("members")) {
    // Your code...
}
```

---
### `JsonDataBase.createTable(tablename, attributes, callback)`

Create a table.
| Name       | Type     | Description                             |
|------------|----------|-----------------------------------------|
| tablename  | string   | Name of the table that will be created. |
| attributes | object[] | Attributes.                             |
| callback   | function | Callback function.                      |

#### Returns: `void`

#### Example:
```js
// Create a table with two columns: name, age
const db = new JsonDataBase("data/example.json")

db.createTable("members", [
    {
        name: "name",
        type: "string",
        null: false,
        default: false
    },
    {
        name: "age",
        type: "number",
        null: true,
        default: false
    }
], (succ, msg) => {
    // succ - boolean, tells if the call is successful
    // msg - string, tells the error if succ is false
    // Your code...
})
```

---
### `JsonDataBase.select(tablename, filter, callback)`

Selects records filtered in the specified table (all records by default).
| Name      | Type     | Description        |
|-----------|----------|--------------------|
| tablename | string   | Table name.        |
| filter    | function | Filter function.   |
| callback  | function | Callback function. |

#### Returns: `void`

#### Example
```js
// Select members over the age of 20
const db = new JsonDataBase("data/example.json")

db.select("members", record => record["age"] > 20, (succ, data) => {
    // Your code...
})
```

---
### `JsonDataBase.each(tablename, filter, callback)`

Selects each records filtered in the specified table and execute the specified callback.
| Name      | Type     | Description        |
|-----------|----------|--------------------|
| tablename | string   | Table name.        |
| filter    | function | Filter function.   |
| callback  | function | Callback function. |

#### Returns: `void`

#### Example
```js
// Select members over the age of 20
const db = new JsonDataBase("data/example.json")

db.each("members", record => record["age"] > 20, (succ, record) => {
    // Your code...
})
```

---
### `JsonDataBase.insert(tablename, record, callback)`

Inserts the specified data in the specified table.
| Name      | Type     | Description        |
|-----------|----------|--------------------|
| tablename | string   | Table name.        |
| record    | object   | Data to insert.    |
| callback  | function | Callback function. |

#### Returns: `void`

#### Example
```js
const db = new JsonDataBase("data/example.json")

db.insert("members", {
    name: "Jean Doe",
    age: 37
}, (succ, msg) => {
    // Your code...
})
```

---
### `JsonDataBase.update(tablename, data, filter, callback)`

Updates records filtered in the specified table (all records by default).
| Name      | Type     | Description        |
|-----------|----------|--------------------|
| tablename | string   | Table name.        |
| data      | object   | Data to update.    |
| filter    | function | Filter function.   |
| callback  | function | Callback function. |

#### Returns: `void`

#### Example
```js
const db = new JsonDataBase("data/example.json")

db.update("members", { age: 38 }, record => record["name"] === "Jhon Doe", (succ, msg) => {
    // Your code...
})
```

---
### `JsonDataBase.delete(tablename, filter, callback)`

Delete records filtred in the specified table (all records by default).
| Name      | Type     | Description        |
|-----------|----------|--------------------|
| tablename | string   | Table name.        |
| filter    | function | Filter function.   |
| callback  | function | Callback function. |

#### Returns: `void`

#### Example
```js
const db = new JsonDataBase("data/example.json")

db.delete("members", record => record["name"] === "John Doe"), (succ, msg) => {
    // Your code...
})
```

---
### `JsonDataBase.drop(tablename, callback)`

Drops the selected table.
| Name      | Type     | Description       |
|-----------|----------|-------------------|
| tablename | string   | Table name.       |
| callback  | function | Callback function |

#### Returns: `void`

#### Example
```js
const db = new JsonDataBase("data/example.json")

db.drop("members", (succ, msg) => {
    // Your code...
})
``` 

---
### `JsonDataBase.count(tablename, filter, callback)`

Returns the total number of records filtered (all records by default).
| Name      | Type     | Description        |
|-----------|----------|--------------------|
| tablename | string   | Table name.        |
| filter    | function | Filter function.   |
| callback  | function | Callback function. |

#### Returns: `void`

#### Example
```js
const db = new JsonDataBase("data/example.json")

db.count("members", record => record["age"] > 20, (succ, msg) => {
    // Your code...
})
```

---
## Links
- [Github](https://github.com/LeTomium/simple-database-json)
- [NPM](https://www.npmjs.com/package/simple-database-json)