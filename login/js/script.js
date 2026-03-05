document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const toRegisterBtn = document.getElementById('to-register');
    const toLoginBtn = document.getElementById('to-login');

    // 1. ПЕРЕКЛЮЧЕНИЕ МЕЖДУ ФОРМАМИ (Вход / Регистрация)
    if (toRegisterBtn && toLoginBtn) {
        toRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.classList.add('hidden');
            registerSection.classList.remove('hidden');
        });

        toLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            registerSection.classList.add('hidden');
            loginSection.classList.remove('hidden');
        });
    }

    // 2. ОБРАБОТКА ВХОДА (LOGIN)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            
            // Сохраняем состояние входа в браузере
            localStorage.setItem('userEmail', email);
            localStorage.setItem('isLoggedIn', 'true');

            // ПЕРЕБРОС НА ОСНОВНОЙ САЙТ
            // Используем ../index.html потому что этот скрипт лежит в папке login/js/
            window.location.href = '../index.html';
        });
    }

    // 3. ОБРАБОТКА РЕГИСТРАЦИИ
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value;
            const pass = document.getElementById('regPassword').value;

            if (pass.length < 8) {
                alert('Пароль слишком короткий (минимум 8 символов)!');
                return;
            }

            alert(`Аккаунт для ${name} успешно создан! Теперь войдите.`);
            // Переключаем обратно на форму входа
            registerSection.classList.add('hidden');
            loginSection.classList.remove('hidden');
        });
    }
});

// Функции для управления модальным окном (если оно используется)
function toggleAuthModal() {
    const overlay = document.getElementById('authOverlay');
    if (overlay) overlay.classList.toggle('active');
}