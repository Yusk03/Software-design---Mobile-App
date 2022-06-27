export function toMbit(kbit) {
  return (kbit - (kbit % 1024)) / 1024;
}

export function pluralDays(number) {
  if(number >= 5) {
    return "days";
  }
  
  if(number > 1) {
    return "day2";
  }

  return "day";
}

export function addDays(yourDate, days) {
  let date = yourDate;
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-GB', {year: 'numeric', month: '2-digit', day: '2-digit'});
}

export function getSample(array) {
  let randomElement = Math.floor(Math.random() * array.length)
  return array[randomElement];
}