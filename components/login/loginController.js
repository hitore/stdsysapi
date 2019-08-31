// controller只处理数据（判断有没有缺少的数据），不做业务逻辑
const Send = require('../../utils/send');
const login = {
    login(body) {
        if (!body.user_name) return new Send({
            status: 30001,
            msg: '缺少参数user_name',
        });
        if (!body.pass_word) return new Send({
            status: 30002,
            msg: '缺少参数pass_word',
        });
    },
};

module.exports = login;