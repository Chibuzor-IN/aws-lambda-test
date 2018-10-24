var AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-central-1",
});

const client = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid/v4');

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @param {string} event.resource - Resource path.
 * @param {string} event.path - Path parameter.
 * @param {string} event.httpMethod - Incoming request's method name.
 * @param {Object} event.headers - Incoming request headers.
 * @param {Object} event.queryStringParameters - query string parameters.
 * @param {Object} event.pathParameters - path parameters.
 * @param {Object} event.stageVariables - Applicable stage variables.
 * @param {Object} event.requestContext - Request context, including authorizer-returned key-value pairs, requestId, sourceIp, etc.
 * @param {Object} event.body - A JSON string of the request payload.
 * @param {boolean} event.body.isBase64Encoded - A boolean flag to indicate if the applicable request payload is Base64-encode
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 * @param {string} context.logGroupName - Cloudwatch Log Group name
 * @param {string} context.logStreamName - Cloudwatch Log stream name.
 * @param {string} context.functionName - Lambda function name.
 * @param {string} context.memoryLimitInMB - Function memory.
 * @param {string} context.functionVersion - Function version identifier.
 * @param {function} context.getRemainingTimeInMillis - Time in milliseconds before function times out.
 * @param {string} context.awsRequestId - Lambda request ID.
 * @param {string} context.invokedFunctionArn - Function ARN.
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * @returns {boolean} object.isBase64Encoded - A boolean flag to indicate if the applicable payload is Base64-encode (binary support)
 * @returns {string} object.statusCode - HTTP Status Code to be returned to the client
 * @returns {Object} object.headers - HTTP Headers to be returned
 * @returns {Object} object.body - JSON Payload to be returned
 * 
 */

exports.createUser = async (event, context, callback) => {
    var params = {
        TableName : "Users",
        Item:{
            "ID" : uuid(),
            "username": event.username,            
        }
    }

    try {
        data = await client.put(params, (err, data) => {
            if (err) {
                callback(err);
              }
              callback(null, params.Item);
        }).promise();
    }
    catch (err) {        
        return err;
    }
    return data;
    
}

exports.getUser = async (event, context, callback) => {
    var params = {
        TableName : "Users",
        Key : {
            "ID" : event.id
        }
    }    
    
    try {
        data = await client.get(params).promise();
    }
    catch (err) {        
        return err;
    }
    return data;
    
}

exports.updateUser = async (event, context) => {
    var params = {
        TableName : "Users",
        Key : {
            "ID" : event.id
        },
        UpdateExpression: "set username = :n",
        ExpressionAttributeValues:{
            ":n": event.username,
        },
        ReturnValues:"UPDATED_NEW"
    }        
    
    try {
        data = await client.update(params).promise();
    }
    catch (err) {        
        return err;
    }
    return {data};
}

exports.deleteUser = async (event, context) => {
    var params = {
        TableName : "Users",
        Key : {
            "ID" : event.id
        },
        ReturnValues:"ALL_OLD"
    }    

    try {
        data = await client.delete(params).promise();
    }
    catch (err) {        
        return err;
    }
    return data;
    
}

// echo '{"username" : "Dealin" }' | sam local invoke "CreateUserFunction"
// echo '{"id" : "fbb64dd0-3a6f-40da-8930-1f26d029a9d5", "username" : "Dealin test" }' | sam local invoke "UpdateUserFunction"