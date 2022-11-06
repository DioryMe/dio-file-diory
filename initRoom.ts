import { LocalClient } from '@diograph/local-client'
import { Room, RoomClient } from 'diograph-js'
import { S3Client } from '@diograph/s3-client'

const loadRoom = async () => {
  const client = new S3Client('diory-camera-upload')
  const roomClient = new RoomClient(client)
  const roomInFocus = new Room(roomClient)
  await roomInFocus.loadRoom()
  return roomInFocus
}

const initRoom = async () => {
  const client = new S3Client('diory-camera-upload')
  const roomClient = new RoomClient(client)
  const roomInFocus = new Room(roomClient)
  // await roomInFocus.loadRoom()
  roomInFocus.initiateRoom()
  return roomInFocus
}

export { initRoom, loadRoom }
