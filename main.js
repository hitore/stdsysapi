const mongoose = require('./db');
const app = require('./www');
const student = require('./components/student');

app.use(function(err, req, res, next) {
    res.send(err.message);
});

app.use('/api/v1', student.api);

