export const deleteNoteSchema = {
  type: "object",
  required: ["body", "pathParameters"],
  properties: {
    body: {
      type: "object",
      required: ["userName"],
      properties: {
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
