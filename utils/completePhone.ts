export function completePhone(phone: string) {
  if (phone.startsWith("+55") && phone.length === 14) return phone;

  phone = phone.replace(/\D/g, "");
  if (phone.length === 11) phone = `+55${phone}`;

  return phone;
}
