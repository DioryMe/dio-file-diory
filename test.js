const { generateAndAddDioryFromFilePath, loadOrInitRoom } = require('./dist/utils')

const type = process.argv[2]

if (type == 's3') {
  // loadOrInitRoom('s3://diory-camera-upload', 'S3Client').then((room) => {
  loadOrInitRoom('s3://jvalanen-diory-test3/room/', 'S3Client').then((room) => {
    generateAndAddDioryFromFilePath('/Users/Jouni/MyPictures/my-pic.jpg', room, false).then(() => {
      room.saveRoom().then(() => {
        process.exit(0)
      })
    })
  })
} else if (type == 'local') {
  // TODO: No nativeRoom
  // loadOrInitRoom('/Users/Jouni/TestRoom', 'LocalClient').then((room) => {
  loadOrInitRoom('/tmp', 'LocalClient').then((room) => {
    generateAndAddDioryFromFilePath('/Users/Jouni/MyPictures/my-pic.jpg', room, true).then(() => {
      room.saveRoom().then(() => {
        process.exit(0)
      })
    })
  })
} else {
  console.log(`Unknown type: ${type}`)
  process.exit(1)
}
