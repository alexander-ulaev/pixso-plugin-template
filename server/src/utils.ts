export const addZero = (val: number): string => {
  return val > 9 ? String(val) : `0${val}`;
};

export const formatDateToStr = (time: number, formatStr: string): string => {
  const date = new Date();
  date.setTime(time);
  return formatStr
    .replace(/yyyy|YYYY/, String(date.getFullYear()))
    .replace(/yy|YY/, String(date.getFullYear()))
    .replace(/MM/, addZero(date.getMonth() + 1))
    .replace(/M/g, String(date.getMonth() + 1))
    .replace(/dd|DD/, addZero(date.getDate()))
    .replace(/d|D/g, String(date.getDate()))
    .replace(/hh|HH/, addZero(date.getHours()))
    .replace(/h|H/g, String(date.getHours()))
    .replace(/mm/, addZero(date.getMinutes()))
    .replace(/m/g, String(date.getMinutes()))
    .replace(/ss|SS/, addZero(date.getSeconds()))
    .replace(/s|S/g, String(date.getSeconds()));
};

export const formatTime = (): string => formatDateToStr(Date.now(), 'YYYY-MM-DD hh:mm:ss');