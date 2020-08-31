<a name="JsonDataBase"></a>

## JsonDataBase
**Kind**: global class  

* [JsonDataBase](#JsonDataBase)
    * [new JsonDataBase(filename)](#new_JsonDataBase_new)
    * [.tableExists(tablename)](#JsonDataBase+tableExists) ⇒ <code>boolean</code>
    * [.createTable(tablename, attributes, callback)](#JsonDataBase+createTable) ⇒ <code>void</code>
    * [.select(tablename, filter, callback)](#JsonDataBase+select) ⇒ <code>void</code>
    * [.each(tablename, filter, callback)](#JsonDataBase+each) ⇒ <code>void</code>
    * [.insert(tablename, record, callback)](#JsonDataBase+insert) ⇒ <code>void</code>
    * [.update(tablename, data, filter, callback)](#JsonDataBase+update) ⇒ <code>void</code>
    * [.delete(tablename, filter, callback)](#JsonDataBase+delete) ⇒ <code>void</code>
    * [.drop(tablename, callback)](#JsonDataBase+drop) ⇒ <code>void</code>
    * [.count(tablename, filter, callback)](#JsonDataBase+count) ⇒ <code>void</code>


* * *

<a name="new_JsonDataBase_new"></a>

### new JsonDataBase(filename)
Represents the database.


| Param | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | Relative name of the file in which the database is or will be. |

**Example**  
```js
const { JsonDataBase } = require("simple-database-json")const db = new JsonDataBase("data/example.json")
```

* * *

<a name="JsonDataBase+tableExists"></a>

### jsonDataBase.tableExists(tablename) ⇒ <code>boolean</code>
Checks if the specified table exists.

**Kind**: instance method of [<code>JsonDataBase</code>](#JsonDataBase)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| tablename | <code>string</code> | Table name. |

**Example**  
```js
if (db.tableExists("members")) {    // Your code here...}
```

* * *

<a name="JsonDataBase+createTable"></a>

### jsonDataBase.createTable(tablename, attributes, callback) ⇒ <code>void</code>
Creates a table.

**Kind**: instance method of [<code>JsonDataBase</code>](#JsonDataBase)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| tablename | <code>string</code> | Name of the table that will be created. |
| attributes | <code>Array.&lt;object&gt;</code> | Attributes. |
| callback | <code>function</code> | Callback function. |

**Example**  
```js
db.createTable("members", [    {        name: "name",        type: "string"    },    {        name: "age",        type: "number",        null: true,        default: 18    }], err => {    if (err) throw err    console.log("The table has been created!")})
```

* * *

<a name="JsonDataBase+select"></a>

### jsonDataBase.select(tablename, filter, callback) ⇒ <code>void</code>
Selects filtered records in the specified table (all records by default).

**Kind**: instance method of [<code>JsonDataBase</code>](#JsonDataBase)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| tablename | <code>string</code> | Table name. |
| filter | <code>function</code> | Filter function. |
| callback | <code>function</code> | Callback function. |

**Example**  
```js
// Select the members over the age of 20db.select("members", record => record["age"] > 20, (err, data) => {    if (err) throw err    console.log(data)})
```

* * *

<a name="JsonDataBase+each"></a>

### jsonDataBase.each(tablename, filter, callback) ⇒ <code>void</code>
Selects each filtered records in the specified table and execute the specified callback.

**Kind**: instance method of [<code>JsonDataBase</code>](#JsonDataBase)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| tablename | <code>string</code> | Table name. |
| filter | <code>function</code> | Filter function. |
| callback | <code>function</code> | Callback function. |

**Example**  
```js
// Select one by one, the members over the age of 20db.each("members", record => record["age"] > 20, (err, record) => {    if (err) throw err    console.log(record)})
```

* * *

<a name="JsonDataBase+insert"></a>

### jsonDataBase.insert(tablename, record, callback) ⇒ <code>void</code>
Inserts the specified data in the specified table.

**Kind**: instance method of [<code>JsonDataBase</code>](#JsonDataBase)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| tablename | <code>string</code> | Selected table name. |
| record | <code>object</code> | Data to insert. |
| callback | <code>function</code> | Callback function. |

**Example**  
```js
db.insert("members", {    name: "Jean Doe",    age: 37}, err => {    if (err) throw err    console.log("You have been registered!")})
```

* * *

<a name="JsonDataBase+update"></a>

### jsonDataBase.update(tablename, data, filter, callback) ⇒ <code>void</code>
Updates filtered records in the specified table (all records by default).

**Kind**: instance method of [<code>JsonDataBase</code>](#JsonDataBase)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| tablename | <code>string</code> | Table name. |
| data | <code>object</code> | Data to update. |
| filter | <code>function</code> | Filter function. |
| callback | <code>function</code> | Callback function. |

**Example**  
```js
db.update("members", { age: 38 }, record => record["name"] === "Jhon Doe", err => {    if (err) throw err    console.log("Your data has been updated!")})
```

* * *

<a name="JsonDataBase+delete"></a>

### jsonDataBase.delete(tablename, filter, callback) ⇒ <code>void</code>
Delete filtered records in the specified table (all records by default).

**Kind**: instance method of [<code>JsonDataBase</code>](#JsonDataBase)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| tablename | <code>string</code> | Table name. |
| filter | <code>function</code> | Filter function. |
| callback | <code>function</code> | Callback function. |

**Example**  
```js
db.delete("members", record => record["name"] === "John Doe"), err => {    if (err) throw err    console.log("Your account has been deleted!")})
```

* * *

<a name="JsonDataBase+drop"></a>

### jsonDataBase.drop(tablename, callback) ⇒ <code>void</code>
Drops the selected table.

**Kind**: instance method of [<code>JsonDataBase</code>](#JsonDataBase)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| tablename | <code>string</code> | Name of the seleted table. |
| callback | <code>function</code> | Callback function. |

**Example**  
```js
db.drop("members", err => {    if (err) throw err    console.log("The table has been deleted!")})
```

* * *

<a name="JsonDataBase+count"></a>

### jsonDataBase.count(tablename, filter, callback) ⇒ <code>void</code>
Returns the total number of filtered records (all records by default).

**Kind**: instance method of [<code>JsonDataBase</code>](#JsonDataBase)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| tablename | <code>string</code> | Name of the specified table. |
| filter | <code>function</code> | Filter function. |
| callback | <code>function</code> | Callback function. |

**Example**  
```js
db.count("members", record => record["age"] >= 20, (err, count) => {    if (err) throw err    console.log(`${count} members are over 20 years old!`)})
```

* * *

