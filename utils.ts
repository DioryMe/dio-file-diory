// import { LocalClient } from '@diograph/local-client'
import { Diory, Room, RoomClient } from 'diograph-js'
import { S3Client } from '@diograph/s3-client'
import { LocalClient } from '@diograph/local-client'
import { Generator, getDefaultImage } from '@diograph/file-generator'
import { readFile } from 'fs/promises'

const loadRoom = async (address: string) => {
  const client = new S3Client(address)
  const roomClient = new RoomClient(client)
  const roomInFocus = new Room(roomClient)
  await roomInFocus.loadRoom()
  return roomInFocus
}

const initRoom = async (address: string) => {
  const client = new S3Client(address)
  const roomClient = new RoomClient(client)
  const roomInFocus = new Room(roomClient)
  roomInFocus.initiateRoom()
  return roomInFocus
}

const loadRoomLocal = async (address: string) => {
  const client = new LocalClient(address)
  const roomClient = new RoomClient(client)
  const roomInFocus = new Room(roomClient)
  await roomInFocus.loadRoom()
  return roomInFocus
}

const initRoomLocal = async (address: string) => {
  const client = new LocalClient(address)
  const roomClient = new RoomClient(client)
  const roomInFocus = new Room(roomClient)
  roomInFocus.initiateRoom()
  return roomInFocus
}

const generateAndAddDioryFromFilePath = async (
  filePath: string,
  room: Room,
  copyContent: boolean,
) => {
  const generator = new Generator()
  const { dioryObject, thumbnailBuffer, cid } = await generator.generateDioryFromFile(filePath)

  const dataUrl = thumbnailBuffer
    ? `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`
    : getDefaultImage()
  dioryObject.image = dataUrl
  const diory = new Diory(dioryObject)

  if (copyContent) {
    const sourceFileContent = await readFile(filePath)
    await room.addContent(sourceFileContent, cid || dioryObject.id)
    diory.changeContentUrl(cid || dioryObject.id)
  }

  await room.diograph.addDiory(diory)

  return diory
}

export { initRoom, initRoomLocal, loadRoom, loadRoomLocal, generateAndAddDioryFromFilePath }
