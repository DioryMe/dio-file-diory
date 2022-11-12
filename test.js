const {
  initRoom,
  initRoomLocal,
  loadRoom,
  loadRoomLocal,
  generateAndAddDioryFromFilePath,
} = require('./dist/utils')

// initRoom('diory-camera-upload').then((room) => {
//   generateAndAddDioryFromFilePath('/Users/Jouni/MyPictures/my-pic.jpg', room, true).then(() => {
//     room.saveRoom()
//   })
// })

initRoomLocal('/Users/Jouni/TestRoom').then((room) => {
  generateAndAddDioryFromFilePath('/Users/Jouni/MyPictures/my-pic.jpg', room, true).then(() => {
    room.saveRoom()
  })
})
