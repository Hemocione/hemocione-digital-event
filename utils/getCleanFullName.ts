export function getCleanFullName (givenName: string, surName: string) {
  return `${givenName.trim()} ${surName.trim()}`
}