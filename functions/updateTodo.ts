import {AppSyncResolverHandler} from 'aws-lambda'
import {DynamoDB} from 'aws-sdk'
import {Todo, MutationUpdateTodoArgs} from '../types/todos'
import dynoexpr from '@tuplo/dynoexpr'

const documentClient = new DynamoDB.DocumentClient()

export const handler: AppSyncResolverHandler<
  MutationUpdateTodoArgs,
  Todo | null
> = async event => {
  try {
    const todo = event.arguments.todo
    if (!process.env.TODOS_TABLE) {
      console.error('Error: TODOS_TABLE was not specified')

      return null
    }

    const params = dynoexpr<DynamoDB.DocumentClient.UpdateItemInput>({
      TableName: process.env.TODOS_TABLE,
      Key: {id: todo.id},
      ReturnValues: 'ALL_NEW',
      Update: {
        ...(todo?.title ? {title: todo.title} : {}),
        ...(todo?.text ? {rating: todo.text} : {}),
        ...(todo?.completed ? {completed: todo.completed} : {}),
      },
    })

    const result = await documentClient.update(params).promise()

    return result.Attributes as Todo
  } catch (error) {
    console.error('Whoops', error)

    return null
  }
}
