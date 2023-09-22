module.exports = function (req, res, next) {
  // before in auth middeleware determine that req.user exist

  if (!req.user.isAdmin) {
    return res.status(403).send('Access denied')
  }

  next()
}