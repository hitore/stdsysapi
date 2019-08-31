// 业务逻辑
const jwt = require('jsonwebtoken');
const loginDAL = require('./loginDAL');
const Send = require('../../utils/send');
const { secret } = require('../../utils/util');

const login = {
    login(data, callback) {
        loginDAL.searchUser(data.user_name, data.pass_word, function(res) {
            if (res.length) {
                const user = res[0];
                const obj = {
                    name: user.name,
                    id: user.id,
                    power: user.power,
                }
                const token = jwt.sign(obj, secret);
                callback(new Send({
                    data: {
                        token,
                        ...obj,
                    },
                }));
                return;
            }
            callback(new Send({
                status: 10001,
                msg: '账号或密码错误',
            }));
        });
    },
};

module.exports = login;