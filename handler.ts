import { Diograph } from 'diograph-js'
import { ListObjectsCommand, S3Client } from '@aws-sdk/client-s3'

export const hello = async (event: any) => {
  // Retrieve diograph.json from S3
  const client = new S3Client({ region: 'eu-west-1' })
  const bucketParams = { Bucket: process.env.BUCKET_NAME }
  const objectList = await client.send(new ListObjectsCommand(bucketParams))
  console.log(objectList)

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
