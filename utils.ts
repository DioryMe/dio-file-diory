import { Diory, Room, RoomClient } from 'diograph-js'
import { S3Client } from '@diograph/s3-client'
import { LocalClient } from '@diograph/local-client'
import { Generator, getDefaultImage } from '@diograph/file-generator'
import { readFile } from 'fs/promises'

const loadOrInitRoom = async (client: any) => {
  const roomClient = new RoomClient(client)
  const roomInFocus = new Room(roomClient)
  try {
    await roomInFocus.loadRoom()
  } catch (e: any) {
    console.log('[loadOrInitRoom]', 'Loading room failed, trying to initiate it', e.message)
    roomInFocus.initiateRoom()
    await roomInFocus.saveRoom()
    console.log('[loadOrInitRoom]', 'Room initiated & saved, loading it now')
    await roomInFocus.loadRoom()
  }
  return roomInFocus
}

const loadOrInitRoomS3 = async (address: string) => {
  const s3Client = new S3Client(address)
  return loadOrInitRoom(s3Client)
}

const loadOrInitRoomLocal = async (address: string) => {
  const localClient = new LocalClient(address)
  return loadOrInitRoom(localClient)
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

export { loadOrInitRoomS3, loadOrInitRoomLocal, generateAndAddDioryFromFilePath }
