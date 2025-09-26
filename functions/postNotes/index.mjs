import { PutItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import middy from "@middy/core";
import { v4 as uuidv4 } from "uuid";
import validator from "@middy/validator";
import { createNoteSchema } from "../../middlewares/schemas/createNotesSchema.mjs";
import { transpileSchema } from "@middy/validator/transpile";
import { errorHandler } from "../../middlewares/errorHander.mjs";
import createError from "http-errors";

const postHandler = async (event) => {
  const client = new DynamoDBClient({ region: "eu-north-1" });
  try {
    const userName = event.pathParameters.username;
    if (!userName) {
      throw new createError.BadRequest("missing username in pathparameters!");
    }
    // behöver ej parsa för har httpjsonbodyparser
    const body = event.body;
    const { title, text } = body;
    const id = uuidv4();

    const putCommand = new PutItemCommand({
      TableName: "NotificationTable",
      Item: {
        pk: { S: `USERNAME#${userName}` },
        sk: { S: `NOTEID#${id}` },
        title: { S: `${title}` },
        text: { S: `${text}` },
        createdAt: { S: new Date().toISOString() },
        modifiedAt: { S: new Date().toISOString() },
      },
    });
    await client.send(putCommand);
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
      }),
    };
  } catch (err) {
    console.log("error:", err);
    throw new createError.InternalServerError(
      `Failed to post note : ${err.message}`
    );
  }
};

export const handler = middy(postHandler)
  .use(httpJsonBodyParser())
  .use(validator({ eventSchema: transpileSchema(createNoteSchema) }))
  .use(errorHandler());
