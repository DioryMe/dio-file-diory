import { Room } from '@diograph/diograph'
import { S3Client } from '@diograph/s3-client'
import { generateDiory } from '@diograph/file-generator'
import { readFile } from 'fs/promises'
import { constructAndLoadRoom } from '@diograph/utils'
import { IDiory } from '@diograph/diograph/types'
import { LocalClient } from '@diograph/local-client'

export const loadOrInitRoom = async (address: string, clientType: string): Promise<Room> => {
  const credentials = {
    region: 'eu-west-1',
    credentials: {
      accessKeyId: '',
      secretAccessKey: '',
    },
  }
  const room = await constructAndLoadRoom(address, clientType, {
    LocalClient: { clientConstructor: LocalClient },
    S3Client: { clientConstructor: S3Client, credentials },
  })
  return room
}

export const generateAndAddDioryFromFilePath = async (
  filePath: string,
  room: Room,
  copyContent: boolean,
): Promise<IDiory> => {
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
