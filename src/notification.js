module.exports = {
  input: function() {
    let args = Array.prototype.slice.call(arguments)
    return new Promise((resolve, reject) => {
      args = args.concat([resolve])
      notie.input.apply(notie, args)
    })
  },
  alert: notie.alert,
}
