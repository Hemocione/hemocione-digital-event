const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export function getRandomString(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
