import {AppSyncResolverHandler} from 'aws-lambda'
import {Todo} from '../types/todos'
import {DynamoDB} from 'aws-sdk'

const docClient = new DynamoDB.DocumentClient()

export const handler: AppSyncResolverHandler<
  null,
  Array<Todo> | null
> = async event => {
  try {
    if (!process.env.TODOS_TABLE) {
      console.log('TODOS_TABLE was not specified')
      return null
    }

    const {Items} = await docClient
      .scan({TableName: process.env.TODOS_TABLE})
      .promise()

    return Items as Array<Todo>
  } catch (err) {
    console.error('[Error] DynamoDB error: ', err)
    return null
  }
}
