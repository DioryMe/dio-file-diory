import { Diograph, Diory, Room, RoomClient } from 'diograph-js'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { createWriteStream, mkdirSync, existsSync } from 'fs'
import { readFile } from 'fs/promises'
import { Generator, getDefaultImage } from '@diograph/file-generator'
import { LocalClient } from '@diograph/local-client'
import { dirname } from 'path' // 'path-browserify'

const readDiographFromS3 = async (bucket: string) => {
  const client = new S3Client({ region: 'eu-west-1' })
  const objectParams = { Bucket: bucket, Key: 'diograph.json' }
  const diographJson = await client.send(new GetObjectCommand(objectParams))
  const s3BodyString = await diographJson.Body?.transformToString()
  if (!s3BodyString) {
    return
  }
  return JSON.parse(s3BodyString)
}

const readDataobjectFromS3ToFile = async (bucket: string, key: string): Promise<string> => {
  const client = new S3Client({ region: 'eu-west-1' })
  const objectParams = { Bucket: bucket, Key: key }
  const response: any = await client.send(new GetObjectCommand(objectParams))
  if (!response.Body) {
    throw new Error(`No response.Body when retrieving ${key}!`)
  }
  return new Promise((resolve, reject) => {
    const tempPath = `/tmp/${key}`
    const tempDir = dirname(tempPath)
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true })
    }
    const writeStream = createWriteStream(tempPath)
    response.Body.pipe(writeStream)

    response.Body.on('end', () => {
      resolve(tempPath)
    })
    response.Body.on('error', (error: Error) => {
      reject(error)
    })
  })
}

export const hello = async (event: any, context: any) => {
  // console.log('Received event:', JSON.stringify(event, null, 2))

  const bucket =
    event && event.Records.length ? event.Records[0].s3.bucket.name : process.env.BUCKET_NAME
  const key =
    event && event.Records.length
      ? decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))
      : 'PIXNIO-53799-6177x4118.jpeg'

  const client = new LocalClient('/tmp')
  const roomClient = new RoomClient(client)
  const roomInFocus = new Room(roomClient)
  roomInFocus.initiateRoom({ connections: [{ address: '/tmp', contentClient: 'local' }] })

  const copyContent = true

  // TODO: Initiate room & diograph from existing files from S3
  // const diographObject = await readDiographFromS3(bucket)

  const retrievedFilePath = await readDataobjectFromS3ToFile(bucket, key)

  const generator = new Generator()
  const { dioryObject, thumbnailBuffer, cid } = await generator.generateDioryFromFile(
    retrievedFilePath,
  )
  console.log(JSON.stringify(dioryObject))
  console.log('cid', cid)
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

  // TODO: Save diograph.json & room.json to S3

  const returnValue = {
    statusCode: 200,
    diograph: roomInFocus.diograph.toObject(),
    room: roomInFocus.toObject(),
  }

  console.log(JSON.stringify(returnValue))

  return returnValue
}
