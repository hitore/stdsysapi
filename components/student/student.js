// 业务逻辑
const { Send } = require('../../utils/util');

const student = {
    getStudentList(data) {
        return new Send({
            data,
        });
    },
};

module.exports = student;