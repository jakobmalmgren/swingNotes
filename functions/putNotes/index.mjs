import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import middy from "@middy/core";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { updatesNoteSchema } from "../../middlewares/schemas/updateNotesSchema.mjs";
import { ifNoteExistsValidator } from "../../middlewares/ifNoteExistsValidator.mjs";
import { errorHandler } from "../../middlewares/errorHander.mjs";
import createError from "http-errors";

const putHandler = async (event) => {
  try {
    const client = new DynamoDBClient({ region: "eu-north-1" });
    const { userName, title, text } = event.body;
    const id = event.pathParameters.id;

    const updateCommand = new UpdateItemCommand({
      TableName: "NotificationTable",
      Key: {
        pk: { S: `USERNAME#${userName}` },
        sk: { S: `NOTEID#${id}` },
      },
      UpdateExpression: "SET #title = :title, #text = :text",
      ExpressionAttributeNames: { "#title": "title", "#text": "text" },
      ExpressionAttributeValues: {
        ":title": { S: title },
        ":text": { S: text },
      },

      ReturnValues: "ALL_NEW",
    });
    const resultOfUpdated = await client.send(updateCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "updated succesfull!",
        success: true,
        data: resultOfUpdated,
      }),
    };
  } catch (err) {
    console.log("error:", err);
    throw new createError.InternalServerError(
      `Failed to update note : ${err.message}`
    );
  }
};

export const handler = middy(putHandler)
  .use(httpJsonBodyParser())
  .use(validator({ eventSchema: transpileSchema(updatesNoteSchema) }))
  .use(ifNoteExistsValidator())
  .use(errorHandler());
