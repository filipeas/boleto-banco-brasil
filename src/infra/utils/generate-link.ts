export function generateLink(folder: string, filename?: string): string {
  if (filename) return `${process.env.APP_URL}/uploads/${folder}/${filename}`;

  return ``;
}