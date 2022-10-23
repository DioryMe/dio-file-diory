import { Diograph } from 'diograph-js'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { createWriteStream } from 'fs'
import { exec } from 'child_process'

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

const readDataobjectFromS3ToFile = async () => {
  const client = new S3Client({ region: 'eu-west-1' })
  const objectParams = { Bucket: process.env.BUCKET_NAME, Key: 'PIXNIO-53799-6177x4118.jpeg' }
  const response: any = await client.send(new GetObjectCommand(objectParams))
  if (!response.Body) {
    return
  }
  const writeStream = createWriteStream('/tmp/PIXNIO-53799-6177x4118.jpeg')
  return response.Body.pipe(writeStream)
}

const saveDiographToS3 = async (diograph: Diograph) => {
  return diograph.toObject()
}

export const hello = async (event: any) => {
  const diographObject = await readDiographFromS3()
  await readDataobjectFromS3ToFile()

  exec('ls -halt /tmp', (error, stdout, stderr) => {
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

  // Create new / update
  const diograph: any = new Diograph()
  diograph.mergeDiograph(diographObject.diograph)
  const newDiory = diograph.createDiory({ text: `New Diory: ${Date.now()}` })
  diograph.update(newDiory.id, { text: `New name: ${Date.now()}` })

  return {
    statusCode: 200,
    diograph: saveDiographToS3(diograph),
  }
}
