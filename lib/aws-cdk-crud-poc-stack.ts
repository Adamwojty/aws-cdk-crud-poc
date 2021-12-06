import * as cdk from '@aws-cdk/core'
import * as appsync from '@aws-cdk/aws-appsync'
import * as lambda from '@aws-cdk/aws-lambda'
import * as nodeJsLambda from '@aws-cdk/aws-lambda-nodejs'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as path from 'path'

export class AwsCdkCrudPocStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const api = new appsync.GraphqlApi(this, 'PocApi', {
      name: 'poc-api',
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            description: 'API key for crud poc api',
            name: 'poc api',
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
    })

    const todosTable = new dynamodb.Table(this, 'TodosTable', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    })

    const commonLambdaProps: Omit<lambda.FunctionProps, 'handler'> = {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('functions'),
      memorySize: 1024,
      architectures: [lambda.Architecture.ARM_64],
      timeout: cdk.Duration.seconds(10),
      environment: {
        BOOKS_TABLE: todosTable.tableName,
      },
    }

    // list all todos
    const listTodosLambda = new lambda.Function(this, 'listTodosHandler', {
      handler: 'listTodos.handler',
      ...commonLambdaProps,
    })

    todosTable.grantReadData(listTodosLambda)

    const listTodoDataSource = api.addLambdaDataSource(
      'listTodoDataSource',
      listTodosLambda,
    )

    listTodoDataSource.createResolver({
      typeName: 'Query',
      fieldName: 'listTodos',
    })

    // list todo
    const getTodoByIdLambda = new lambda.Function(this, 'getTodoById', {
      handler: 'getTodoById.handler',
      ...commonLambdaProps,
    })

    todosTable.grantReadData(getTodoByIdLambda)

    const getTodoByIdDataSource = api.addLambdaDataSource(
      'getTodoByIdDataSource',
      getTodoByIdLambda,
    )

    getTodoByIdDataSource.createResolver({
      typeName: 'Query',
      fieldName: 'getTodoById',
    })

    // Create todo
    const createTodoLambda = new lambda.Function(this, 'createTodoHandler', {
      handler: 'createTodo.handler',
      ...commonLambdaProps,
    })

    todosTable.grantReadWriteData(createTodoLambda)

    const createTodoDataSource = api.addLambdaDataSource(
      'createTodoDataSource',
      createTodoLambda,
    )

    createTodoDataSource.createResolver({
      typeName: 'Mutation',
      fieldName: 'createTodo',
    })
    //update todo
    const updateTodoLambda = new nodeJsLambda.NodejsFunction(
      this,
      'updateTodoHandler',
      {
        ...commonLambdaProps,
        entry: path.join(__dirname, '../functions/updateTodo.ts'),
      },
    )

    todosTable.grantReadWriteData(updateTodoLambda)

    const updateBookDataSource = api.addLambdaDataSource(
      'updateBookDataSource',
      updateTodoLambda,
    )

    updateBookDataSource.createResolver({
      typeName: 'Mutation',
      fieldName: 'updateTodo',
    })

    //delete todo

    const deleteTodoLambda = new nodeJsLambda.NodejsFunction(
      this,
      'deleteTodoHandler',
      {
        ...commonLambdaProps,
        entry: path.join(__dirname, '../functions/deleteTodo.ts'),
      },
    )

    todosTable.grantReadWriteData(deleteTodoLambda)

    const deleteBookDataSource = api.addLambdaDataSource(
      'deleteBookDataSource',
      deleteTodoLambda,
    )

    deleteBookDataSource.createResolver({
      typeName: 'Mutation',
      fieldName: 'deleteTodo',
    })
  }
}
