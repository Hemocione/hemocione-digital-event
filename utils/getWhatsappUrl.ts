export default function getWhatsappUrl(text: string, url: string) {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
}
