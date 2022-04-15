import Push from "react-native-push-notification";

export default function PushRandomNotify() {
  let channelExist = false;

  Push.channelExists("ALiteChannel", (exists) => {
    channelExist = exists; // true/false
  });

  if (!channelExist) {
    Push.createChannel({
      channelId: "ALiteChannel",
      channelName: "ABillS Lite",
      channelDescription: "ABillS Lite - modern Android client app for ABillS.",
      playSound: true,
      vibrate: true,
      importance: 4,
      soundName: "default",
    });
  }

  Array.prototype.sample = function () {
    return this[Math.floor(Math.random() * this.length)];
  };

  Push.localNotification({
    channelId: "ALiteChannel",
    title: titles.sample(),
    message: messages.sample(),
    bigText: bigTexts.sample(),
    subText: subTexts.sample(),
    bigPictureUrl: largePictures.sample(),
    largeIconUrl: largeIcons.sample(),
    color: iconColors.sample(),
    actions: [actions.sample(), actions.sample()],
    vibrate: true,
    vibration: 300,
  });
}

const largeIcons = [
  "http://abills.net.ua/wp-content/uploads/2021/12/hammer-865x1024.png",
  "http://abills.net.ua/wp-content/uploads/2021/09/black_white_beastie.png",
  "http://abills.net.ua/wp-content/uploads/2021/05/image.png",
  "http://abills.net.ua/wp-content/uploads/2020/10/abills-%D1%85%D0%B5%D0%BB%D0%BE%D0%B2%D1%96%D0%BD-%D0%B5%D0%B4%D1%96%D1%88%D0%BD2_7-1024x731.png",
  "http://abills.net.ua/wp-content/uploads/2020/05/Abills_0.3.-3-1024x731.png",
  "http://abills.net.ua/wp-content/uploads/2018/08/abills07830-e1533719453356-259x300.png",
  "http://abills.net.ua/wp-content/uploads/2018/03/yqQYJItep0k-e1521730853177.jpg",
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
];

const largePictures = [
  "http://abills.net.ua:8090/download/attachments/1277998/Logox600.png?version=3&modificationDate=1647951687512&api=v2",
  "http://abills.net.ua/wp-content/uploads/2019/12/Abills-BOX-0.1-1024x638.png",
  "http://abills.net.ua/wp-content/uploads/2019/05/Abills-1.png",
  "http://abills.net.ua/wp-content/uploads/2016/12/chrtik_na_greyderi-300x274.png",
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
];

const iconColors = [
  "red",
  "red",
  "red",
  "red",
  "yellow",
  "green",
  "black",
  "blue",
];

const actions = [
  "Yes",
  "No",
  "Так",
  "Ні",
  "Да",
  "Нет",
  "атвєт",
  "єда",
  "Так, звичайно",
  "Да, конечно",
  "Не интересует",
  "Не цікавить",
];

const titles = [
  'Шампунь "Жумайсынба"',
  "Lorem ipsum",
  "Оплата",
  "Изменение статуса",
  "Новое сообщение",
  "Крутой заголовок",
  "Напоминаем про период",
  "Недостатньо на рахунку",
  "Недостаточно средств на счету",
  "Тут був ваш заголовок",
  "Здесь был ваш заголовок",
  "Успешно приостановлено",
  "Успішно призупинено",
];

const messages = [
  'Скажи перхоти: "Көзіме көрінбейтін бол э, түсіндің ба!"',
  "Quid novi?",
  "У вас на счету недостаточно средств для оплаты следующего периода.",
  "У вас минус на счету :(",
  "Тут було ваше повідомлення.",
  "Здесь было ваше сообщение.",
  "Напоминаем, завтра в 00:00 закончится действие тарифного плана!",
  "Нагадуємо, завтра в 00:00 закінчується дія вашого тарифного плану!",
];

const bigTexts = [
  undefined,
  undefined,
  "І не менш крутий опис вашого сповіщення. Де ви можете і надалі тицяти текст, щоб його було все більше і більше.",
  "И не менее крутое описание вашего оповещения, где вы можете и дальше тыцять текст, чтобы його було всё больше и больше...",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
];

const subTexts = [
  "ABillS Lite",
  "ABillS Lite",
  "ABillS Lite",
  "ABillS Lite",
  "Оплата",
  "Снятие",
  "Начисление",
  "тыц",
  "чык-чырык",
  "тиць",
  undefined,
  undefined,
  undefined,
];
