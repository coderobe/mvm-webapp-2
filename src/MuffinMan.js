module.exports = {
  jar: require("cookies-js"),
  edit: function(cookie, json) {
    let curc = this.get()
    if(curc != undefined){
      if(window.Debug) console.log(curc)
      if(window.Debug) console.log(json)
      json = _.extend(curc, json)
      if(window.Debug) console.log(curc)
      if(window.Debug) console.log(json)
    }
    if(window.Debug) console.log(JSON.stringify(json))
    this.jar.set(cookie, JSON.stringify(json), {
      expires: Infinity,
      secure: true,
    })
    return json
  },
  get: function(cookie) {
    try{
      return JSON.parse(this.jar.get(cookie))
    }catch(SyntaxError){
      if(window.Debug) console.log("Parsing cookie failed")
      return {}
    }
  },
  remove: function(cookie) {
    this.jar.expire(cookie)
  }
}
