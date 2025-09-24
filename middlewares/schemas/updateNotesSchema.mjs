export const updatesNoteSchema = {
  type: "object",
  required: ["body", "pathParameters"],
  properties: {
    body: {
      type: "object",
      required: ["text", "title", "userName"],
      properties: {
        text: { type: "string", minLength: 3 },
        title: { type: "string", minLength: 3 },
        userName: { type: "string", minLength: 3 },
      },
    },
    pathParameters: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
      },
    },
  },
};
