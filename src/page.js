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
        users: [],
        app: window.app,
        turn: null,
      },
      methods: {
        ban: function(event){
          console.log(event)
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
          _.each(m, function(v,k){
            new_maps.push([v, true])
          })
          _.each(mo, function(v,k){
            new_maps.push([v, false])
          })
          new_maps = new_maps.sort((a,b) => a[0].localeCompare(b[0]))
          this.maps = new_maps
        }
      },
    },
    //END MAPVOTE
  },
  setup: function(){ /*executes when the module is required, extends this.data*/
    _.each(module.exports.data, (value, key) => {
      module.exports.data[key] = _.extend(value, this.preset)
      console.log(module.exports.data[key])
    })
  },
}
