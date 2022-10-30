import { Diograph, Diory, Room, RoomClient } from 'diograph-js'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { createWriteStream } from 'fs'
import { readFile } from 'fs/promises'
import { exec } from 'child_process'
import { Generator, getDefaultImage } from '@diograph/file-generator'
import { LocalClient } from '@diograph/local-client'

const executeSystemCall = (systemCall: string) => {
  exec(systemCall, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`)
      return
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`)
      return
    }
    console.log(`stdout: ${stdout}`)
  })
}

const readDiographFromS3 = async () => {
  const client = new S3Client({ region: 'eu-west-1' })
  const objectParams = { Bucket: process.env.BUCKET_NAME, Key: 'diograph.json' }
  const diographJson = await client.send(new GetObjectCommand(objectParams))
  const s3BodyString = await diographJson.Body?.transformToString()
  if (!s3BodyString) {
    return
  }
  return JSON.parse(s3BodyString)
}

const readDataobjectFromS3ToFile = async (key: string): Promise<string> => {
  const client = new S3Client({ region: 'eu-west-1' })
  const objectParams = { Bucket: process.env.BUCKET_NAME, Key: key }
  const response: any = await client.send(new GetObjectCommand(objectParams))
  if (!response.Body) {
    throw new Error(`No response.Body when retrieving ${key}!`)
  }
  return new Promise((resolve, reject) => {
    const writeStream = createWriteStream(`/tmp/${key}`)
    response.Body.pipe(writeStream)

    response.Body.on('end', () => {
      resolve(`/tmp/${key}`)
    })
    response.Body.on('error', (error: Error) => {
      reject(error)
    })
  })
}

const saveDiographToS3 = async (diograph: Diograph) => {
  return diograph.toObject()
}

export const hello = async (event: any) => {
  const key = 'PIXNIO-53799-6177x4118.jpeg'

  const client = new LocalClient('/tmp')
  const roomClient = new RoomClient(client)
  const roomInFocus = new Room(roomClient)
  roomInFocus.initiateRoom({ connections: [{ address: '/tmp', contentClient: 'local' }] })

  const copyContent = true
  const diographObject = await readDiographFromS3()

  const retrievedFilePath = await readDataobjectFromS3ToFile(key)
  // const retrievedFilePath = '/tmp/PIXNIO-53799-6177x4118.jpeg'

  const generator = new Generator()
  const { dioryObject, thumbnailBuffer, cid } = await generator.generateDioryFromFile(
    retrievedFilePath,
  )
  const dataUrl = thumbnailBuffer
    ? `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`
    : getDefaultImage()
  dioryObject.image = dataUrl
  const diory = new Diory(dioryObject)
  if (copyContent) {
    const sourceFileContent = await readFile(retrievedFilePath)
    await roomInFocus.addContent(sourceFileContent, cid || dioryObject.id)
    diory.changeContentUrl(cid || dioryObject.id)
  }
  await roomInFocus.diograph.addDiory(diory)

  // Create new / update
  // const diograph: any = new Diograph()
  // diograph.mergeDiograph(diographObject.diograph)
  const newDiory = roomInFocus.diograph.createDiory({ text: `New Diory: ${Date.now()}` })
  const newDiory2 = roomInFocus.diograph.createDiory({ text: `New Diory2: ${Date.now()}` })
  roomInFocus.diograph.update(newDiory.id, { text: `New name: ${Date.now()}` })

  await roomInFocus.saveRoom()

  executeSystemCall('cat /tmp/diograph.json')
  executeSystemCall('cat /tmp/room.json')

  // TODO: Save diograph.json & room.json to S3

  return {
    statusCode: 200,
    diograph: roomInFocus.diograph.toObject(),
    room: roomInFocus.toObject(),
  }
}
