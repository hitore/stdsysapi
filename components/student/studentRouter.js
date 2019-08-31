// 分配路由和method
const express = require('express');
const router = express.Router();
const studentController = require('./studentController');
const studentDAL = require('./studentDAL');
const student = require('./student');

router.get('/getStudentList', function(req, res) {
    studentController.checkStudent(req);
    studentDAL.getList(function(data) {
        res.send(student.getStudentList(data));
    });
})

module.exports = router;