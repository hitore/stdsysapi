const login = require('../components/login/loginDAL');

const user = {
    id: 1,
    name: 'test',
    password: '123456',
    power: 1,
};

function hasUser() {
    login.getUsers(function(users) {
        if (users.length) {
            console.log(`系统已有管理员=>账号:${users[0].name}=>密码:${users[0].password}`);
        } else {
            login.addUser(user, function(res) {
                if (res) {
					console.log(`添加管理员成功 账号${user.name} 密码:${user.password}`);
				}
            });
        }
    });
}

module.exports = {
    secret: 'cym',
    hasUser,
};