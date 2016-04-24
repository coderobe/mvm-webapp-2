"use strict"

require("../node_modules/bulma/css/bulma.min.css")
require("../node_modules/notie/notie.scss")
require("./style.css")
window._ = require("underscore")
window.$ = require("jquery")
window.Vue = require("vue")
window.Cookie = require("./MuffinMan.js")
window.notie = require("notie")
window.psleep = require("psleep")

notie.setOptions({
  backgrouncClickDismiss: false,
})

window.app = {}
app.notification = require("./notification.js")
app.page = require("./page.js")
app.page.setup()
app.user = require("./user.js")
app.socket = null
app.do = {}
app.do.select = {
  lobby: async (lobby = null) => {
    while(_.isNull(lobby) || _.isEmpty(lobby)){
      lobby = await app.notification.input({
        type: "text",
        placeholder: "Lobby name",
      }, "Please enter a lobby name: ", "Submit", "Cancel")
    }
    if(_.isNull(lobby) || _.isEmpty(lobby)){
      app.do.select.lobby(lobby)
    }else{
      location.hash = lobby
      app.notification.alert(1, "Joining "+lobby, 1)
      if(app.page.current == "mapvote") location.reload()
      await psleep(500)
      app.user.lobby = lobby
      app.socket.send("JOIN "+lobby)
    }
  },
  username: async (username = null) => {
    while(_.isNull(username) || _.isEmpty(username)){
      username = await app.notification.input({
        type: "text",
        placeholder: "Anonymous Coward",
      }, "Please choose a username: ", "Submit", "Cancel")
    }
    if(_.isNull(username) || _.isEmpty(username)){
      app.do.select.username(username)
    }else{
      Cookie.edit("mvm", {username: username})
      if(app.page.current == "mapvote"){
        location.hash = app.user.lobby
        location.reload()
      }else{
        app.notification.alert(1, "Hello "+username, 1)
        await psleep("1 second")
        app.user.name = username
        app.socket.send("IDENTIFY "+username)
      }
    }
  },
}
app.do.run = () => {
  app.socket = new WebSocket("wss://proxy.coderobe.net:420/mvm")
  app.socket.onclose = async () => {
    app.notification.alert(3, "Disconnected from Server. Reconnecting.", 3)
    await psleep("3 seconds")
    app.do.run()
  }
  app.socket.onopen = async () => {
    let username = null
    let cookie = Cookie.get("mvm")
    if(!_.isNull(app.user.name) && !_.isEmpty(app.user.name))
      username = app.user.name
    else if(!_.isUndefined(cookie) && !_.isUndefined(cookie.username))
      username = cookie.username
    app.do.select.username(username)
  }
  app.socket.onmessage = async (message) => {
    message = JSON.parse("{"+message.data+"}")
    let type = _.keys(message)[0]
    let data = message[type]
    console.log(type)
    console.log(data)
    switch(type){
      case "NO_SESSION":
        let hash = window.location.hash.substring(1)
        let lobby = null
        if(!_.isNull(app.user.lobby) && !_.isEmpty(app.user.lobby))
          lobby = app.user.lobby
        else if(!_.isUndefined(hash) && !_.isNull(hash) && !_.isEmpty(hash))
          lobby = hash
        app.do.select.lobby(lobby)
        break
      case "JOIN_SUCCESS":
        app.user.id = data.UID
        app.page.load("mapvote")
        break
      case "SESSION":
        if(app.page.current = "mapvote"){
          let users = []
          _.each(data.MEMBER, (value,key) => {
            users.push({name: value, id: key})
          })
          app.user.lobby = data.SESSION
          app.page.object.users = users
          if(_.isUndefined(data.MAPS_OUT)){
            app.page.object.changemaps(data.MAPS, [])
          }else{
            app.page.object.changemaps(data.MAPS, data.MAPS_OUT)
          }
          if(data.STATUS == "INSESSION"){
            app.page.object.turn = data.TURN
          }
        }
        break
      case "ERROR":
        let al = data.DESCRIPTION
        al = al.charAt(0) + al.toLowerCase().slice(1)
        app.notification.alert(2, al, 2)
        if(data.NUMBER >= 10 && data.NUMBER < 20){
          await psleep("2 seconds")
          app.do.select.lobby()
        }
        break
      case "MESSAGE":
        if(_.isUndefined(data.SENDER))
          data = {SENDER: null, MESSAGE: data}
        let msgobj = {sender: data.SENDER, content: data.MESSAGE}
        app.page.object.messages.push(msgobj)
        Vue.nextTick(() => {
          $(".chatlog").animate({ scrollTop: $(document).height() }, 0)
        })
    }
  }
}

app.page.load("loading")
app.do.run()
