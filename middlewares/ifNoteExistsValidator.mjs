import {
  GetItemCommand,
  DynamoDBClient,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import createError from "http-errors";
const client = new DynamoDBClient({ region: "eu-north-1" });

export const ifNoteExistsValidator = () => {
  return {
    before: async (request) => {
      const userName = request.event.body.userName;
      const id = request.event.pathParameters.id;
      if (!id) {
        throw new createError.BadRequest("missing id in pathparameters!");
      }
      // kollar om username med finns före jag kolla noten
      const getUserCommand = new QueryCommand({
        TableName: "NotificationTable",
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: {
          ":pk": { S: `USERNAME#${userName}` },
        },
        Limit: 1,
      });

      const userResult = await client.send(getUserCommand);

      if (!userResult.Items || userResult.Items.length === 0) {
        throw new createError.NotFound(`User with name ${userName} not found`);
      }

      // sen om username finns kollar jag om en note finns kopplat till username
      const getItemCommand = new GetItemCommand({
        TableName: "NotificationTable",
        Key: {
          pk: { S: `USERNAME#${userName}` },
          sk: { S: `NOTEID#${id}` },
        },
      });
      const result = await client.send(getItemCommand);
      if (!result.Item) {
        throw new createError.NotFound(
          `note with ID: ${id} not found for username${userName}`
        );
      }
    },
  };
};
