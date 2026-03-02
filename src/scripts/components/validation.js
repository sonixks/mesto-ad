// Отображает сообщение об ошибке под невалидным полем и добавляет соответствующие классы
function showInputError(formElement, inputElement, errorMessage, settings) {
    const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
    inputElement.classList.add(settings.inputErrorClass);
    errorElement.textContent = errorMessage;
    errorElement.classList.add(settings.errorClass);
};

// Скрывает сообщение об ошибке и удаляет классы, связанные с ошибкой
function hideInputError(formElement, inputElement, settings) {
    const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
    inputElement.classList.remove(settings.inputErrorClass);
    errorElement.textContent = "";
    errorElement.classList.remove(settings.errorClass);
};

// Проверяет валидность конкретного поля
function checkInputValidity(formElement, inputElement, settings) {
    if (inputElement.validity.patternMismatch) {
        inputElement.setCustomValidity(inputElement.dataset.errorMessage);
    } else {
        inputElement.setCustomValidity("");
    }

    if (!inputElement.validity.valid) {
        showInputError(formElement, inputElement, inputElement.validationMessage, settings);
    } else {
        hideInputError(formElement, inputElement, settings);
    }
};

// Проверка на наличие невалидного поля у формы
const hasInvalidInput = (inputList) => {
    return inputList.some((inputElement) => !inputElement.validity.valid)
}

// Делает кнопку формы неактивной
function disableSubmitButton(buttonElement, settings) {
    buttonElement.disabled = true;
    buttonElement.classList.add(settings.inactiveButtonClass);
};

// Делает кнопку формы активной
function enableSubmitButton(buttonElement, settings) {
    buttonElement.disabled = false;
    buttonElement.classList.remove(settings.inactiveButtonClass);
};

// Включает или отключает кнопку формы в зависимости от валидности всех полей
function toggleButtonState(inputList, buttonElement, settings) {
    if (hasInvalidInput(inputList)) {
        disableSubmitButton(buttonElement, settings);
    } else {
        enableSubmitButton(buttonElement, settings);
    }
};

// Добавляет обработчики событий для всех полей формы
function setEventListeners(formElement, settings) {
    const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
    const buttonElement = formElement.querySelector(settings.submitButtonSelector);
    toggleButtonState(inputList, buttonElement, settings);

    inputList.forEach((inputElement) => {
        inputElement.addEventListener("input", () => {
            checkInputValidity(formElement, inputElement, settings);
            toggleButtonState(inputList, buttonElement, settings);
        });
    });
};

// Очищает ошибки валидации формы и делает кнопку неактивной
export function clearValidation(formElement, settings) {
    const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
    const buttonElement = formElement.querySelector(settings.submitButtonSelector);

    inputList.forEach((inputElement) => {
        hideInputError(formElement, inputElement, settings);
        inputElement.setCustomValidity("");
    });

    disableSubmitButton(buttonElement, settings);
};

// Отвечает за включение валидации всех форм
export function enableValidation(settings) {
    const formList = Array.from(document.querySelectorAll(settings.formSelector));

    formList.forEach((formElement) => {
        setEventListeners(formElement, settings);
    });
};