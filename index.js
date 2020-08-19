const fs = require("fs")
const path = require("path")

const DEFAULT_ATTRIBUTE = {
    type: "any",
    null: false,
    default: null
}

/**
 * Checks if the specified data is valid to insert in the specified table.
 * @private
 * @param {object} table Table.
 * @param {object} data Data to insert/update.
 * @param {(succ: boolean, msg: string, data: object) => any} callback Callback function.
 * @returns {Array<boolean, string>}
 */
function validToInsert(table, data, callback=() => true) {
    let copy = Object.assign({}, data)

    for (const prop of table._attributes) {

        if (copy[prop.name] === undefined) {
            if (prop.default !== null) {
                copy[prop.name] = prop.default
            } else if (prop.null) {
                copy[prop.name] = null
            } else {
                callback(false, `The value of ${prop.name} is not specified.`, data)
                return
            }
        }
        if (copy[prop.name] !== null && prop.type !== "any" && typeof copy[prop.name] !== prop.type) {
            callback(false, `The value of ${prop.name} is not ${prop.type}.`, data)
            return
        }
    }
    callback(true, `Success.`, copy)
    return
}

class JsonDataBase {
    /**
     * Represents the database.
     * @constructor
     * @param {string} filename Relative name of the file in which the database is or will be.
     */
    constructor(filename) {

        if (typeof filename !== "string")
            throw TypeError("JsonDataBase.constructor() - Argument 1: filename is not a string.")

        this.filename = path.join(__dirname, filename)

        if (!fs.existsSync(this.filename)) {
            try {
                fs.writeFileSync(this.filename, JSON.stringify({ tables: [] }, null, 2))
            } catch (err) {
                throw Error(`The file "${filename}" cannot be created.`)
            }
        }
        let fileContent = fs.readFileSync(this.filename, "utf-8")
        if (fileContent.replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g, "") === "") {
            fs.writeFileSync(this.filename, JSON.stringify({ tables: [] }, null, 2))
            this.content = { tables: [] }
        } else {
            this.content = JSON.parse(fileContent)
        }
    }
    /**
     * Checks if the specified table exist.
     * @public
     * @param {string} tablename Table name.
     * @example
     * const db = new JsonDataBase("data/example.json")
     * 
     * if (db.hasTable("members")) {
     *     // Your code...
     * }
     * @returns {boolean}
     */
    hasTable(tablename) {
        return this.content["tables"].some((table) => table._name == tablename)
    }
    /**
     * Creates a table.
     * @public
     * @param {string} tablename Name of the table that will be created.
     * @param {object[]} attributes Attributes.
     * @param {(succ: boolean, msg: string) => any} callback Callback function.
     * @example
     * const db = new JsonDataBase("data/example.json")
     * 
     * // Create a table with two columns: name, age
     * db.createTable("members", [
     *     {
     *         name: "name",
     *         type: "string",
     *         null: false,
     *         default: false
     *     },
     *     {
     *         name: "age",
     *         type: "number",
     *         null: false,
     *         default: false
     *     }
     * ], (succ, msg) => {
     *     // Your code...
     * })
     * @example
     * @returns {void}
     */
    createTable(tablename, attributes, callback=() => true) {

        if (typeof tablename !== "string") {
            callback(false, `Argument 1: tablename is not a string.`)
            return
        }
        if (!(attributes instanceof Array)) {
            callback(false, `Argument 2: attributes is not an Array.`)
            return
        }
        if (typeof callback !== "function") {
            callback(false, `Argument 3: callback is not a function.`)
            return
        }
        
        if (!this.hasTable(tablename)) {
            let columns = []
            for (const attr of attributes) {
                if (typeof attr === "object") {
                    if (typeof attr.name === "string" && attr.name !== "") {
                        if (!columns.includes(attr.name)) {
                            Object.assign(attr, DEFAULT_ATTRIBUTE)
                            columns.push(attr.name)
                        } else {
                            callback(false, `Two columns cannot have the same name.`)
                            return
                        }
                    } else {
                        callback(false, `A name must be specified for each attribute by a string.`)
                        return
                    }
                } else {
                    callback(false, `Each attribute must be an object.`)
                    return
                }
            }
            this.content["tables"].push({
                _name: tablename,
                _records: [],
                _attributes: attributes
            })
            fs.writeFileSync(this.filename, JSON.stringify(this.content, null, 2))
            callback(true, "Success.")
            return
        } else {
            callback(false, `The table "${tablename}" already exists.`)
            return
        }
    }
    /**
     * Selects records filtered in the specified table (all records by default).
     * @public
     * @param {string} tablename Table name.
     * @param {(record: object) => boolean} filter Filter function.
     * @param {(succ: boolean, data: object[]) => any} callback Callback function.
     * @example
     * const db = new JsonDataBase("data/example.json")
     * 
     * // Select members over the age of 20
     * db.select("members", record => record.age > 20, (succ, data) => {
     *     // Your code...
     * })
     * @example
     * @return {void}
     */
    select(tablename, filter=() => true, callback=() => true) {
        
        if (typeof tablename !== "string") {
            callback(false, `Argument 1: tablename is not a string.`)
            return
        }
        if (typeof filter !== "function") {
            callback(false, `Argument 2: filter is not a function.`)
            return
        }
        if (typeof callback !== "function") {
            callback(false, `Argument 3: callback is not a function.`)
            return
        }
        
        if (this.hasTable(tablename)) {
            const table = this.content["tables"].find((table) => table._name == tablename)

            let data = table["_records"].filter((record) => {
                return filter(record)
            })
            
            callback(true, data)
            return
        } else {
            callback(false, `The table "${tablename}" does not exist.`)
            return
        }
    }
    /**
     * Selects each records filtered in the specified table and execute the specified callback.
     * @public
     * @param {string} tablename Table name.
     * @param {(record: object) => boolean} filter Filter function.
     * @param {(succ: boolean, record: object) => any} callback Callback function.
     * @example
     * const db = new JsonDataBase("data/example.json")
     * 
     * // Select members over the age of 20
     * db.each("members", record => record.age > 20, (succ, data) => {
     *     // Your code...
     * })
     * @return {void}
     */
    each(tablename, filter=() => true, callback=() => true) {

        if (typeof tablename !== "string") {
            callback(false, `Argument 1: tablename is not a string.`)
            return
        }
        if (typeof filter !== "function") {
            callback(false, `Argument 2: filter is not a function.`)
            return
        }
        if (typeof callback !== "function") {
            callback(false, `Argument 3: callback is not a function.`)
            return
        }
        
        if (this.hasTable(tablename)) {
            const table = this.content["tables"].find((table) => table._name == tablename)

            table["_records"].forEach((record) => {
                if (filter(record))
                    callback(true, record)
            })
            return
        } else {
            callback(false, `The table "${tablename}" does not exist.`)
            return
        }
    }
    /**
     * Inserts the specified data in the specified table.
     * @public
     * @param {string} tablename Selected table name.
     * @param {object} record Data to insert.
     * @param {(succ: boolean, msg: string) => any} callback Callback function.
     * @example
     * const db = new JsonDataBase("data/example.json")
     * 
     * db.insert("members", {
     *     name: "Jean Doe",
     *     age: 37
     * }, (succ, msg) => {
     *     // Your code...
     * })
     * @example
     * @returns {void}
     */
    insert(tablename, record, callback=() => true) {

        if (typeof tablename !== "string") {
            callback(false, `Argument 1: tablename is not a string.`)
            return
        }
        if (typeof record !== "object") {
            callback(false, `Argument 2: record is not a function.`)
            return
        }
        if (typeof callback !== "function") {
            callback(false, `Argument 3: callback is not a function.`)
            return
        }
        
        if (this.hasTable(tablename)) {
            const table = this.content["tables"].find((table) => table._name == tablename)
            
            validToInsert(table, record, (succ, msg, data) => {
                if (succ) {
                    Object.assign(record, data)

                    let date = new Date()
                    record["_id"] = date.getTime()
                    table["_records"].push(record)
    
                    fs.writeFileSync(this.filename, JSON.stringify(this.content, null, 2))
                    callback(true, `Success.`)
                    return
                } else {
                    callback(false, `Invalid record to insert: ${msg}`)
                    return
                }
            })
            return
        } else {
            callback(false, `The table "${tablename}" does not exist.`)
            return
        }
    }
    /**
     * Updates records filtered in the specified table (all records by default).
     * @public
     * @param {string} tablename Table name.
     * @param {object} data Data to update.
     * @param {(record: object) => boolean} filter Filter function.
     * @param {(succ: boolean, data: string) => any} callback Callback function.
     * @example
     * const db = new JsonDataBase("data/example.json")
     * 
     * db.update("members", { age: 38 }, record => record.name === "Jhon Doe", (succ, msg) => {
     *     // Your code...
     * })
     * @example
     * @return {void}
     */
    update(tablename, data, filter=() => true, callback=() => true) {

        if (typeof tablename !== "string") {
            callback(false, `Argument 1: tablename is not a string.`)
            return
        }
        if (typeof data !== "object") {
            callback(false, `Argument 2: data is not an object.`)
            return
        }
        if (typeof filter !== "function") {
            callback(false, `Argument 3: filter is not a function.`)
            return
        }
        if (typeof callback !== "function") {
            callback(false, `Argument 4: callback is not a function.`)
            return
        }

        if (this.hasTable(tablename)) {
            const table = this.content["tables"].find((table) => table._name == tablename)

            for (const record of table["_records"]) {
                if (filter(record)) {
                    validToInsert(table, data, (succ, msg, data) => {
                        if (succ) {
                            Object.assign(record, data)
                        } else {
                            callback(false, `Invalid record to update: ${msg}`)
                            return
                        }
                    })
                }
            }
            
            fs.writeFileSync(this.filename, JSON.stringify(this.content, null, 2))
            callback(true, `Success.`)
            return
        } else {
            callback(false, `The table "${tablename}" does not exist.`)
            return
        }
    }
    /**
     * Delete records filtred in the specified table (all records by default).
     * @public
     * @param {string} tablename Table name.
     * @param {(record: object) => boolean} filter Filter function.
     * @param {(succ: boolean, msg: string) => boolean} callback Callback function.
     * @example
     * const db = new JsonDataBase("data/example.json")
     * 
     * db.delete("members", record => record.name === "John Doe"), (succ, msg) => {
     *     // Your code...
     * })
     * @returns {void}
     */
    delete(tablename, filter=() => true, callback=() => true) {
        
        if (typeof tablename !== "string") {
            callback(false, `Argument 1: tablename is not a string.`)
            return
        }
        if (typeof filter !== "function") {
            callback(false, `Argument 2: filter is not a function.`)
            return
        }
        if (typeof callback !== "function") {
            callback(false, `Argument 3: callback is not a function.`)
            return
        }
        
        if (this.hasTable(tablename)) {
            const table = this.content["tables"].find((table) => table._name == tablename)

            for (let i = 0; i < table["_records"].length; i++) {
                const record = table["_records"][i]
                if (filter(record)) {
                    table["_records"].splice(i, 1)
                    i--
                }
            }

            fs.writeFileSync(this.filename, JSON.stringify(this.content, null, 2))
            callback(true, "Success.")
            return
        } else {
            callback(false, `The table "${tablename}" does not exist.`)
            return
        }
    }
    /**
     * Drops the selected table.
     * @public
     * @param {string} tablename Name of the seleted table.
     * @param {(succ: boolean, msg: string) => any} callback Callback function.
     * @example
     * const db = new JsonDataBase("data/example.json")
     * 
     * db.drop("members", (succ, msg) => {
     *     // Your code...
     * })
     * @returns {void}
     */
    drop(tablename, callback=() => true) {

        if (typeof tablename !== "string") {
            callback(false, `Argument 1: tablename is not a string.`)
            return
        }
        if (typeof callback !== "function") {
            callback(false, `Argument 2: callback is not a function.`)
            return
        }
        const table = this.content["tables"].find((table) => table._name == tablename)
        let index = this.content["tables"].indexOf(table)

        if (index > -1) {
            this.content["tables"].splice(index, 1)

            fs.writeFileSync(this.filename, JSON.stringify(this.content, null, 2))
            callback(true, `Success.`)
            return
        } else {
            callback(false, `The table "${tablename}" does not exist.`)
            return
        }
    }
    /**
     * Returns the total number of records filtered (all records by default).
     * @public
     * @param {string} tablename Name of the specified table.
     * @param {(record: object) => boolean} filter
     * @param {(succ: boolean, data: number) => any} callback Callback function.
     * @example
     * const db = new JsonDataBase("data/example.json")
     * 
     * db.count("members", record => record["age"] > 20, (succ, msg) => {
     *     // Your code...
     * })
     * @returns {void}
     */
    count(tablename, filter=() => true, callback=() => true) {
        
        if (typeof tablename !== "string") {
            callback(false, `Argument 1: tablename is not a string.`)
            return
        }
        if (typeof filter !== "function") {
            callback(false, `Argument 2: filter is not a function.`)
            return
        }
        if (typeof callback !== "function") {
            callback(false, `Argument 3: callback is not a function.`)
            return
        }

        let data = 0

        if (this.hasTable(tablename)) {
            const table = this.content["tables"].find((table) => table._name == tablename)

            data = table["_records"].filter((record) => {
                return filter(record)
            }).length

            callback(true, data)
            return
        } else {
            callback(false, `The table "${tablename}" does not exist.`)
            return
        }
    }
}

module.exports = { JsonDataBase }