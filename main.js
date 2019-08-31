const jwt = require('jsonwebtoken');
const mongoose = require('./db');
const app = require('./www');
const Send = require('./utils/send');
const { secret, hasUser } = require('./utils/util');
const student = require('./components/student');
const login = require('./components/login');

const passUrl = [
    '/api/login',
];

hasUser();

app.use(function(req, res, next) {
    console.log(`${new Date()} LOG: ${req.url}`);
    // 登录鉴权
    if (passUrl.includes(req.url)) {
        next();
        return;
    }
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, secret, function(err, data) {
            if (err) {
                res.send(new Send({
                    status: 20002,
                    msg: err.message,
                }));
            } else {
                next();
            }
        });
    } else {
        res.send(new Send({
            status: 20001,
            msg: '没有登录',
        }));
    }
});

app.use('/api', student.api);
app.use('/api', login.api);

