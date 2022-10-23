import { Diograph } from 'diograph-js'
import { GetObjectCommand, ListObjectsCommand, S3Client } from '@aws-sdk/client-s3'

export const hello = async (event: any) => {
  // Retrieve diograph.json from S3
  const client = new S3Client({ region: 'eu-west-1' })
  const objectParams = { Bucket: process.env.BUCKET_NAME, Key: 'diograph.json' }
  const diographJson = await client.send(new GetObjectCommand(objectParams))
  const s3BodyString = await diographJson.Body?.transformToString()
  if (!s3BodyString) {
    return
  }
  const diographObject = JSON.parse(s3BodyString)

  // Create new / update
  const diograph: any = new Diograph()
  diograph.mergeDiograph(diographObject.diograph)
  const newDiory = diograph.createDiory({ text: `New Diory: ${Date.now()}` })
  diograph.update(newDiory.id, { text: `New name: ${Date.now()}` })

  // Save to S3
  const s3ObjectPayload = diograph.toObject()

  return {
    statusCode: 200,
    diograph: s3ObjectPayload,
  }
}
