const {
  initRoom,
  initRoomLocal,
  loadRoom,
  loadRoomLocal,
  generateAndAddDioryFromFilePath,
} = require('./dist/utils')

const type = process.argv[2]

if (type == 's3') {
  initRoom('diory-camera-upload').then((room) => {
    generateAndAddDioryFromFilePath('/Users/Jouni/MyPictures/my-pic.jpg', room, true).then(() => {
      room.saveRoom().then(() => {
        process.exit(0)
      })
    })
  })
} else if (type == 'local') {
  initRoomLocal('/Users/Jouni/TestRoom').then((room) => {
    generateAndAddDioryFromFilePath('/Users/Jouni/MyPictures/my-pic.jpg', room, true).then(() => {
      room.saveRoom().then(() => {
        process.exit(0)
      })
    })
  })
} else {
  console.log(`Unknown type: ${type}`)
  process.exit(0)
}
