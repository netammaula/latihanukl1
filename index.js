//Mendeklarasikan dependensi yang digunakan
const express = require('express')
const jwt = require('jsonwebtoken')
const mysql = require('mysql')
const bodyParser = require('body-parser')

const app = express()
const port = 2800;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

//Membuat koneksi ke dalam database
const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root', 
    password: '',
    database: 'jual-buah'
})

const isAuthorized = (request, result, next) => {
    if (typeof request.headers["token"] == "undefined") {
        return result.status(403).json({
            success: false,
            message: "Unathorized. Token isn't provided"
        })
    }

    let token = request.headers["token"]

    jwt.verify(token, "SuperSecRetKey", (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: "Unauthorized. Token is invalid"
            })
        }
    })
    next()
}

//Login Admin
app.post('/admin', function(request, response) {
    let data = request.body 
    
    var username = data.username;
    var password = data.password;
    if (username && password) {
        db.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = data.username;
                response.redirect('/admin')
            } else {
                response.send('Username/Password Salah')
            } 
            response.end()
        })
    } else {
        response.send('Masukkan username/password')
        response.end()
    }
})

app.get('/admin', function(request, results) {
    if (request.session.loggedin) {
        let data = request.body 
        let token = jwt.sign(data.username + '|' +data.password, secretKey)

        result.json({
            success: true,
            message: 'Login Sukses!',
            token: token 
        })
    } else {
        result.json({
            success: false,
            message: 'Silahkan Login Dahulu!'
        })
    }
    result.end()
})

app.listen(port, () => {
    console.log('App running on port ' + port)
})
