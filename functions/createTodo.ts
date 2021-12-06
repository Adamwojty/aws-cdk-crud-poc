import {AppSyncResolverHandler} from 'aws-lambda'
import {Todo, MutationCreateTodoArgs} from '../types/todos'
import {DynamoDB} from 'aws-sdk'

const docClient = new DynamoDB.DocumentClient()

export const handler: AppSyncResolverHandler<
  MutationCreateTodoArgs,
  Todo | null
> = async event => {
  const todo = event.arguments.todo

  try {
    if (!process.env.TODOS_TABLE) {
      console.log('TODOS_TABLE was not specified')
      return null
    }

    await docClient
      .put({TableName: process.env.TODOS_TABLE, Item: todo})
      .promise()

    return todo as Todo
  } catch (err) {
    console.error('[Error] DynamoDB error: ', err)
    return null
  }
}
