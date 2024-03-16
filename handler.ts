import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { createWriteStream, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path' // 'path-browserify'
import { generateAndAddDioryFromFilePath, loadOrInitRoom } from './utils'

const readDataobjectFromS3ToFile = async (bucket: string, key: string): Promise<string> => {
  const client = new S3Client({ region: process.env.REGION })
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

export const generateDiory = async (event: any, context: any) => {
  // console.log('Received event:', JSON.stringify(event, null, 2))

  const ffmpegDir = dirname(require.resolve('ffmpeg-static'))
  process.env.FFMPEG_PATH = join(ffmpegDir, 'ffmpeg')

  const bucketName =
    event && event.Records.length ? event.Records[0].s3.bucket.name : process.env.BUCKET_NAME
  const key =
    event && event.Records.length
      ? decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))
      : 'PIXNIO-53799-6177x4118.jpeg'

  const roomInFocus = await loadOrInitRoom(`s3://${bucketName}/room`, 'S3Client')

  const copyContent = true

  const retrievedFilePath = await readDataobjectFromS3ToFile(bucketName, key)

  const diory = await generateAndAddDioryFromFilePath(retrievedFilePath, roomInFocus, copyContent)

  // Create new / update
  // const diograph: any = new Diograph()
  // diograph.addDiograph(diographObject.diograph)
  // const newDiory = roomInFocus.diograph.createDiory({ text: `New Diory: ${Date.now()}` })
  // const newDiory2 = roomInFocus.diograph.createDiory({ text: `New Diory2: ${Date.now()}` })
  // roomInFocus.diograph.update(newDiory.id, { text: `New name: ${Date.now()}` })

  await roomInFocus.saveRoom()

  const returnValue = {
    statusCode: 200,
    diory: diory.toObject(),
    diograph: roomInFocus.diograph.toObject(),
    room: roomInFocus.toObject(),
  }

  console.log(JSON.stringify(returnValue))

  return returnValue
}
