function Send(data) {
    this.status = data.status || 0;
    this.data = data.data || {};
    this.msg = data.msg || '';
}

module.exports = Send;