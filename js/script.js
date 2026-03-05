

// Data Management
let subscriptions = JSON.parse(localStorage.getItem('subscriptions')) || [
    {
        id: '1',
        name: 'Netflix',
        category: 'streaming',
        price: 899,
        period: 'month',
        status: 'active',
        nextBillingDate: '2026-03-02',
        plan: 'Premium Ultra HD',
        color: '#e50914',
        lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 дней назад
        frequency: 'daily'
    },
    {
        id: '2',
        name: 'YouTube Premium',
        category: 'streaming',
        price: 299,
        period: 'month',
        status: 'active',
        nextBillingDate: '2026-03-15',
        plan: 'Индивидуальная',
        color: '#ff0000',
        lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 дня назад
        frequency: 'weekly'
    },
    {
        id: '3',
        name: 'Figma',
        category: 'software',
        price: 1500,
        period: 'month',
        status: 'active',
        nextBillingDate: '2026-03-20',
        plan: 'Professional Plan',
        color: '#a259ff',
        lastUsed: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 дней назад
        frequency: 'rarely'
    },
    {
        id: '4',
        name: 'Spotify',
        category: 'music',
        price: 199,
        period: 'month',
        status: 'active',
        nextBillingDate: '2026-03-10',
        plan: 'Individual',
        color: '#1db954',
        lastUsed: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 дней назад
        frequency: 'never'
    },
    {
        id: '5',
        name: 'Яндекс.Плюс',
        category: 'music',
        price: 299,
        period: 'month',
        status: 'active',
        nextBillingDate: '2026-03-05',
        plan: 'Плюс Мульти',
        color: '#fc3f1d',
        lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 день назад
        frequency: 'daily'
    }
];

let editingId = null;
let monthlyChart = null;
let categoryChart = null;
let economyMode = false;

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Navigation
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(sectionName)) {
            link.classList.add('active');
        }
    });

    if (sectionName === 'analytics') {
        setTimeout(renderCharts, 100);
    }
}

// Modal Functions
function openModal(id = null) {
    editingId = id;
    const modal = document.getElementById('subscriptionModal');
    const form = document.getElementById('subscriptionForm');
    const title = document.getElementById('modalTitle');

    if (id) {
        const sub = subscriptions.find(s => s.id === id);
        title.textContent = 'Редактировать подписку';
        document.getElementById('serviceName').value = sub.name;
        document.getElementById('serviceCategory').value = sub.category;
        document.getElementById('serviceStatus').value = sub.status;
        document.getElementById('servicePrice').value = sub.price;
        document.getElementById('servicePeriod').value = sub.period;
        document.getElementById('nextBillingDate').value = sub.nextBillingDate;
        document.getElementById('servicePlan').value = sub.plan || '';
    } else {
        title.textContent = 'Добавить подписку';
        form.reset();
        document.getElementById('nextBillingDate').value = new Date().toISOString().split('T')[0];
    }

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('subscriptionModal').classList.remove('active');
    editingId = null;
}

// CRUD Operations
function saveSubscription(e) {
    e.preventDefault();

    const categoryColors = {
        streaming: '#e50914',
        software: '#a259ff',
        music: '#1db954',
        delivery: '#ff6b6b',
        cloud: '#4facfe',
        other: '#667eea'
    };

    const subscriptionData = {
        id: editingId || Date.now().toString(),
        name: document.getElementById('serviceName').value,
        category: document.getElementById('serviceCategory').value,
        status: document.getElementById('serviceStatus').value,
        price: parseFloat(document.getElementById('servicePrice').value),
        period: document.getElementById('servicePeriod').value,
        nextBillingDate: document.getElementById('nextBillingDate').value,
        plan: document.getElementById('servicePlan').value,
        color: categoryColors[document.getElementById('serviceCategory').value],
        lastUsed: new Date().toISOString(),
        frequency: 'weekly'
    };

    if (editingId) {
        const index = subscriptions.findIndex(s => s.id === editingId);
        subscriptions[index] = subscriptionData;
    } else {
        subscriptions.push(subscriptionData);
    }

    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    closeModal();
    renderSubscriptions();
    updateStats();
    calculateSavings();
    renderTips();
    showToast(editingId ? 'Подписка обновлена' : 'Подписка добавлена', 'success');
}

function deleteSubscription(id) {
    if (confirm('Вы уверены, что хотите удалить эту подписку?')) {
        subscriptions = subscriptions.filter(s => s.id !== id);
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        renderSubscriptions();
        updateStats();
        calculateSavings();
        renderTips();
        showToast('Подписка удалена', 'success');
    }
}

function pauseSubscription(id) {
    const sub = subscriptions.find(s => s.id === id);
    sub.status = sub.status === 'paused' ? 'active' : 'paused';
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    renderSubscriptions();
    updateStats();
    calculateSavings();
    renderTips();
    showToast(sub.status === 'paused' ? 'Подписка приостановлена' : 'Подписка возобновлена', 'success');
}

// 🎯 КАЛЬКУЛЯТОР ПОТЕРЬ
function calculateSavings() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);

    let wastedMoney = 0;
    let unusedCount = 0;
    const wastedSubs = [];

    subscriptions.forEach(sub => {
        if (sub.status !== 'active') return;

        const lastUsed = sub.lastUsed ? new Date(sub.lastUsed) : null;
        const monthlyCost = sub.price;

        // Не использовалась 90+ дней
        if (!lastUsed || lastUsed < ninetyDaysAgo) {
            wastedMoney += monthlyCost;
            unusedCount++;
            wastedSubs.push(sub);
        }
        // Используется редко
        else if (lastUsed < thirtyDaysAgo || sub.frequency === 'rarely') {
            wastedMoney += monthlyCost * 0.5; // 50% потенциальных потерь
        }
    });

    // Дубликаты сервисов (например, 2 музыкальных сервиса)
    const musicSubs = subscriptions.filter(s => s.category === 'music' && s.status === 'active');
    if (musicSubs.length > 1) {
        const cheapest = Math.min(...musicSubs.map(s => s.price));
        musicSubs.forEach(s => {
            if (s.price > cheapest && !wastedSubs.includes(s)) {
                wastedMoney += (s.price - cheapest);
            }
        });
    }

    const yearlySavings = wastedMoney * 12;

    // Анимация чисел
    animateValue('totalSavings', Math.round(yearlySavings));
    animateValue('monthlySavings', Math.round(wastedMoney));
    animateValue('yearlySavings', Math.round(yearlySavings));
    document.getElementById('unusedSubs').textContent = unusedCount;

    return { wastedMoney, yearlySavings, unusedCount, wastedSubs };
}

function animateValue(elementId, endValue) {
    const element = document.getElementById(elementId);
    const startValue = 0;
    const duration = 1000;
    let startTimestamp = null;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (endValue - startValue) + startValue);
        element.textContent = value.toLocaleString('ru-RU') + ' ₽';
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// 🔥 РЕЖИМ ЭКОНОМИИ
function toggleEconomyMode() {
    economyMode = !economyMode;
    const banner = document.getElementById('economyModeBanner');
    const toggle = document.getElementById('economyToggle');

    if (economyMode) {
        banner.classList.add('active');
        toggle.classList.add('active');
        showToast('Режим экономии включён', 'success');
    } else {
        banner.classList.remove('active');
        toggle.classList.remove('active');
        showToast('Режим экономии выключен', 'success');
    }

    renderSubscriptions();
}

// 📊 ПЕРСОНАЛИЗИРОВАННЫЕ СОВЕТЫ
function renderTips() {
    const tipsList = document.getElementById('tipsList');
    const tips = generateTips();

    if (tips.length === 0) {
        tipsList.innerHTML = `
                    <div class="tip-item">
                        <div class="tip-content">
                            <div class="tip-title">✅ Всё отлично!</div>
                            <div class="tip-description">Вы эффективно используете все подписки. Продолжайте в том же духе!</div>
                        </div>
                    </div>
                `;
        return;
    }

    tipsList.innerHTML = tips.map(tip => `
                <div class="tip-item ${tip.priority === 'high' ? 'high-priority' : tip.priority === 'medium' ? 'medium-priority' : ''}">
                    <div class="tip-icon">
                        ${tip.priority === 'high' ?
            '<svg width="24" height="24" fill="#e53e3e" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2V10z"/></svg>' :
            '<svg width="24" height="24" fill="#f59e0b" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
        }
                    </div>
                    <div class="tip-content">
                        <div class="tip-title">${tip.title}</div>
                        <div class="tip-description">${tip.description}</div>
                        ${tip.savings ? `<div class="tip-savings">💰 Экономия: ${tip.savings}</div>` : ''}
                        <div class="tip-actions">
                            ${tip.action ? `<button class="btn btn-small btn-secondary" onclick="${tip.action}">${tip.actionText}</button>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
}

function generateTips() {
    const tips = [];
    const now = new Date();
    const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Совет 1: Неиспользуемые подписки
    const unusedSubs = subscriptions.filter(s =>
        s.status === 'active' &&
        s.lastUsed &&
        new Date(s.lastUsed) < ninetyDaysAgo
    );

    unusedSubs.forEach(sub => {
        const daysUnused = Math.floor((now - new Date(sub.lastUsed)) / (1000 * 60 * 60 * 24));
        tips.push({
            priority: 'high',
            title: `Вы давно не использовали ${sub.name}`,
            description: `Прошло ${daysUnused} дней с последнего входа. Вы платите ${sub.price} ₽/мес впустую.`,
            savings: `${sub.price * 12} ₽/год`,
            action: `deleteSubscription('${sub.id}')`,
            actionText: 'Отменить подписку'
        });
    });

    // Совет 2: Дубликаты сервисов
    const categoryGroups = {};
    subscriptions.filter(s => s.status === 'active').forEach(sub => {
        if (!categoryGroups[sub.category]) categoryGroups[sub.category] = [];
        categoryGroups[sub.category].push(sub);
    });

    Object.entries(categoryGroups).forEach(([category, subs]) => {
        if (subs.length > 1) {
            const categoryNames = {
                streaming: 'стримингов',
                music: 'музыкальных сервисов',
                software: 'программ',
                cloud: 'облачных хранилищ'
            };

            const totalCost = subs.reduce((sum, s) => sum + s.price, 0);
            const cheapest = Math.min(...subs.map(s => s.price));
            const potentialSavings = totalCost - cheapest;

            tips.push({
                priority: 'medium',
                title: `У вас ${subs.length} ${categoryNames[category] || 'сервисов'}`,
                description: `Вы платите ${totalCost} ₽/мес за ${category}. Оставьте самый дешёвый (${cheapest} ₽) и сэкономьте.`,
                savings: `${potentialSavings * 12} ₽/год`,
                action: `showOptimizationTips()`,
                actionText: 'Посмотреть рекомендации'
            });
        }
    });

    // Совет 3: Пробные периоды
    const trialSubs = subscriptions.filter(s => s.status === 'trial');
    trialSubs.forEach(sub => {
        const daysUntil = Math.ceil((new Date(sub.nextBillingDate) - now) / (1000 * 60 * 60 * 24));
        tips.push({
            priority: 'high',
            title: `Пробный период ${sub.name} заканчивается`,
            description: `Через ${daysUntil} дн. начнётся списание ${sub.price} ₽. Отмените, если не планируете пользоваться.`,
            savings: `${sub.price * 12} ₽/год`,
            action: `pauseSubscription('${sub.id}')`,
            actionText: 'Приостановить'
        });
    });

    // Совет 4: Редкое использование
    const rareSubs = subscriptions.filter(s =>
        s.status === 'active' &&
        s.frequency === 'rarely' &&
        s.lastUsed &&
        new Date(s.lastUsed) < thirtyDaysAgo
    );

    rareSubs.forEach(sub => {
        tips.push({
            priority: 'medium',
            title: `${sub.name} используется редко`,
            description: `Вы заходили последний раз ${new Date(sub.lastUsed).toLocaleDateString('ru')}. Подумайте об отмене.`,
            savings: `${sub.price * 12} ₽/год`,
            action: `openModal('${sub.id}')`,
            actionText: 'Редактировать'
        });
    });

    return tips.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

function showOptimizationTips() {
    renderTips();
    showSection('dashboard');
    document.getElementById('tipsSection').scrollIntoView({ behavior: 'smooth' });
}

// Render Functions
function renderSubscriptions() {
    const dashboardContainer = document.getElementById('dashboardSubscriptions');
    const allContainer = document.getElementById('allSubscriptions');

    const html = subscriptions.map(sub => {
        const date = new Date(sub.nextBillingDate);
        const daysUntil = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
        const dateStr = daysUntil <= 0 ? 'Сегодня' : daysUntil === 1 ? 'Завтра' : `Через ${daysUntil} дн.`;

        const statusBadge = {
            active: '<span class="badge badge-active">Активна</span>',
            trial: '<span class="badge badge-trial">Пробный</span>',
            paused: '<span class="badge badge-paused">Пауза</span>'
        }[sub.status];

        // Economy mode highlighting
        const isWasted = sub.lastUsed && new Date(sub.lastUsed) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const economyClass = economyMode && isWasted && sub.status === 'active' ? 'economy-highlight' : '';
        const wastedClass = isWasted ? 'wasted-money' : '';

        return `
                    <div class="subscription-card ${economyClass} ${wastedClass}" style="${sub.status === 'paused' ? 'opacity: 0.6;' : ''}">
                        <div class="subscription-info">
                            <div class="subscription-logo" style="background: ${sub.color}">
                                ${sub.name.charAt(0)}
                            </div>
                            <div class="subscription-details">
                                <h3>${sub.name}</h3>
                                <p>${sub.plan || 'Стандартный тариф'} • ${statusBadge}</p>
                            </div>
                        </div>
                        <div class="subscription-meta">
                            <div>
                                <div class="subscription-price">${sub.price.toLocaleString()} ₽</div>
                                <div class="subscription-date">Списание: ${dateStr}</div>
                            </div>
                            <div class="subscription-actions">
                                <button class="btn btn-secondary btn-small" onclick="pauseSubscription('${sub.id}')">
                                    ${sub.status === 'paused' ? 'Возобновить' : 'Пауза'}
                                </button>
                                <button class="btn btn-secondary btn-small" onclick="openModal('${sub.id}')">
                                    Изменить
                                </button>
                                <button class="btn btn-danger btn-small" onclick="deleteSubscription('${sub.id}')">
                                    Удалить
                                </button>
                            </div>
                        </div>
                    </div>
                `;
    }).join('');

    if (dashboardContainer) dashboardContainer.innerHTML = html;
    if (allContainer) allContainer.innerHTML = html;
}

function updateStats() {
    const total = subscriptions.length;
    const active = subscriptions.filter(s => s.status === 'active').length;
    const monthly = subscriptions.reduce((sum, s) => {
        if (s.status !== 'active') return sum;
        const multiplier = s.period === 'year' ? 1 / 12 : s.period === 'week' ? 4.33 : 1;
        return sum + (s.price * multiplier);
    }, 0);

    const nextSub = subscriptions
        .filter(s => s.status === 'active')
        .sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate))[0];

    document.getElementById('totalSubscriptions').textContent = total;
    document.getElementById('monthlyCost').textContent = Math.round(monthly).toLocaleString() + ' ₽';
    document.getElementById('activeSubscriptions').textContent = active;

    if (nextSub) {
        document.getElementById('nextPayment').textContent = nextSub.price + ' ₽';
        const days = Math.ceil((new Date(nextSub.nextBillingDate) - new Date()) / (1000 * 60 * 60 * 24));
        document.getElementById('nextPaymentDate').textContent = days <= 0 ? 'Сегодня' : days === 1 ? 'Завтра' : `Через ${days} дн.`;
    }

    const upcomingHtml = subscriptions
        .filter(s => s.status === 'active')
        .sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate))
        .slice(0, 3)
        .map(sub => {
            const date = new Date(sub.nextBillingDate);
            const dateStr = date.toLocaleDateString('ru', { day: 'numeric', month: 'long' });
            return `
                        <div class="date-item">
                            <span>${dateStr}</span>
                            <span>${sub.name}</span>
                        </div>
                    `;
        }).join('');

    document.getElementById('upcomingDates').innerHTML = upcomingHtml;
}

// Charts
function renderCharts() {
    const ctx1 = document.getElementById('monthlyChart');
    const ctx2 = document.getElementById('categoryChart');

    if (!ctx1 || !ctx2) return;

    if (monthlyChart) monthlyChart.destroy();
    if (categoryChart) categoryChart.destroy();

    const monthlyData = [3200, 3400, 3100, 3600, 3800, 4200];
    monthlyChart = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: ['Сен', 'Окт', 'Ноя', 'Дек', 'Янв', 'Фев'],
            datasets: [{
                label: 'Расходы',
                data: monthlyData,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: value => value + ' ₽' }
                }
            }
        }
    });

    const categoryData = {};
    subscriptions.forEach(sub => {
        if (sub.status !== 'active') return;
        categoryData[sub.category] = (categoryData[sub.category] || 0) + sub.price;
    });

    const categoryLabels = {
        streaming: 'Стриминг',
        software: 'ПО',
        music: 'Музыка',
        delivery: 'Доставка',
        cloud: 'Облако',
        other: 'Другое'
    };

    categoryChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryData).map(c => categoryLabels[c]),
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: ['#e50914', '#a259ff', '#1db954', '#ff6b6b', '#4facfe', '#667eea']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// Utility Functions
function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast' + (type === 'error' ? ' error' : '');
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function syncData() {
    showToast('Данные синхронизированы', 'success');
}

function showNotifications() {
    const active = subscriptions.filter(s => s.status === 'active').length;
    showToast(`У вас ${active} активных подписок`, 'success');
}

function saveSettings() {
    showToast('Настройки сохранены', 'success');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    const isDark = document.body.classList.contains('dark-mode');
    showToast(isDark ? 'Тёмная тема включена' : 'Светлая тема включена', 'success');
}

// Search
document.addEventListener('DOMContentLoaded', () => {
    // Load dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.subscription-card');
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(term) ? 'flex' : 'none';
            });
        });
    }

    renderSubscriptions();
    updateStats();
    calculateSavings();
    renderTips();
});

// Close modal on outside click
document.getElementById('subscriptionModal').addEventListener('click', (e) => {
    if (e.target.id === 'subscriptionModal') closeModal();
});

// Переменные для хранения экземпляров графиков (чтобы удалять старые перед обновлением)
let catChartInstance = null;
let servChartInstance = null;

function initAnalytics() {
    const periodSelect = document.getElementById('analyticsPeriod');
    if (!periodSelect) return;

    // Слушатель изменения периода
    periodSelect.addEventListener('change', updateAnalytics);

    // Первичный вызов при загрузке
    updateAnalytics();
}

function updateAnalytics() {
    const period = document.getElementById('analyticsPeriod').value;
    const activeSubs = subscriptions.filter(s => s.status === 'active');
    
    let totalSum = 0;
    const categoriesData = {};
    const servicesData = {};

    activeSubs.forEach(sub => {
        let price = parseFloat(sub.price);
        let monthlyPrice = price;

        // Приведение всех цен к месячному эквиваленту для расчетов
        if (sub.period === 'year') monthlyPrice = price / 12;
        if (sub.period === 'week') monthlyPrice = price * 4.33;

        // Финальная цена в зависимости от выбранного фильтра (Месяц или Год)
        const finalPrice = (period === 'month') ? monthlyPrice : monthlyPrice * 12;
        
        totalSum += finalPrice;

        // Группировка для графиков
        categoriesData[sub.category] = (categoriesData[sub.category] || 0) + finalPrice;
        servicesData[sub.name] = finalPrice;
    });

    // 1. Обновляем текстовые данные
    const forecastTitle = document.getElementById('forecastTitle');
    forecastTitle.textContent = period === 'month' ? 'Прогноз расходов на месяц' : 'Прогноз расходов на год';
    
    // Анимированное обновление суммы (или просто textContent)
    document.getElementById('totalForecastAmount').textContent = `${Math.round(totalSum).toLocaleString()} ₽`;

    // 2. Рисуем графики
    renderCharts(categoriesData, servicesData);
}

function renderCharts(catData, servData) {
    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    const ctxServ = document.getElementById('servicesChart').getContext('2d');

    // Удаляем старые графики, если они есть
    if (catChartInstance) catChartInstance.destroy();
    if (servChartInstance) servChartInstance.destroy();

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    // Круговая диаграмма категорий
    catChartInstance = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: Object.keys(catData),
            datasets: [{
                data: Object.values(catData),
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });

    // Столбчатая диаграмма сервисов
    servChartInstance = new Chart(ctxServ, {
        type: 'bar',
        data: {
            labels: Object.keys(servData),
            datasets: [{
                label: 'Стоимость',
                data: Object.values(servData),
                backgroundColor: '#6366f1',
                borderRadius: 8
            }]
        },
        options: { 
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { display: false } }
        }
    });
}

// ВАЖНО: Запуск при старте
document.addEventListener('DOMContentLoaded', () => {
    // ... ваш остальной код ...
    initAnalytics();
});

// 1. Открыть красивое окно
function handleLogout() {
    const modal = document.getElementById('logoutModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

// 2. Закрыть окно (если передумал)
function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

// 3. Подтвердить выход с анимацией ухода со страницы
function confirmLogout() {
    // Добавляем класс анимации ко всему телу страницы
    document.body.classList.add('fade-out');

    // Очищаем данные
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');

    // Делаем небольшую паузу, чтобы пользователь увидел эффект "ухода"
    setTimeout(() => {
        window.location.href = 'login/login.html';
    }, 600);
}


