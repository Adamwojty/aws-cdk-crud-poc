import {AppSyncResolverHandler} from 'aws-lambda'
import {Todo, QueryGetTodoByIdArgs} from '../types/todos'
import {DynamoDB} from 'aws-sdk'

const docClient = new DynamoDB.DocumentClient()

export const handler: AppSyncResolverHandler<
  QueryGetTodoByIdArgs,
  Todo | null
> = async event => {
  try {
    if (!process.env.TODOS_TABLE) {
      console.log('TODOS_TABLE was not specified')
      return null
    }

    const {Item} = await docClient
      .get({
        TableName: process.env.TODOS_TABLE,
        Key: {id: event.arguments.todoId},
      })
      .promise()

    return Item as Todo
  } catch (err) {
    console.error('[Error] DynamoDB error: ', err)
    return null
  }
}
