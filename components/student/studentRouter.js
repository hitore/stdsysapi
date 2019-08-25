// 分配路由和method
const express = require('express');
const router = express.Router();
const studentController = require('./studentController');
const studentDAL = require('./studentDAL');

router.get('/hello', function(req, res) {
    studentController.checkStudent(req);
    const data = studentDAL.getList();
    // data.addBack(function(err, doc) {
    //     console.log(doc);
    // });
    // res.send(data);
    // console.log(data);
    // console.log(req);
    // console.log(res);
    // res.send({
    //     code: 0,
    //     message: 'success',
    //     data: {},
    // });
})

module.exports = router;