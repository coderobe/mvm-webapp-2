module.exports = {
  name: null,
  lobby: null,
  id: null,
  change: {
    name: function(to){
      module.exports.name = to
    },
    lobby: function(to){
      module.exports.lobby = to
    },
    id: function(to){
      module.exports.id = to
    },
  },
}
