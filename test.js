const { initRoom, loadRoom } = require('./dist/initRoom')

// initRoom().then((room) => {
//   console.log(room.diograph.toObject())
//   room.saveRoom()
// })

loadRoom().then((room) => {
  console.log('diograph', room.diograph.toObject())
  console.log('room', room.toObject())
  room.diograph.createDiory({ text: `New Diory: ${Date.now()}` })
  room.saveRoom()
})
