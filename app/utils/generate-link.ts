export function generateLink(folder: string, filename?: string): string {
  if (filename) return `${process.cwd()}/tmp/uploads/${folder}/${filename}`;

  return ``;
}