// dal是数据访问层的英文缩写，即为数据访问层（Data Access Layer）。
// 其功能主要是负责数据库的访问。
// 简单地说就是实现对数据表的Select（查询）、Insert（插入）、Update（更新）、Delete（删除）等操作。
const mongoose = require('../../db');
const Schema = mongoose.Schema;

const Login = new Schema({
    id: Number,
    name: String,
    password: String,
    power: Number,
});

const loginHandle = mongoose.model('user', Login);

const login = {
    getUsers(fn) {
        loginHandle.find({}, function(err, res) {
            fn(res);
        });
    },
    addUser(data, fn) {
        loginHandle.create({
            ...data
        }, function(err, res) {
            fn(res);
        });
    },
    searchUser(userName, password, fn) {
        loginHandle.find({
            name: userName,
            password: password,
        }, function(err, res) {
            fn(res);
        });
    },
};

module.exports = login;