// Import Packages
const { Server } = require('socket.io')
const express = require("express");
const http = require("http")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const conn = require("./DB/connection")
const app = express();
const port = 3001;
require("events").EventEmitter.defaultMaxListeners = 20;
// functions
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
// Api's
const io = new Server(3002, {
    transport: ['polling'],
    cors: {
        origin: "*"
    }
})
const message = io.of("/message")
message.on("connection", async (socket) => {
    var [rows2] = await conn.execute('SELECT * FROM questions')
    socket.on("message", async (data, data2) => {
        const [rows] = await conn.execute("Insert into questions (`question`,`user_id`) value(?,?)", [data, data2])
        var [rows2] = await conn.execute('SELECT * FROM questions')
        socket.broadcast.emit("receive_message", rows2)
    })
    socket.emit("receive_message", rows2)

})
// Admin Login
app.post("/adminLogin", async (req, res) => {
    let [rows] = await conn.execute("Select * from adminlogin where email=? ", [req.body.email])
    const passmatch = await bcrypt.compare(req.body.password, rows[0].password)
    if (passmatch === true) {
        var theToken = jwt.sign({ id: req.body.email }, "key", { expiresIn: "300s" });
        return res.status(200).send({
            status: 200,
            data: rows,
            token: theToken,
            response: "Login successfully"

        })
    }
    else {
        return res.send({
            message: "Incorrect password or email"
        })
    }


});
// Admin Sign Up
app.post("/signupAdmin", async (req, res) => {
    try {
        const [rows1] = await conn.execute("Select * from adminlogin where email=?", [req.body.email]);
        if (rows1.length > 0) {
            return res.status(201).send({
                status: 201,
                message: "User Already exist"
            })
        } else {
            const hashpassword = await bcrypt.hash(req.body.password, 12)
            const [rows] = await conn.execute(`INSERT INTO adminlogin (email,password) VALUES ('${req.body.email}','${hashpassword}')`);
            if (rows.affectedRows === 1) {
                return res.status(200).send({
                    status: 200,
                    message: "User Created Successfully"
                })

            }
        }
    } catch (err) {
        console.log("err", err)
    }
});
// Get Candidate by id 
app.get("/getCandidate", async (req, res) => {
    try {
        const [rows] = await conn.execute("Select * from candidate_login");
        return res.status(200).send({
            status: 200,
            data: rows,
            message: "Candidates fetched!!!"
        })
    } catch (err) {
        console.log("err", err)
    }
});
// Candidate Login
app.post("/candidateLogin", async (req, res) => {
    let [rows] = await conn.execute("Select * from candidate_login where email=? ", [req.body.email])
    const passmatch = await bcrypt.compare(req.body.password, rows[0].password)
    if (passmatch === true) {
        var theToken = jwt.sign({ id: req.body.email }, "key", { expiresIn: "300s" });
        return res.status(200).send({
            status: 200,
            data: rows,
            token: theToken,
            response: "Login successfully"

        })
    }
    else {
        return res.send({
            message: "Incorrect password or email"
        })
    }


});
// Signup Candidate
app.post("/signupCandidate", async (req, res) => {
    try {
        const [rows1] = await conn.execute("Select * from candidate_login where email=?", [req.body.email]);
        if (rows1.length > 0) {
            return res.status(201).send({
                status: 201,
                message: "User Already exist"
            })
        } else {
            const hashpassword = await bcrypt.hash(req.body.password, 12)
            const [rows] = await conn.execute(`INSERT INTO candidate_login (email,password,user_id) VALUES ('${req.body.email}','${hashpassword}','${req.body.user_id}')`);
            if (rows.affectedRows === 1) {
                return res.status(200).send({
                    status: 200,
                    message: "User Created Successfully"
                })
            }
        }
    } catch (err) {
        console.log("err", err)
    }
});
// Get Candidate
app.get("/getCandidate", async (req, res) => {
    const [rows] = await conn.execute("Select * from candidate_login")
    return res.status(200).send({
        status: 200,
        data: rows,
        message: "candidate fetched!!"
    })
});
// Delete Candidate
app.post("/deleteCandidate", async (req, res) => {
    try {
        const [rows] = await conn.execute("Delete from candidate_login where id=?", [req.body.id])
        if (rows.affectedRows) {
            return res.send({
                status: 200,
                message: "candidate_login Deleted"
            })
        }
    } catch (error) {
        console.log(error)
    }

});
// Get Candidate by id
app.get("/getCandidateById/:id", async (req, res) => {
    try {
        const [rows] = await conn.execute(`Select * from candidate_login where id=?`, [req.params.id])

        if (rows.length > 0) {
            return res.send({
                status: 200,
                data: rows,
                message: "fetched!!!"
            })
        }
    } catch (error) {
        console.log(error)
    }

});
// Insert Questions

app.post("/insertQuestions", async (req, res) => {
    try {
        const [rows] = await conn.execute(`INSERT INTO questions (question,user_id) VALUES ('${req.body.question}','${req.body.user_id}')`, [req.body.question], [req.body.user_id])
        if (rows.affectedRows) {
            return res.send({
                status: 200,
                message: "Question inserted"
            })
        }
    } catch (error) {
        console.log(error)
    }

});
// Get Questions
app.get("/getQuestions", async (req, res) => {
    try {
        const [rows] = await conn.execute("Select * from questions")
        return res.send({
            status: 200,
            data: rows,
            message: "fetched"
        })

    } catch (error) {
        console.log(error)
    }

});
app.listen(port, () => console.log(`Listening on port ${port}`))
// Code for Shaghil