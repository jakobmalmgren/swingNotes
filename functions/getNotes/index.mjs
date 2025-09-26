import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import createError from "http-errors";
import middy from "@middy/core";
import { errorHandler } from "../../middlewares/errorHander.mjs";

const getHandler = async (event) => {
  try {
    const userName = event.pathParameters.username;
    if (!userName) {
      throw new createError.BadRequest("missing username in pathparameters!");
    }
    const client = new DynamoDBClient({ region: "eu-north-1" });

    const getNotesCommand = new QueryCommand({
      TableName: "NotificationTable",
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": { S: `USERNAME#${userName}` } },
    });
    const notesFromUsername = await client.send(getNotesCommand);
    if (notesFromUsername.Items.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `you have 0 notes`,
          data: notesFromUsername.Items,
          success: true,
        }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `here are your notes from ${userName}`,
        data: notesFromUsername.Items,
        success: true,
      }),
    };
  } catch (err) {
    throw new createError.InternalServerError(
      `Failed to get notes : ${err.message}`
    );
  }
};

export const handler = middy(getHandler).use(errorHandler());
