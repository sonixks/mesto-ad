const config = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-202",
  headers: {
    authorization: "e3ae89ff-58e6-4d69-9a5b-c3fb2eede76f",
    "Content-Type": "application/json",
  },
};

// Проверяем, успешно ли выполнен запрос, и отклоняем промис в случае ошибки
const getResponseData = (res) => {
  return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
}; 

// Получение данных пользователя с сервера
export const getUserInfo = () => {
  return fetch(`${config.baseUrl}/users/me`, { headers: config.headers })
    .then(getResponseData);
};

// Получение списка карточек с сервера
export const getCardList = () => {
  return fetch(`${config.baseUrl}/cards`, { headers: config.headers })
    .then(getResponseData);
};

// Обновление данных пользователя
export const setUserInfo = ({ name, about }) => {
  return fetch(`${config.baseUrl}/users/me`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({
      name,
      about,
    }),
  }).then(getResponseData);
};

// Обновление аватара пользователя
export const setUserAvatar = ({ avatar }) => {
  return fetch(`${config.baseUrl}/users/me/avatar`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({
      avatar,
    }),
  }).then(getResponseData);
};

// Добавление новой карточки
export const addNewCard = ({ name, link }) => {
  return fetch(`${config.baseUrl}/cards`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({
      name,
      link,
    }),
  }).then(getResponseData);
};

// Удаление карточки
export const deleteCardFromServer = (cardId) => {
  return fetch(`${config.baseUrl}/cards/${cardId}`, {
    method: "DELETE",
    headers: config.headers,
  }).then(getResponseData);
};

// Изменение статуса лайка
export const changeLikeCardStatus = (cardID, isLiked) => {
  return fetch(`${config.baseUrl}/cards/likes/${cardID}`, {
    method: isLiked ? "DELETE" : "PUT",
    headers: config.headers,
  }).then(getResponseData);
};