const express = require('express');
const history = require('connect-history-api-fallback');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

/*
// 适配SPA页面
app.use(history());
app.use(express.static(path.join(__dirname, 'dist')));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
*/

//配置服务端口
const server = app.listen(3000, function () {
    console.log('your server are run at http://localhost:3000');
})

module.exports = app;