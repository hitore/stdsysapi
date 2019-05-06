var express=require('express');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/';
var path = require('path'); 
var bodyParser = require('body-parser')
var db = require('./dbhandle.js');
var jwt = require('jsonwebtoken');
var history = require('connect-history-api-fallback');

var secret = 'cym';

var app =express();
// 适配SPA页面
app.use(history());
app.use(express.static(path.join(__dirname, 'dist')));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

let noLogin = {
	'/login': true,
};

// 添加管理员
let user = {
	id: 1,
	name: 'cym',		// 用户名
	password: '123456',	// 密码(此处必须是字符串，否则登录失败)
	power: 1,			// 权限
};
hasUser();
function hasUser() {
	// 系统中是否存在管理员，如果没有则自动添加一个
	db.find('user', {}, res => {
		if (res.length > 0) {
			console.log(`系统已有管理员=>账号:${res[0].name}=>密码:${res[0].password}`);
		} else {
			addUser(user);
		}
	});
}
// 添加管理员
function addUser(user) {
	db.find('user', { $or: [ { id: user.id }, { name: user.name } ] }, res => {
		if (res.length > 0) {
			console.log('添加管理员失败，id或name已存在');
		} else {
			db.insert('user', user, res => {
				if (res.result.ok) {
					console.log(`${user.name}已添加成功,密码:${user.password}`);
				}
			});
		}
	});
};

app.use(function(req, res, next) {
	if (req._parsedUrl.pathname.indexOf('api')) {
		req._parsedUrl.pathname = req._parsedUrl.pathname.substr(4);
	}
	if (noLogin[req._parsedUrl.pathname]) {
		next();
	} else {
		const token = req.headers.authorization;
		if (token) {
			jwt.verify(token, secret, function(err, data) {
				if (err) {
					res.send({
						status: 20002,
						msg: err.message,
						data: {},
					});
				} else {
					next();
				}
			});
		} else {
			res.send({
				status: 20001,
				msg: '没有登录',
				data: {},
			});
		}
	}
});

// 登录校验
app.get('/check_login', function(req, resp) {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	resp.send(respone);
});

// 登录
app.post('/login', function(req, resp) {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const data = req.body;
	const user_name = data.user_name;
	const pass_word = data.pass_word;
	const filter = { name: user_name, password: pass_word };
	db.find('user', filter, function(res) {
		if (res.length === 0) {
			respone.status = 10001;
			respone.msg = '账号或密码错误';
		} else {
			const da = res[0];
			const obj = {
				name: da.name,
				id: da.id,
				power: da.power,
			}
			const token = jwt.sign(obj, secret);
			respone.data = {
				name: da.name,
				id: da.id,
				power: da.power,
				token,
			};
		}
		resp.send(respone);
	});
});

// 查询学生-分页
app.get('/check_student', function(req, resp) {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	/*
		@default
		page: 1,
		count: 7,
	*/
	const page = ~~req.query.page || 1;
	const count = ~~req.query.count || 7;
	db.find('student', {}, function(res) {
		res = res.reverse();
		const l = res.length;
		const start = (page - 1) * count;
		const end = start + count;
		res = res.splice(start, end);
		if (res.length !== 0) {
			res.forEach(item => {
				delete item._id;
			});
		}
		respone.data.std_list = res;
		respone.data.page_count = l % count > 0 ? parseInt(l / count, 10) + 1 : parseInt(l / count, 10);
		resp.send(respone);
	});
});

// 添加学生
app.post('/add_student', function(req, resp) {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const data = req.body.std_form;
	const filter = { id: data.id };
	db.find('student', filter, function(res) {
		if (res.length === 0) {
			db.insert('student', data, function(res) {
				if (res.result.n !== 1) {
					respone.status = 10003;
					respone.msg = '添加失败';
				}
				resp.send(respone);
			})
		} else {
			respone.status = 10002;
			respone.msg = '该学号已存在';
			resp.send(respone);
		}
	});
});

// 批量添加学生
app.post('/add_more_student', function(req, resp) {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const sex = {
		'男': 0,
		'女': 1,
		'未知': 2,
	};
	const data = req.body.std_form;
	const filter = { id: data.id };
	data.map(item => {
		item.sex = sex[item.sex];
		return item;
	});
	db.insertMany('student', data, res => {
		if (res.result.ok === 1) {
			resp.send(respone);
		} else {
			respone.status = 10003;
			respone.msg = '添加失败';
			resp.send(respone);
		}
	});
});

// 修改学生信息
app.post('/modifly_student', (req, resp) => {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const data = req.body.std_form;
	const filter = { id: data.id };
	db.find('student', filter, (res) => {
		if (res.length !== 0) {
			db.update('student', filter, data, (res2) => {
				if (res2.result.n !== 1) {
					respone.status = 10005;
					respone.msg = '修改失败';
				}
				resp.send(respone);
			});
		} else {
			respone.status = 10004;
			respone.msg = '该学号不存在';
			resp.send(respone);
		}
	});
});

// 删除学生信息
app.get('/delete_student', (req, resp) => {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const data = req.query;
	const filter = { id: data.id };
	const count = ~~data.count || 7;
	db.delete('student', filter, (res) => {
		if (res.result.n !== 1) {
			respone.status = 10006;
			respone.msg = '删除失败';
			resp.send(respone);
		} else {
			db.find('student', {}, (res2) => {
				const l = res2.length;
				respone.data.page_count = l % count > 0 ? parseInt(l / count, 10) + 1 : parseInt(l / count, 10);
				resp.send(respone);
			})
		}
	});
});

// 模糊查询-分页
app.get('/search_student', (req, resp) => {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const data = req.query;
	const page = data.page || 1;
	const count = data.count || 7;
	let filter = {};
	if (data.id) {
		filter.id = new RegExp(data.id);
	}
	if (data.name) {
		filter.name = new RegExp(data.name);
	}
	db.find('student', filter, (res) => {
		res = res.reverse();
		const l = res.length;
		const start = (page - 1) * count;
		const end = start + count;
		res = res.splice(start, end);
		if (res.length !== 0) {
			res.forEach(item => {
				delete item._id;
			});
		}
		respone.data.std_list = res;
		respone.data.page_count = l % count > 0 ? parseInt(l / count, 10) + 1 : parseInt(l / count, 10);
		resp.send(respone);
	});
});

// 添加教师
app.post('/add_teacher', function(req, resp) {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	/*
	 *	 id: ''
	 *	 name: ''
	 *	 sex: '',
	 *	 position: ''
	 *	 collage: ''
	 */
	const data = req.body.tea_form;
	data.power = 2;
	const filter = { name: data.name };
	db.find('user', filter, function(res) {
		if (res.length === 0) {
			db.find('user', {}, res2 => {
				data.id = res2.length + 1;
				db.insert('user', data, function(res) {
					if (res.result.n !== 1) {
						respone.status = 10008;
						respone.msg = '添加失败';
					}
					resp.send(respone);
				})
			});
		} else {
			respone.status = 10007;
			respone.msg = '该教师已存在';
			resp.send(respone);
		}
	});
});

// 查询教师-分页
app.get('/check_teacher', function(req, resp) {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	/*
		@default
		page: 1,
		count: 7,
	*/
	const page = ~~req.query.page || 1;
	const count = ~~req.query.count || 7;
	db.find('user', { power: 2 }, function(res) {
		res = res.reverse();
		const l = res.length;
		const start = (page - 1) * count;
		const end = start + count;
		res = res.splice(start, end);
		if (res.length !== 0) {
			res.forEach(item => {
				delete item._id;
			});
		}
		respone.data.tea_list = res;
		respone.data.total = l;
		// respone.data.page_count = l % count > 0 ? parseInt(l / count, 10) + 1 : parseInt(l / count, 10);
		resp.send(respone);
	});
});

// 修改教师信息
app.post('/modifly_teacher', (req, resp) => {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const data = req.body.tea_form;
	const filter = { id: ~~data.id };
	db.find('user', filter, (res) => {
		if (res.length !== 0) {
			db.update('user', filter, data, (res2) => {
				if (res2.result.n !== 1) {
					respone.status = 10005;
					respone.msg = '修改失败';
				}
				resp.send(respone);
			});
		} else {
			respone.status = 10004;
			respone.msg = '该职工号不存在';
			resp.send(respone);
		}
	});
});

// 删除教师信息
app.get('/delete_teacher', (req, resp) => {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const data = req.query;
	const id = ~~data.id;
	const filter = { id };
	// const count = ~~data.count || 7;
	db.delete('user', filter, (res) => {
		if (res.result.n !== 1) {
			respone.status = 10006;
			respone.msg = '删除失败';
			resp.send(respone);
		} else {
			db.updateMore('user', { id: { $gt: id } }, { $inc: { id: -1 } }, res3 => {
				if (res3.result.ok) {
					db.find('user', {}, (res2) => {
						const l = res2.length;
						respone.data.total = l;
						// respone.data.page_count = l % count > 0 ? parseInt(l / count, 10) + 1 : parseInt(l / count, 10);
						resp.send(respone);
					});
				} else {
					respone.status = 30006;
					respone.msg = '发生错误';
					resp.send(respone);
				}
			});
			
		}
	});
});

// 模糊查询-分页
app.get('/search_teacher', (req, resp) => {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const data = req.query;
	const page = data.page || 1;
	const count = data.count || 7;
	let filter = {};
	// if (data.id) {
	// 	filter.id = new RegExp(~~data.id);
	// }
	// if (data.name) {
	// 	filter.name = new RegExp(data.name);
	// }
	filter.name = data.name;
	if (data.id) {
		filter = { id: ~~data.id, power: 2 };
	} else {
		filter = { name: data.name, power: 2 };
	}
	db.find('user', filter, (res) => {
		res = res.reverse();
		const l = res.length;
		const start = (page - 1) * count;
		const end = start + count;
		res = res.splice(start, end);
		if (res.length !== 0) {
			res.forEach(item => {
				delete item._id;
			});
		}
		respone.data.tea_list = res;
		respone.data.total = l;
		// respone.data.page_count = l % count > 0 ? parseInt(l / count, 10) + 1 : parseInt(l / count, 10);
		resp.send(respone);
	});
});

// 获取教师列表
app.get('/get_teacher', (res, resp) => {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const filter = { power: 2 };
	db.find('user', filter, res => {
		res.forEach(item => {
			delete item.password;
		});
		respone.data.teacher_list = res;
		resp.send(respone);
	});
});

// 匹配科目
app.get('/match_subject', (req, resp) => {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const data = req.query;
	const subject_id = ~~data.subject_id;
	const user = data.user;
	const arr = [];
	user.forEach(item => {
		arr.push({ id: ~~item });
	});
	const filter = { $or: arr };
	const filter2 = { $or: arr, subject_list: subject_id };
	const token = req.headers.authorization;
	jwt.verify(token, secret, function(err, data) {
		const power = data.power;
		if (power !== 1) {
			respone.status = 30003;
			respone.msg = '没有添加权限';
			resp.send(respone);
		} else {
			db.find('user', filter2, res => {
				if (res.length > 0) {
					respone.status = 30002;
					respone.msg = '科目已存在';
					resp.send(respone);
				} else {
					db.updateMore('user', filter, { $push: { subject_list: subject_id } }, res2 => {
						if (res2.result.ok) {
							resp.send(respone);
						} else {
							respone.status = 30001;
							respone.msg = '添加失败';
							resp.send(respone);
						}
					});
				}
			});
		}
	});
});

// 获取其它设置信息--学院/专业/班级
app.get('/other', (req, resp) => {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	db.find('collage', {}, (res) => {
		respone.data.list = res;
		resp.send(respone);
	});
});

// 添加学院
app.get('/add_collage', (req, resp) => {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const data = req.query;
	const collageName = data.collage_name;
	db.find('collage', { name: collageName }, (res) => {
		if (res.length === 0) {
			db.find('collage', {}, (res2) => {
				const id = res2.length + 1;
				const insertData = {
					name: collageName,
					id,
				};
				db.insert('collage', insertData, (res3) => {
					if (res3.result.n === 1) {
						resp.send(respone);
					} else {
						respone.msg = '学院添加失败';
						respone.status = 10010;
						resp.send(respone);
					}
				});
			});
		} else {
			respone.msg = '该学院已存在';
			respone.status = 10009;
			resp.send(respone);
		}
	});
});

// 删除学院
app.get('/remove_collage', function(req, resp) {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const data = req.query;
	const id = ~~data.id;
	const filter = { id };
	db.delete('collage', filter, function(res) {
		if (res.result.n === 1) {
			db.updateMore('collage', { id: { $gt: id } }, { $inc: { id: -1 } }, function(res2) {
				if (res2.result.ok) {
					resp.send(respone);
				} else {
					respone.msg = '发生错误';
					respone.status = 10012;
					resp.send(respone);
				}
			});
		} else {
			respone.msg = '删除失败';
			respone.status = 10011;
			resp.send(respone);
		}
	});
});

// 添加专业
app.get('/add_speciality', (req, resp) => {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const data = req.query;
	const id = ~~data.id;
	const speciality_name = data.speciality_name;
	db.find('collage', { 'speciality.name': speciality_name}, (res) => {
		if (res.length > 0) {
			respone.msg = '该专业已存在';
			respone.status = 10014;
			resp.send(respone);
		} else {
			db.updateMore('collage', { id }, { $push: { speciality: { name: speciality_name } } }, (res2) => {
				if (res2.result.ok) {
					resp.send(respone);
				} else {
					respone.msg = '添加失败';
					respone.status = 10013;
					resp.send(respone);
				}
			});
		}
	});
});

// 删除专业
app.get('/delete_speciality', (req, resp) => {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const data = req.query;
	const id = ~~data.id;
	const speciality_name = data.speciality_name;
	db.updateMore('collage', { id }, { $pull: { speciality: { name: speciality_name } } }, res => {
		if (res.result.ok) {
			resp.send(respone);
		} else {
			respone.msg = '删除失败';
			respone.status = 10014;
			resp.send(respone);
		}
	});
});

// 添加班级
app.get('/add_class', (req, resp) => {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const data = req.query;
	const id = ~~data.id;
	const speciality_index = ~~data.speciality_index;
	const class_name = data.class_name;
	const str = 'speciality.' + speciality_index + '.class';
	const update = { $push: { [str] : class_name } };
	db.find('collage', { 'speciality.class': class_name }, res => {
		if (res.length > 0) {
			respone.msg = '该班级已存在';
			respone.status = 10015;
			resp.send(respone);
		} else {
			db.updateMore('collage', { id }, update, res2 => {
				if (res2.result.ok) {
					resp.send(respone);
				} else {
					respone.msg = '添加失败';
					respone.status = 10016;
					resp.send(respone);
				}
			});
		}
	});
});

// 删除班级
app.get('/delete_class', (req, resp) => {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const data = req.query;
	const id = ~~data.id;
	const speciality_index = ~~data.speciality_index;
	const class_name = data.class_name;
	const str = 'speciality.' + speciality_index + '.class';
	const update = { $pull: { [str]: class_name } };
	db.updateMore('collage', { id }, update, res => {
		if (res.result.ok) {
			resp.send(respone);
		} else {
			respone.msg = '删除失败';
			respone.status = 10017;
			resp.send(respone);
		}
	});
});

// 添加科目
app.get('/add_subject', (req, resp) => {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const data = req.query;
	const subject_name = data.subject_name;
	const filter = { name: subject_name };
	db.find('subject', filter, res => {
		if (res.length > 0) {
			respone.status = 10018;
			respone.msg = '该科目已存在';
			resp.send(respone);
		} else {
			db.find('subject', {}, res2 => {
				const id = res2[0].count + 1;
				db.insert('subject', { id, name: subject_name }, res3 => {
					if (res3.result.ok) {
						db.updateMore('subject', { count: res2[0].count }, { $inc: { count: 1 } }, res4 => {
							resp.send(respone);
						});
					} else {
						respone.status = 10019;
						respone.msg = '添加失败';
						resp.send(respone);
					}
				});
			});
		}
	});
});

// 查询科目
app.get('/check_subject', (req, resp) => {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	db.find('subject', {}, res => {
		respone.data.subject_list = res.splice(1);
		resp.send(respone);
	});
});

// 删除科目
app.get('/delete_subject', (req, resp) => {
	const respone = {
		status: 0,
		msg: '',
		data: {},
	};
	const data = req.query;
	const id = ~~data.id;
	const token = req.headers.authorization;
	jwt.verify(token, secret, function(err, data) {
		const power = data.power;
		if (power === 1) {
			db.delete('subject', { id }, res => {
				if (res.result.ok) {
					resp.send(respone);
					// db.updateMore('subject', { id: { $gt: id } }, { $inc: { id: -1 } }, res2 => {
					// 	if (res2.result.ok) {
					// 		resp.send(respone);
					// 	} else {
					// 		respone.status = 10022;
					// 		respone.msg = '发生错误';
					// 		resp.send(respone);
					// 	}
					// });
				} else {
					respone.status = 10021;
					respone.msg = '删除失败';
					resp.send(respone);
				}
			});
		} else {
			respone.status = 10020;
			respone.msg = '没有删除权限';
			resp.send(respone);
		}
	});
});



//配置服务端口
var server = app.listen(3000, function () {
    console.log('your server are run at http://localhost:3000');
})