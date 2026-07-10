/* ==========================================================
   1. Аккордеон (FAQ / преимущества лагеря)
   ========================================================== */
const accordions = document.querySelectorAll(".accordion");

accordions.forEach((accordion) => {

    accordion.addEventListener("click", function () {

        const isActive = this.classList.contains("active");

        // Закрываем все
        accordions.forEach(item => {
            item.classList.remove("active");
            item.nextElementSibling.style.maxHeight = null;
        });

        if (!isActive) {
            this.classList.add("active");
            this.nextElementSibling.style.maxHeight =
                this.nextElementSibling.scrollHeight + "px";
        }

    });

});


/* ==========================================================
   2. Модальное окно "Заказать звонок"
   ========================================================== */

// ⚠️ ВСТАВЬ СЮДА СВОИ ДАННЫЕ:
const TELEGRAM_BOT_TOKEN = "ВАШ_BOT_TOKEN"; // например: "123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
const TELEGRAM_CHAT_ID = "ВАШ_CHAT_ID";     // например: "-1001234567890" или "123456789"

const modalTriggers = document.querySelectorAll(".modal");
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const callbackForm = document.getElementById("callbackForm");
const submitBtn = document.getElementById("submitBtn");
const formStatus = document.getElementById("formStatus");

const nameInput = document.getElementById("userName");
const phoneInput = document.getElementById("userPhone");
const nameError = document.getElementById("nameError");
const phoneError = document.getElementById("phoneError");

// Открытие модалки по клику на любую кнопку с классом .modal
modalTriggers.forEach((btn) => {
    btn.addEventListener("click", () => {
        openModal();
    });
});

function openModal() {
    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
    resetForm();
}

// Закрытие по кнопке (крестик)
modalClose.addEventListener("click", closeModal);

// Закрытие по клику вне окна
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Закрытие по Escape
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
        closeModal();
    }
});

function resetForm() {
    callbackForm.reset();
    nameInput.classList.remove("error");
    phoneInput.classList.remove("error");
    nameError.textContent = "";
    phoneError.textContent = "";
    formStatus.textContent = "";
    formStatus.className = "modal__status";
    submitBtn.disabled = false;
    submitBtn.textContent = "Отправить заявку";
}

// Простая валидация номера телефона (минимум 9 цифр)
function isValidPhone(value) {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 9;
}

callbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let isValid = true;

    // Валидация имени
    if (nameInput.value.trim().length < 2) {
        nameInput.classList.add("error");
        nameError.textContent = "Введите имя";
        isValid = false;
    } else {
        nameInput.classList.remove("error");
        nameError.textContent = "";
    }

    // Валидация телефона
    if (!isValidPhone(phoneInput.value)) {
        phoneInput.classList.add("error");
        phoneError.textContent = "Введите корректный номер телефона";
        isValid = false;
    } else {
        phoneInput.classList.remove("error");
        phoneError.textContent = "";
    }

    if (!isValid) return;

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = "Отправка...";
    formStatus.textContent = "";
    formStatus.className = "modal__status";

    const text =
        `📞 Новая заявка на звонок\n\n` +
        `👤 Имя: ${name}\n` +
        `📱 Телефон: ${phone}`;

    try {
        const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: text,
                }),
            }
        );

        const data = await response.json();

        if (data.ok) {
            formStatus.textContent = "Заявка успешно отправлена! Мы скоро вам перезвоним.";
            formStatus.classList.add("success");
            submitBtn.textContent = "Отправлено ✓";

            setTimeout(() => {
                closeModal();
            }, 2000);
        } else {
            throw new Error(data.description || "Ошибка отправки");
        }
    } catch (error) {
        console.error("Telegram send error:", error);
        formStatus.textContent = "Не удалось отправить заявку. Попробуйте позже.";
        formStatus.classList.add("error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Отправить заявку";
    }
});