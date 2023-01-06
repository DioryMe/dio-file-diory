import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { createWriteStream, mkdirSync, existsSync } from 'fs'
import { dirname } from 'path' // 'path-browserify'
import { initRoom, loadRoom, generateAndAddDioryFromFilePath } from './utils'

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

  // const roomInFocus = await initRoom('diory-camera-upload')
  const roomInFocus = await loadRoom('diory-camera-upload')

  const copyContent = false

  const retrievedFilePath = await readDataobjectFromS3ToFile(bucket, key)

  const diory = generateAndAddDioryFromFilePath(retrievedFilePath, roomInFocus, copyContent)

  // Create new / update
  // const diograph: any = new Diograph()
  // diograph.mergeDiograph(diographObject.diograph)
  // const newDiory = roomInFocus.diograph.createDiory({ text: `New Diory: ${Date.now()}` })
  // const newDiory2 = roomInFocus.diograph.createDiory({ text: `New Diory2: ${Date.now()}` })
  // roomInFocus.diograph.update(newDiory.id, { text: `New name: ${Date.now()}` })

  await roomInFocus.saveRoom()

  const returnValue = {
    statusCode: 200,
    diograph: roomInFocus.diograph.toObject(),
    room: roomInFocus.toObject(),
  }

  console.log(JSON.stringify(returnValue))

  return returnValue
}
