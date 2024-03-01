import { ConnectionClient, Diory, Room, RoomClient } from '@diograph/diograph'
import { S3Client } from '@diograph/s3-client'
import { LocalClient } from '@diograph/local-client'
import { generateDiory } from '@diograph/file-generator'
import { readFile } from 'fs/promises'

export const loadOrInitRoom = async (address: string, clientType: string) => {
  const room = await constructAndLoadRoom(address, clientType)
  return room
}

const constructRoom = async (address: string, roomClientType: string): Promise<Room> => {
  const client = await getClientAndVerify(roomClientType, address)
  const roomClient = new RoomClient(client)
  return new Room(roomClient)
}

const constructAndLoadRoom = async (address: string, roomClientType: string): Promise<Room> => {
  const room = await constructRoom(address, roomClientType)
  await room.loadRoom({
    LocalClient: {
      clientConstructor: LocalClient,
    },
    // S3Client: {
    //   clientConstructor: S3Client,
    //   credentials: { region: 'eu-west-1', credentials },
    // },
  })
  return room
}

export const getClientAndVerify = async (
  clientType: string,
  address: string,
): Promise<ConnectionClient> => {
  console.log(`Verifying address for ${clientType}:`, address)
  let client: ConnectionClient
  if (clientType == 'LocalClient') {
    client = new LocalClient(address)
    await client.verify()
  } else if (clientType == 'S3Client') {
    client = new S3Client(address)
    await client.verify()
  } else {
    throw new Error(`getClientAndVerify: Unknown clientType: ${clientType}`)
  }

  return client
}

export const generateAndAddDioryFromFilePath = async (
  filePath: string,
  room: Room,
  copyContent: boolean,
) => {
  let diory
  try {
    diory = await generateDiory('', filePath)
  } catch (error: any) {
    if (/^FFMPEG_PATH not defined/.test(error.message)) {
      console.error(
        `Folder includes a video file which requires FFMPEG for diory generation. \nPlease set FFMPEG_PATH`,
      )
    }
    console.log(error.message)
    throw error
  }

  room.diograph.addDiory(diory)

  if (copyContent) {
    const sourceFileContent = await readFile(filePath)
    await room.addContent(sourceFileContent, diory.id)
    // diory.changeContentUrl(dioryObject.id)
  }

  await room.saveRoom()

  return diory
}
