const fs = require("fs")
const path = require("path")
const DEFAULT_ATTRIBUTE = {
    type: "any",
    null: false,
    default: null
}
class JsonDataBase {
    /**
     * Represents the database.
     * @constructor
     * @param {string} filename Relative name of the file in which the database is or will be.
     * @example
     * const { JsonDataBase } = require("simple-database-json")
     * 
     * const db = new JsonDataBase("data/example.json")
     */
    constructor(filename) {
        if (typeof filename !== "string")
            throw TypeError("JsonDataBase.constructor: Argument 1 is not a string.")
        /**
         * Path of the database file.
         * @private
         * @type {string}
         */
        this.filename = path.join(__dirname, "../../", filename)
        /**
         * Raw content of the database.
         * @private
         * @type {object}
         */
        this.content = { tables: [] }
        if (!fs.existsSync(this.filename)) {
            try {
                fs.writeFileSync(this.filename, JSON.stringify({ tables: [] }, null, 2))
            } catch (err) {
                throw Error(`   The file "${filename}" cannot be created.`)
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
     * Checks if the specified table exists.
     * @public
     * @param {string} tablename Table name.
     * @example
     * if (db.tableExists("members")) {
     *     // Your code here...
     * }
     * @returns {boolean}
     */
    tableExists(tablename) {
        if (typeof tablename !== "string") {
            callback(TypeError(`JsonDatabase.tableExists: Argument 1 is not a string.`))
            return
        }
        return this.content["tables"].some((table) => table["_name"] === tablename)
    }
    /**
     * Creates a table.
     * @public
     * @param {string} tablename Name of the table that will be created.
     * @param {object[]} attributes Attributes.
     * @param {function} callback Callback function.
     * @example
     * db.createTable("members", [
     *     {
     *         name: "name",
     *         type: "string"
     *     },
     *     {
     *         name: "age",
     *         type: "number",
     *         null: true,
     *         default: 18
     *     }
     * ], err => {
     *     if (err) throw err
     *     console.log("The table has been created!")
     * })
     * @returns {void}
     */
    createTable(tablename, attributes, callback=() => true) {
        if (typeof tablename !== "string") {
            callback(TypeError(`JsonDatabase.createTable: Argument 1 is not a string.`))
            return
        }
        if (!(attributes instanceof Array)) {
            callback(TypeError(`JsonDatabase.createTable: Argument 2 is not an Array.`))
            return
        }
        if (typeof callback !== "function") {
            callback(TypeError(`JsonDatabase.createTable: Argument 3 is not a function.`))
            return
        }
        if (!this.tableExists(tablename)) {
            let columns = []
            for (const attr of attributes) {
                if (typeof attr === "object") {
                    if (typeof attr.name === "string" && attr.name !== "") {
                        if (!columns.includes(attr.name)) {
                            for (const propname in DEFAULT_ATTRIBUTE) {
                                if (DEFAULT_ATTRIBUTE.hasOwnProperty(propname)) {
                                    if (attr[propname] === undefined)
                                        attr[propname] = DEFAULT_ATTRIBUTE[propname]
                                }
                            }
                            columns.push(attr.name)
                        } else {
                            callback(Error(`Two columns cannot have the same name.`))
                            return
                        }
                    } else {
                        callback(Error(`A name must be specified for each attribute by a string.`))
                        return
                    }
                } else {
                    callback(Error(`Each attribute must be an object.`))
                    return
                }
            }
            this.content["tables"].push({
                _name: tablename,
                _records: [],
                _attributes: attributes
            })
            fs.writeFile(this.filename, JSON.stringify(this.content, null, 2), err => {
                callback(err)
            })
            return
        } else {
            callback(Error(`The table ${tablename} already exists.`))
            return
        }
    }
    /**
     * Selects filtered records in the specified table (all records by default).
     * @public
     * @param {string} tablename Table name.
     * @param {function} filter Filter function.
     * @param {function} callback Callback function.
     * @example
     * // Select the members over the age of 20
     * db.select("members", record => record["age"] > 20, (err, data) => {
     *     if (err) throw err
     *     console.log(data)
     * })
     * @return {void}
     */
    select(tablename, filter=() => true, callback=() => true) {
        if (typeof tablename !== "string") {
            callback(TypeError(`JsonDatabase.select: Argument 1 is not a string.`))
            return
        }
        if (typeof filter !== "function") {
            callback(TypeError(`JsonDatabase.select: Argument 2 is not a function.`))
            return
        }
        if (typeof callback !== "function") {
            callback(TypeError(`JsonDatabase.select: Argument 3 is not a function.`))
            return
        }
        if (this.tableExists(tablename)) {
            const table = this.content["tables"].find((table) => table["_name"] == tablename)
            let data = table["_records"].filter(filter)
            callback(null, JSON.parse(JSON.stringify(data)))
            return
        } else {
            callback(Error(`The table ${tablename} does not exist.`))
            return
        }
    }
    /**
     * Selects each filtered records in the specified table and execute the specified callback.
     * @public
     * @param {string} tablename Table name.
     * @param {function} filter Filter function.
     * @param {function} callback Callback function.
     * @example
     * // Select one by one, the members over the age of 20
     * db.each("members", record => record["age"] > 20, (err, record) => {
     *     if (err) throw err
     *     console.log(record)
     * })
     * @return {void}
     */
    each(tablename, filter=() => true, callback=() => true) {
        if (typeof tablename !== "string") {
            callback(TypeError(`JsonDatabase.each: Argument 1 is not a string.`))
            return
        }
        if (typeof filter !== "function") {
            callback(TypeError(`JsonDatabase.each: Argument 2 is not a function.`))
            return
        }
        if (typeof callback !== "function") {
            callback(TypeError(`JsonDatabase.each: Argument 3 is not a function.`))
            return
        }
        if (this.tableExists(tablename)) {
            const table = this.content["tables"].find((table) => table["_name"] == tablename)
            table["_records"].forEach((record) => {
                if (filter(record))
                    callback(null, JSON.parse(JSON.stringify(record)))
            })
            return
        } else {
            callback(Error(`The table ${tablename} does not exist.`))
            return
        }
    }
    /**
     * Inserts the specified data in the specified table.
     * @public
     * @param {string} tablename Selected table name.
     * @param {object} record Data to insert.
     * @param {function} callback Callback function.
     * @example
     * db.insert("members", {
     *     name: "Jean Doe",
     *     age: 37
     * }, err => {
     *     if (err) throw err
     *     console.log("You have been registered!")
     * })
     * @returns {void}
     */
    insert(tablename, record, callback=() => true) {
        if (typeof tablename !== "string") {
            callback(TypeError(`JsonDatabase.insert: Argument 1 is not a string.`))
            return
        }
        if (typeof record !== "object") {
            callback(TypeError(`JsonDatabase.insert: Argument 2 is not a function.`))
            return
        }
        if (typeof callback !== "function") {
            callback(TypeError(`JsonDatabase.insert: Argument 3 is not a function.`))
            return
        }
        if (this.tableExists(tablename)) {
            const table = this.content["tables"].find((table) => table["_name"] == tablename)
            for (const attr of table["_attributes"]) {
                if (record[attr.name] === undefined) {
                    if (attr.default !== null) {
                        record[attr.name] = attr.default
                    } else if (attr.null) {
                        record[attr.name] = null
                    } else {
                        callback(Error(`The value of ${attr.name} is not specified.`))
                        return
                    }
                } else if (isNaN(record[attr.name]) && typeof record[attr.name] === "number") {
                    callback(Error(`The value of ${attr.name} cannot be NaN.`))
                    return
                } else if (!attr.null && (record[attr.name] === null)) {
                    callback(Error(`The value of ${attr.name} cannot be null.`))
                    return
                } else if (attr.type !== "any" && typeof record[attr.name] !== attr.type) {
                    callback(Error(`The value of ${attr.name} is not ${attr.type}.`))
                    return
                }
            }
            let id = table["_records"].length > 0 ? table["_records"][table["_records"].length - 1]._id + 1 : 1
            record["_id"] = id
            table["_records"].push(record)
            fs.writeFile(this.filename, JSON.stringify(this.content, null, 2), err => {
                callback(err)
            })
            return
        } else {
            callback(Error(`The table ${tablename} does not exist.`))
            return
        }
    }
    /**
     * Updates filtered records in the specified table (all records by default).
     * @public
     * @param {string} tablename Table name.
     * @param {object} data Data to update.
     * @param {function} filter Filter function.
     * @param {function} callback Callback function.
     * @example
     * db.update("members", { age: 38 }, record => record["name"] === "Jhon Doe", err => {
     *     if (err) throw err
     *     console.log("Your data has been updated!")
     * })
     * @return {void}
     */
    update(tablename, data, filter=() => true, callback=() => true) {
        if (typeof tablename !== "string") {
            callback(TypeError(`JsonDatabase.update: Argument 1 is not a string.`))
            return
        }
        if (typeof data !== "object") {
            callback(TypeError(`JsonDatabase.update: Argument 2 is not an object.`))
            return
        }
        if (typeof filter !== "function") {
            callback(TypeError(`JsonDatabase.update: Argument 3 is not a function.`))
            return
        }
        if (typeof callback !== "function") {
            callback(TypeError(`JsonDatabase.update: Argument 4 is not a function.`))
            return
        }
        if (this.tableExists(tablename)) {
            const table = this.content["tables"].find((table) => table["_name"] == tablename)
            for (const record of table["_records"]) {
                if (filter(record)) {
                    for (const key in data) {
                        if (data.hasOwnProperty(key)) {
                            const value = data[key],
                                  attr = table["_attributes"].find((a) => a.name === key)
                            if (attr === undefined) {
                                callback(Error(`Invalid record to update: No column named ${key}.`))
                                return
                            } else if (!attr.null && (value === null || isNaN(value))) {
                                callback(Error(`The value of ${attr.name} cannot be null.`))
                                return
                            } else if (attr.type !== "any" && value !== null && typeof value !== attr.type) {
                                callback(Error(`The value of ${attr.name} is not ${attr.type}.`))
                                return
                            }
                        }
                    }
                    Object.assign(record, data)
                }
            }
            fs.writeFile(this.filename, JSON.stringify(this.content, null, 2), err => {
                callback(err)
            })
            return
        } else {
            callback(Error(`The table ${tablename} does not exist.`))
            return
        }
    }
    /**
     * Delete filtered records in the specified table (all records by default).
     * @public
     * @param {string} tablename Table name.
     * @param {function} filter Filter function.
     * @param {function} callback Callback function.
     * @example
     * db.delete("members", record => record["name"] === "John Doe"), err => {
     *     if (err) throw err
     *     console.log("Your account has been deleted!")
     * })
     * @returns {void}
     */
    delete(tablename, filter=() => true, callback=() => true) {
        if (typeof tablename !== "string") {
            callback(TypeError(`JsonDatabase.delete: Argument 1 is not a string.`))
            return
        }
        if (typeof filter !== "function") {
            callback(TypeError(`JsonDatabase.delete: Argument 2 is not a function.`))
            return
        }
        if (typeof callback !== "function") {
            callback(TypeError(`JsonDatabase.delete: Argument 3 is not a function.`))
            return
        }
        if (this.tableExists(tablename)) {
            const table = this.content["tables"].find((table) => table["_name"] == tablename)
            for (let i = 0; i < table["_records"].length; i++) {
                const record = table["_records"][i]
                if (filter(record)) {
                    table["_records"].splice(i, 1)
                    i--
                }
            }
            fs.writeFile(this.filename, JSON.stringify(this.content, null, 2), err => {
                callback(err)
            })
            return
        } else {
            callback(Error(`The table ${tablename} does not exist.`))
            return
        }
    }
    /**
     * Drops the selected table.
     * @public
     * @param {string} tablename Name of the seleted table.
     * @param {function} callback Callback function.
     * @example
     * db.drop("members", err => {
     *     if (err) throw err
     *     console.log("The table has been deleted!")
     * })
     * @returns {void}
     */
    drop(tablename, callback=() => true) {
        if (typeof tablename !== "string") {
            callback(TypeError(`JsonDatabase.drop: Argument 1 is not a string.`))
            return
        }
        if (typeof callback !== "function") {
            callback(TypeError(`JsonDatabase.drop: Argument 2 is not a function.`))
            return
        }
        const table = this.content["tables"].find((table) => table["_name"] == tablename)
        let index = this.content["tables"].indexOf(table)
        if (index > -1) {
            this.content["tables"].splice(index, 1)
            fs.writeFile(this.filename, JSON.stringify(this.content, null, 2), err => {
                callback(err)
            })
            return
        } else {
            callback(Error(`The table ${tablename} does not exist.`))
            return
        }
    }
    /**
     * Returns the total number of filtered records (all records by default).
     * @public
     * @param {string} tablename Name of the specified table.
     * @param {function} filter Filter function.
     * @param {function} callback Callback function.
     * @example
     * db.count("members", record => record["age"] >= 20, (err, count) => {
     *     if (err) throw err
     *     console.log(`${count} members are over 20 years old!`)
     * })
     * @returns {void}
     */
    count(tablename, filter=() => true, callback=() => true) {
        if (typeof tablename !== "string") {
            callback(TypeError(`JsonDatabase.count: Argument 1 is not a string.`))
            return
        }
        if (typeof filter !== "function") {
            callback(TypeError(`JsonDatabase.count: Argument 2 is not a function.`))
            return
        }
        if (typeof callback !== "function") {
            callback(TypeError(`JsonDatabase.count: Argument 3 is not a function.`))
            return
        }
        let data = 0
        if (this.tableExists(tablename)) {
            const table = this.content["tables"].find((table) => table["_name"] == tablename)
            data = table["_records"].filter((record) => {
                return filter(record)
            }).length
            callback(null, data)
            return
        } else {
            callback(Error(`The table ${tablename} does not exist.`))
            return
        }
    }
}
module.exports = { JsonDataBase }
