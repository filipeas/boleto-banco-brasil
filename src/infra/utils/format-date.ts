import { format, parseISO, addDays as dateFnsAddDays } from 'date-fns';

type Format =
  | 'dd/MM/yyyy'
  | 'dd/yyyy'
  | 'yyyy-MM-dd'
  | 'dd.MM.yyyy'
  | 'HH:mm'
  | "dd 'de' MMM 'de' yyyy"
  | "dd 'de' MMM";

function getDate(date: Date | number | string) {
  let parsedDate;

  if (typeof date === 'string') {
    parsedDate = parseISO(date);
  } else if (typeof date === 'number') {
    parsedDate = new Date(date);
  } else {
    parsedDate = date;
  }

  return parsedDate;
}

export function convertDateToAmericanFormat(date: string) {
  const dataFormatada = date.split(".");
  const novaData = dataFormatada[1] + '-' + dataFormatada[0] + '-' + dataFormatada[2];
  return novaData;
}

export function formatDate(date: Date | number | string, dateFormat: Format) {
  const parsedDate = getDate(date);
  return format(parsedDate, dateFormat);
}

export function addDays(date: Date | number | string, daysCount: number) {
  const parsedDate = getDate(date);
  return dateFnsAddDays(parsedDate, daysCount);
}
