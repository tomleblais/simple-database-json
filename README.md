# simple-database-json

## Introduction

The "simple-database-json" library exported as [Node.js](https://nodejs.org/) modules. It allows you to manage a database in a simple and lisible json file.

## Installation

Using [npm](https://npmjs.com/):

```
npm i simple-database-json
```

If you use [Nodemon](https://nodemon.io/), it's recommended to add the field below in your *package.json* file:
```
"script": {
    "start": "nodemon index.js --ignore 'database.json'"
}
```
Otherwise, every time you send a request, Nodemon will automatically reload.

If you want more informations about ignoring files with Nodemon, click [here](https://github.com/remy/nodemon#ignoring-files).

## Usage

In your *index.js* file:
```js
const { JsonDataBase } = require("simple-database-json")

const db = new JsonDataBase("data/example.json")
```

See the full API documentation [here](https://github.com/LeTomium/simple-database-json/blob/master/API.md).

## Links
- [Github](https://github.com/LeTomium/simple-database-json)
- [NPM](https://www.npmjs.com/package/simple-database-json)