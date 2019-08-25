// dal是数据访问层的英文缩写，即为数据访问层（Data Access Layer）。
// 其功能主要是负责数据库的访问。
// 简单地说就是实现对数据表的Select（查询）、Insert（插入）、Update（更新）、Delete（删除）等操作。
const mongoose = require('../../db');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    id:  String,
    name: String,
    sex:   String,
});

const Blog = mongoose.model('student', blogSchema);

const student = {
    getList() {
        Blog.find({name: ''}, function(err, res) {
            console.log(1);
            console.log(res);
        });
        // return Blog.find({}).exec();
    },
};

module.exports = student;