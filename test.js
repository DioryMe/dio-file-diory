const { initRoom } = require('./dist/initRoom')

initRoom().then((room) => {
  console.log(room.diograph.toObject())
  room.saveRoom()
})
