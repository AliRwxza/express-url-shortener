function responseHandler(res, status, content, headers=null) {
  if (headers) {
    res.set(headers);
  }
  return res.status(status).json(content);
}

module.exports = responseHandler;