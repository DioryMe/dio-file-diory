const { generateAndAddDioryFromFilePath, loadOrInitRoom } = require('./dist/utils')

const type = process.argv[2]

const s3Address = process.argv[3] || 's3://jvalanen-diory-test3/room/'
const localPath = process.argv[3] || '/tmp'

const imageToBeUploadedPath = './demo-content-room/source/subsource/one-test-image.jpg'

if (type == 's3') {
  // loadOrInitRoom('s3://diory-camera-upload', 'S3Client').then((room) => {
  loadOrInitRoom(s3Address, 'S3Client').then((room) => {
    generateAndAddDioryFromFilePath(imageToBeUploadedPath, room, false).then(() => {
      room.saveRoom().then(() => {
        process.exit(0)
      })
    })
  })
} else if (type == 'local') {
  // TODO: No nativeRoom
  // loadOrInitRoom('/Users/Jouni/TestRoom', 'LocalClient').then((room) => {
  loadOrInitRoom(localPath, 'LocalClient').then((room) => {
    generateAndAddDioryFromFilePath(imageToBeUploadedPath, room, true).then(() => {
      room.saveRoom().then(() => {
        process.exit(0)
      })
    })
  })
} else {
  console.log(`Unknown type: ${type}`)
  process.exit(1)
}
