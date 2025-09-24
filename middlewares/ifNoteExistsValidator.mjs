import { GetItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import createError from "http-errors";
const client = new DynamoDBClient({ region: "eu-north-1" });

export const ifNoteExistsValidator = () => {
  return {
    before: async (request) => {
      const userName = request.event.body.userName;
      const id = request.event.pathParameters.id;
      const getItemCommand = new GetItemCommand({
        TableName: "NotificationTable",
        Key: {
          pk: { S: `USERNAME#${userName}` },
          sk: { S: `NOTEID#${id}` },
        },
      });
      const result = await client.send(getItemCommand);
      if (!result.Item) {
        throw new createError.NotFound(`note with ID: ${id} not found`);
      }
    },
  };
};
