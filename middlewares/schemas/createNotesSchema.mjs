export const createNoteSchema = {
  type: "object",
  required: ["body"],
  properties: {
    body: {
      type: "object",
      required: ["title", "text"],
      properties: {
        title: { type: "string", minLength: 3 },
        text: { type: "string", minLength: 3 },
      },
    },
  },
};
