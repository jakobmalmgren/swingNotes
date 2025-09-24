import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
export const handler = async (event) => {
  try {
    const userName = event.pathParameters.username;
    const client = new DynamoDBClient({ region: "eu-north-1" });
    const getNotesCommand = new QueryCommand({
      TableName: "NotificationTable",
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": { S: `USERNAME#${userName}` } },
    });
    const notesFromUsername = await client.send(getNotesCommand);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `here are your notes from ${userName}`,
        data: notesFromUsername.Items,
        success: true,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "something went wrong!",
        success: false,
      }),
    };
  }
};
