// 分配路由和method
const express = require('express');
const router = express.Router();
const loginController = require('./loginController');
const login = require('./login');
const Send = require('../../utils/send');

router.post('/login', function(req, res) {
    const handle = loginController.login(req.body);
    if (handle) {
        res.send(handle);
        return;
    }
    login.login(req.body, function(data) {
        res.send(data);
    });
})

router.get('/check_login', function(req, res) {
    res.send(new Send({}));
})

module.exports = router;