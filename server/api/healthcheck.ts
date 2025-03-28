export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { error } = query;
  if (error === "true") {
    throw new Error("Simulated error");
  }

  return {
    message: "OK",
  };
});
