import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import middy from "@middy/core";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { updatesNoteSchema } from "../../middlewares/schemas/updateNotesSchema.mjs";
import { ifNoteExistsValidator } from "../../middlewares/ifNoteExistsValidator.mjs";

const putHandler = async (event) => {
  try {
    const client = new DynamoDBClient({ region: "eu-north-1" });
    const { userName, title, text } = event.body;
    const id = event.pathParameters.id;
    //kopplade in middleware o tog in den här så en används, enbart
    //gjort de här så måste checka de me sen kolla så username etc finns
    //med annars kasa fel ill errorhandlern men den ska ja göra sen..
    // GÖRA ÖVERALLT DÄR DE BEHÖVS...!!
    // SKA JA INTE HA TRY CATCH SEN DÅ..KOLLA UPP!
    //     Ja, det är precis så man brukar göra med Middy:

    // Validatorn (som du redan har med @middy/validator) kastar ett schemafel om något saknas i body, t.ex. title eller text.

    // Om du inte har någon error-handler middleware kommer det felet bara “bubbla upp” och ge en standard 500 Internal Server Error tillbaka till klienten, vilket inte är användarvänligt.

    // Genom att lägga till en error-handler middleware kan du fånga alla fel (inklusive validator-fel, DynamoDB-fel och egna NotFound-fel) och skicka tillbaka ett kontrollerat svar med rätt statuskod och meddelande

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
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `updated NOT succesfull!: ${err.message}`,
        success: false,
      }),
    };
  }
};

export const handler = middy(putHandler)
  .use(httpJsonBodyParser())
  .use(validator({ eventSchema: transpileSchema(updatesNoteSchema) }))
  .use(ifNoteExistsValidator);
