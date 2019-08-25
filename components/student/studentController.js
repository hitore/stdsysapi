// controller只处理数据（判断有没有缺少的数据），不做业务逻辑
const student = {
    // 查询学生-分页
    checkStudent(body) {
        const error = {
            status: 10001,
            msg: 'error',
        };
        // throw Error(error);
    },
};

module.exports = student;