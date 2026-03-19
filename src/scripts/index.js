/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { getUserInfo, getCardList, setUserInfo, setUserAvatar, addNewCard, deleteCardFromServer, changeLikeCardStatus } from "./components/api.js";
import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description",
);

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

// Хранилище для ID пользователя
let currentUserId = null;

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const infoModalWindow = document.querySelector(".popup_type_info");
const infoTitle = infoModalWindow.querySelector(".popup__title");
const infoList = infoModalWindow.querySelector(".popup__info");
const infoText = infoModalWindow.querySelector(".popup__text");
const userList = infoModalWindow.querySelector(".popup__list");
const logo = document.querySelector(".logo");

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

// Функция отправки формы редактирования профиля
const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = profileForm.querySelector(
    validationSettings.submitButtonSelector,
  );
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";
  submitButton.disabled = true;

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    });
};

// Функция отправки формы обновления аватара
const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = avatarForm.querySelector(
    validationSettings.submitButtonSelector,
  );
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";
  submitButton.disabled = true;

  setUserAvatar({
    avatar: avatarInput.value,
  })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    });
};

// Функция отправки формы добавления карточки
const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = cardForm.querySelector(
    validationSettings.submitButtonSelector,
  );
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = "Создание...";
  submitButton.disabled = true;

  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCard) => {
      placesWrap.prepend(
        createCardElement(newCard, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCard,
          currentUserId: currentUserId,
        }),
      );
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    });
};

// Функция удаления карточки
const handleDeleteCard = (cardElement, cardId) => {
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete",
  );
  const originalButtonHTML = deleteButton.innerHTML;
  deleteButton.disabled = true;
  deleteButton.textContent = "Удаление...";

  deleteCardFromServer(cardId)
    .then(() => {
      cardElement.remove();
    })
    .catch((err) => {
      console.log(err);
      deleteButton.disabled = false;
      deleteButton.innerHTML = originalButtonHTML;
    });
};

// Функция постановки и снятия лайка
const handleLikeCard = (cardId, likeButton, likeCount) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  likeButton.disabled = true;

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle("card__like-button_is-active");
      if (likeCount) {
        likeCount.textContent = updatedCard.likes.length;
      }
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      likeButton.disabled = false;
    });
};

// Открытие статистики при клике на логотип (3 вариант)
const handleLogoClick = () => {
  Promise.all([getCardList(), getUserInfo()])
    .then(([cards]) => {
      infoList.innerHTML = "";
      userList.innerHTML = "";

      const userStats = new Map();
      const cardStats = [];

      cards.forEach((card) => {
        if (card.owner && !userStats.has(card.owner._id)) {
          userStats.set(card.owner._id, {
            name: card.owner.name,
            likesCount: 0,
          });
        }

        const cardLikes = card.likes ? card.likes.length : 0;
        cardStats.push({
          name: card.name,
          likes: cardLikes,
        });

        if (card.likes && card.likes.length > 0) {
          card.likes.forEach((user) => {
            if (!userStats.has(user._id)) {
              userStats.set(user._id, {
                name: user.name,
                likesCount: 1,
              });
            } else {
              const userData = userStats.get(user._id);
              userData.likesCount += 1;
              userStats.set(user._id, userData);
            }
          });
        }
      });

      const totalUsers = userStats.size;
      const totalLikes = cards.reduce(
        (sum, card) => sum + (card.likes ? card.likes.length : 0),
        0,
      );

      let maxLikes = 0;
      let championName = "Нет данных";

      userStats.forEach((userData) => {
        if (userData.likesCount > maxLikes) {
          maxLikes = userData.likesCount;
          championName = userData.name;
        }
      });

      const topCards = cardStats.sort((a, b) => b.likes - a.likes).slice(0, 3);

      infoTitle.textContent = "Статистика карточек";

      const templateDef = document.getElementById(
        "popup-info-definition-template",
      );

      const usersTotalItem = templateDef.content.cloneNode(true);
      usersTotalItem.querySelector(".popup__info-term").textContent =
        "Всего пользователей:";
      usersTotalItem.querySelector(".popup__info-description").textContent =
        totalUsers;
      infoList.appendChild(usersTotalItem);

      const likesTotalItem = templateDef.content.cloneNode(true);
      likesTotalItem.querySelector(".popup__info-term").textContent =
        "Всего лайков:";
      likesTotalItem.querySelector(".popup__info-description").textContent =
        totalLikes;
      infoList.appendChild(likesTotalItem);

      const maxLikesItem = templateDef.content.cloneNode(true);
      maxLikesItem.querySelector(".popup__info-term").textContent =
        "Максимально лайков от одного:";
      maxLikesItem.querySelector(".popup__info-description").textContent =
        maxLikes;
      infoList.appendChild(maxLikesItem);

      const championItem = templateDef.content.cloneNode(true);
      championItem.querySelector(".popup__info-term").textContent =
        "Чемпион лайков:";
      championItem.querySelector(".popup__info-description").textContent =
        championName;
      infoList.appendChild(championItem);

      infoText.textContent = "Популярные карточки:";

      if (topCards.length > 0) {
        topCards.forEach((card) => {
          const cardItem = document.createElement("li");
          cardItem.classList.add(
            "popup__list-item",
            "popup__list-item_type_badge",
          );
          cardItem.textContent = card.name;
          userList.appendChild(cardItem);
        });
      } else {
        const emptyItem = document.createElement("li");
        emptyItem.classList.add(
          "popup__list-item",
          "popup__list-item_type_badge",
        );
        emptyItem.textContent = "Нет данных";
        userList.appendChild(emptyItem);
      }

      openModalWindow(infoModalWindow);
    })
    .catch((err) => {
      console.log("Ошибка при загрузке статистики:", err);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

logo.addEventListener("click", handleLogoClick);

// Настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Загрузка начальных данных
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((card) => {
      placesWrap.append(
        createCardElement(card, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCard,
          currentUserId: currentUserId
        }),
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });

enableValidation(validationSettings);