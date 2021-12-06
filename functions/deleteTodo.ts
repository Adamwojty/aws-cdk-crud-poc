import {AppSyncResolverHandler} from 'aws-lambda'
import {DynamoDB} from 'aws-sdk'
import {Todo, MutationDeleteTodoArgs} from '../types/todos'
import dynoexpr from '@tuplo/dynoexpr'

const documentClient = new DynamoDB.DocumentClient()

export const handler: AppSyncResolverHandler<
  MutationDeleteTodoArgs,
  Todo['id'] | null
> = async event => {
  try {
    const todoId = event.arguments.todoId
    if (!process.env.TODOS_TABLE) {
      console.error('Error: TODOS_TABLE was not specified')

      return null
    }

    const params = dynoexpr<DynamoDB.DocumentClient.DeleteItemInput>({
      TableName: process.env.TODOS_TABLE,
      Key: {id: todoId},
    })

    await documentClient.delete(params).promise()

    return todoId
  } catch (error) {
    console.error('Whoops', error)

    return null
  }
}
