// Import Packages
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const conn = require("./DB/connection")
const app = express();
const port = 3001;

// functions
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Api's

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
// Get Admin by id 
app.get("/getAdminById/:id", async (req, res) => {
    try {
        const [rows] = await conn.execute("Select * from adminlogin where id=?", [req.params.id]);
        return res.status(200).send({
            status: 200,
            data: rows,
            message: "Admin Id fetched!!!"
        })
    } catch (err) {
        console.log("err", err)
    }
});
// Get Candidate by id 
app.get("/getCandidateByAdminId", async (req, res) => {
    try {
        // console.log("working")
        // return
        const [rows] = await conn.execute("Select * from adminlogin");
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
})
app.listen(port, () => console.log(`Listening on port ${port}`))

// Code for Shaghil