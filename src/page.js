module.exports = {
  current: null, /*string: current page name*/
  last: null, /*string: last page name*/
  wrapper: new Vue({
    el: "#container",
    data: {
      content: "",
    },
  }),
  object: null, /*vue: current page*/
  load: function(page) {
    if(!_.isNull(this.current)) this.last = this.current
    module.exports.current = page
    module.exports.wrapper.content = module.exports.data[page].data.content
    Vue.nextTick(function(){
      //$("#container")[0].innerHTML = "{{{ content }}}"
      module.exports.object = new Vue(module.exports.data[page])
      $("form").find("input[type=text]").filter(":first").focus()
    })
  },
  preset: { /*will be applied to every object in this.data*/
    el: "#container",
  },
  data: { /*contains vue-compatible objects for replacing page content & co*/
    //BEGIN LOADING
    loading: {
      data: {
        content: require("./templates/loading.pug")(),
      },
      methods: {},
    },
    //END LOADING
    //BEGIN MAPVOTE
    mapvote: {
      data: {
        content: require("./templates/mapvote.pug")(),
        maps: [],
        maps_banned: [],
        maps_available: [],
        maps_view: 0,
        users: [],
        app: window.app,
        turn: null,
        messages: [],
      },
      methods: {
        changeview: function(event){
          switch(event.target.innerText){
            case "All":
              this.changecat(0)
              break
            case "Available":
              this.changecat(1)
              break
            case "Banned":
              this.changecat(2)
              break
          }
          Cookie.edit("mvm", {mapview: this.maps_view})
        },
        changecat: function(vn){
          this.maps_view = vn
          $(".changeview").removeClass("is-active")
          _.each($(".changeview"), (elem,k) => {
            let label = elem.innerText
            switch(vn){
              case 0:
                if(label == "All"){
                  $(elem).addClass("is-active")
                }
                break
              case 1:
                if(label == "Available"){
                  $(elem).addClass("is-active")
                }
                break
              case 2:
                if(label == "Banned"){
                  $(elem).addClass("is-active")
                }
                break
            }
          })
        },
        sendmessage: function(event){
          if(window.Debug) console.log(event)
          let msg = event.target.value
          if(_.isEmpty(msg)) return
          app.socket.send("MESSAGE "+msg)
          event.target.value = ""
        },
        turnhighlight: function(id){
          return this.turn-1 == id
        },
        ban: function(event){
          let map = event.target.innerText
          app.socket.send("VOTE "+map)
        },
        votestart: function(){
          app.socket.send("START")
        },
        votereset: function(){
          app.socket.send("RESET")
        },
        changelobby: function(){
          app.do.select.lobby()
        },
        changename: function(){
          app.do.select.username()
        },
        changemaps: function(m, mo) {
          let new_maps = []
          let aiv_maps = []
          let ban_maps = []
          _.each(m, function(v,k){
            new_maps.push([v, true])
            aiv_maps.push([v, true])
          })
          _.each(mo, function(v,k){
            new_maps.push([v, false])
            ban_maps.push([v, false])
          })
          new_maps = new_maps.sort((a,b) => a[0].localeCompare(b[0]))
          this.maps = new_maps
          this.maps_available = aiv_maps.sort((a,b) => a[0].localeCompare(b[0]))
          this.maps_banned = ban_maps.sort((a,b) => a[0].localeCompare(b[0]))
        }
      },
    },
    //END MAPVOTE
  },
  setup: function(){ /*executes when the module is required, extends this.data*/
    _.each(module.exports.data, (value, key) => {
      module.exports.data[key] = _.extend(value, this.preset)
      if(window.Debug) console.log(module.exports.data[key])
    })
  },
}
