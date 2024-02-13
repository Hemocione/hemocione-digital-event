import dayjs from 'dayjs';

export const readableSlimDate = (date: string) => {
  const dateObj = dayjs(date);

  return {
    day: dateObj.format('DD/MM'), 
    hour: dateObj.format('HH:mm')
  };
};