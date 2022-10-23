import { Diograph } from 'diograph-js'
import { GetObjectCommand, ListObjectsCommand, S3Client } from '@aws-sdk/client-s3'

export const hello = async (event: any) => {
  // Retrieve diograph.json from S3
  const client = new S3Client({ region: 'eu-west-1' })
  const objectParams = { Bucket: process.env.BUCKET_NAME, Key: 'diograph.json' }
  const diographJson = await client.send(new GetObjectCommand(objectParams))
  console.log(diographJson)

  /*
  const diographObject = ''

  // Create new / update
  const diograph = new Diograph()
  diograph.mergeDiograph(diographObject)

  const newDiory = diograph.createDiory({ text: `New Diory: ${Date.now()}` })
  diograph.update(newDiory.id, { text: `New name: ${Date.now()}` })

  // Save to S3
  // diograph.toObject()
*/
  return {
    statusCode: 200,
  }
}
