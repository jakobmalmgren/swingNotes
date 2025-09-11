import { PutItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const handler = async (event) => {
  const client = new DynamoDBClient({ region: "eu-north-1" });
  try {
    const userName = event.pathParameters.username;
    const body = JSON.parse(event.body);
    const { noteId, title, text } = body;

    const putCommand = new PutItemCommand({
      TableName: "NotificationTable",
      Item: {
        pk: { S: `USERNAME#${userName}` },
        sk: { S: `NOTEID#${noteId}` },
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
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        message: err.message,
      }),
    };
  }
};
