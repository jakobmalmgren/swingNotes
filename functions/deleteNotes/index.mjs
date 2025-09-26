import { DeleteItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import middy from "@middy/core";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { deleteNoteSchema } from "../../middlewares/schemas/deleteNotesSchema.mjs";
import { ifNoteExistsValidator } from "../../middlewares/ifNoteExistsValidator.mjs";
import createError from "http-errors";
import { errorHandler } from "../../middlewares/errorHander.mjs";

const deleteHandler = async (event) => {
  try {
    const id = event.pathParameters.id;

    const client = new DynamoDBClient({ region: "eu-north-1" });
    const userName = event.body.userName;
    const deleteCommand = new DeleteItemCommand({
      TableName: "NotificationTable",
      Key: { pk: { S: `USERNAME#${userName}` }, sk: { S: `NOTEID#${id}` } },
    });
    await client.send(deleteCommand);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `note with ID: ${id} that belongs to ${userName} is deleted!`,
      }),
    };
  } catch (err) {
    console.log("error:", err);

    throw new createError.InternalServerError(
      `Failed to delete note : ${err.message}`
    );
  }
};

export const handler = middy(deleteHandler)
  .use(httpJsonBodyParser())
  .use(validator({ eventSchema: transpileSchema(deleteNoteSchema) }))
  .use(ifNoteExistsValidator())
  .use(errorHandler());
