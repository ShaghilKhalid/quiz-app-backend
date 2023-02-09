const sql = require("mysql2")
const conn = sql.createConnection({
    host: "localhost", // HOST NAME
    user: "root", // USER NAME
    database: "quizapp", // DATABASE NAME
    password: "", // DATABASE PASSWORD
}).promise()
    .on("error", (err) => {
        console.log(err)
    });
module.exports = conn;