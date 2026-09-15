document.addEventListener('DOMContentLoaded', () => {
    const AppState = {
        range: 'this_month',
        startDate: null,
        endDate: null,
        categoryFilter: 'All',
        isCumulative: false
    };

    const CATEGORY_CHART_COLORS = {
        "Food": "#10b981",
        "Transport": "#3b82f6",
        "Bills": "#f43f5e",
        "Health": "#06b6d4",
        "Entertainment": "#a855f7",
        "Shopping": "#f59e0b",
        "Other": "#64748b"
    };

    let charts = {};

    async function refreshDashboard() {
        updateSkeletonStates(true);

        const params = new URLSearchParams({
            start_date: AppState.startDate,
            end_date: AppState.endDate,
            category: AppState.categoryFilter
        });

        try {
            const response = await fetch(`/api/analytics?${params.toString()}`);
            if (response.status === 401) {
                showEmptyState('unauthorized');
                return;
            }
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            const data = await response.json();

            if (data.error) throw new Error(data.error);

            if (!data.summary || (data.summary.total_expenses === 0 && data.summary.total_income === 0 && (!data.assets || data.assets.growth.length === 0))) {
                showEmptyState('empty');
                return;
            }

            // Success: show content and hide empty state
            const emptyContainer = document.getElementById('empty-state-container');
            const contentContainer = document.getElementById('dashboard-content');
            if (emptyContainer) emptyContainer.classList.add('hidden');
            if (contentContainer) contentContainer.classList.remove('hidden');

            updateSummaryCards(data.summary);
            renderTrendsChart(data.trends);
            renderCategoryChart(data.distribution);
            renderCategoryTrendsChart(data.category_trends);
            renderDOWChart(data.dow_spend);
            renderAssetCharts(data.assets);
            renderTopTransactions(data.top_expenses);
            updateInsights(data.summary, data.distribution);

        } catch (error) {
            console.error("Failed to refresh dashboard:", error);
            showEmptyState('error');
        } finally {
            updateSkeletonStates(false);
        }
    }

    function updateSkeletonStates(show) {
        const cards = document.getElementById('stat-cards');
        if (!cards) return;
        if (show) {
            cards.innerHTML = `
                <div class="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                    <div class="h-4 w-24 skeleton rounded"></div>
                    <div class="h-8 w-32 skeleton rounded"></div>
                </div>
                <div class="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                    <div class="h-4 w-24 skeleton rounded"></div>
                    <div class="h-8 w-32 skeleton rounded"></div>
                </div>
                <div class="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                    <div class="h-4 w-24 skeleton rounded"></div>
                    <div class="h-8 w-32 skeleton rounded"></div>
                </div>
                <div class="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                    <div class="h-4 w-24 skeleton rounded"></div>
                    <div class="h-8 w-32 skeleton rounded"></div>
                </div>
            `;
        }
    }

    function updateSummaryCards(summary) {
        const container = document.getElementById('stat-cards');
        if (!container || !summary) return;
        const currency = '₹';

        const cards = [
            { label: 'Total Expenses', value: `${currency}${(summary.total_expenses || 0).toLocaleString()}`, color: 'text-rose-600' },
            { label: 'Total Income', value: `${currency}${(summary.total_income || 0).toLocaleString()}`, color: 'text-emerald-600' },
            { label: 'Net Savings', value: `${currency}${(summary.net_savings || 0).toLocaleString()}`, color: 'text-blue-600' },
            { label: 'Savings Rate', value: `${(summary.savings_rate || 0)}%`, color: 'text-indigo-600' },
        ];

        container.innerHTML = cards.map(card => `
            <div class="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <p class="text-xs font-medium text-slate-500 dark:text-slate-400">${card.label}</p>
                <p class="text-2xl font-bold ${card.color} dark:text-white mt-1">${card.value}</p>
            </div>
        `).join('');
    }

    function renderTrendsChart(data) {
        const canvas = document.getElementById('trendsChart');
        if (!canvas || !data) return;
        const ctx = canvas.getContext('2d');
        const labels = data.map(d => d.period);
        const expenseData = data.map(d => d.expense);
        const incomeData = data.map(d => d.income);

        if (AppState.isCumulative) {
            let cumExp = 0, cumInc = 0;
            const cumExpData = expenseData.map(v => cumExp += v);
            const cumIncData = incomeData.map(v => cumInc += v);
            updateChart(ctx, 'trendsChart', labels, cumExpData, cumIncData);
        } else {
            updateChart(ctx, 'trendsChart', labels, expenseData, incomeData);
        }
    }

    function updateChart(ctx, chartId, labels, expenseData, incomeData) {
        if (!ctx || typeof Chart === 'undefined') return;
        if (charts[chartId]) charts[chartId].destroy();

        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
        const textColor = isDark ? '#94a3b8' : '#64748b';

        charts[chartId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Expenses',
                        data: expenseData,
                        borderColor: '#f43f5e',
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Income',
                        data: incomeData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: textColor, font: { family: 'Inter' } } }
                },
                scales: {
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { family: 'Inter' } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor, font: { family: 'Inter' } }
                    }
                }
            }
        });
    }

    function renderCategoryChart(data) {
        const canvas = document.getElementById('categoryChart');
        if (!canvas || !data) return;
        const ctx = canvas.getContext('2d');
        const labels = data.map(d => d.category);
        const values = data.map(d => d.total);
        const colors = labels.map(l => CATEGORY_CHART_COLORS[l] || '#cbd5e1');

        if (charts['categoryChart']) charts['categoryChart'].destroy();

        if (typeof Chart === 'undefined') return;
        charts['categoryChart'] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                onClick: (evt, elements) => {
                    if (elements && elements.length > 0) {
                        const index = elements[0].index;
                        const category = labels[index];
                        updateRange(AppState.range, category);
                    }
                }
            }
        });

        const total = values.reduce((a, b) => a + b, 0);
        const listContainer = document.getElementById('category-list');
        if (!listContainer) return;
        listContainer.innerHTML = data.map(d => `
            <div class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" onclick="updateRange('${AppState.range}', '${d.category}')">
                <div class="flex items-center gap-3">
                    <div class="size-3 rounded-full" style="background-color: ${CATEGORY_CHART_COLORS[d.category] || '#cbd5e1'}"></div>
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">${d.category}</span>
                </div>
                <div class="text-right">
                    <p class="text-sm font-bold text-slate-900 dark:text-white">₹${(d.total || 0).toLocaleString()}</p>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400">${total > 0 ? ((d.total/total)*100).toFixed(1) : '0'}%</p>
                </div>
            </div>
        `).join('');
    }

    function renderCategoryTrendsChart(data) {
        const canvas = document.getElementById('categoryTrendsChart');
        if (!canvas || !data) return;
        const ctx = canvas.getContext('2d');
        const months = [...new Set(data.map(d => d.month))].sort();
        const categories = [...new Set(data.map(d => d.category))];

        const datasets = categories.map(cat => {
            const values = months.map(m => {
                const found = data.find(d => d.month === m && d.category === cat);
                return found ? found.total : 0;
            });
            return {
                label: cat,
                data: values,
                backgroundColor: CATEGORY_CHART_COLORS[cat] || '#cbd5e1',
                borderRadius: 4
            };
        });

        if (charts['categoryTrendsChart']) charts['categoryTrendsChart'].destroy();

        if (typeof Chart === 'undefined') return;
        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
        const textColor = isDark ? '#94a3b8' : '#64748b';

        charts['categoryTrendsChart'] = new Chart(ctx, {
            type: 'bar',
            data: { labels: months, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { stacked: true, grid: { display: false }, ticks: { color: textColor } },
                    y: { stacked: true, grid: { color: gridColor }, ticks: { color: textColor } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    function renderDOWChart(data) {
        const canvas = document.getElementById('dowChart');
        if (!canvas || !data) return;
        const ctx = canvas.getContext('2d');
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const values = new Array(7).fill(0);
        data.forEach(d => values[parseInt(d.dow)] = d.total);

        if (charts['dowChart']) charts['dowChart'].destroy();

        if (typeof Chart === 'undefined') return;
        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
        const textColor = isDark ? '#94a3b8' : '#64748b';

        charts['dowChart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Spending',
                    data: values,
                    backgroundColor: '#6366f1',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: gridColor }, ticks: { color: textColor } },
                    x: { grid: { display: false }, ticks: { color: textColor } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    function renderAssetCharts(data) {
        if (!data) return;

        const growthCanvas = document.getElementById('assetGrowthChart');
        if (growthCanvas) {
            const growthCtx = growthCanvas.getContext('2d');
            if (charts['assetGrowthChart']) charts['assetGrowthChart'].destroy();

            if (typeof Chart !== 'undefined') {
                const isDark = document.documentElement.classList.contains('dark');
                const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                const textColor = isDark ? '#94a3b8' : '#64748b';

                charts['assetGrowthChart'] = new Chart(growthCtx, {
                    type: 'line',
                    data: {
                        labels: (data.growth || []).map(d => d.date),
                        datasets: [{
                            label: 'Total Assets',
                            data: (data.growth || []).map(d => d.total),
                            borderColor: '#10b981',
                            fill: false,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { grid: { color: gridColor }, ticks: { color: textColor } },
                            x: { grid: { display: false }, ticks: { color: textColor } }
                        },
                        plugins: { legend: { display: false } }
                    }
                });
            }
        }

        const allocCanvas = document.getElementById('assetAllocationChart');
        if (allocCanvas) {
            const allocCtx = allocCanvas.getContext('2d');
            if (charts['assetAllocationChart']) charts['assetAllocationChart'].destroy();

            if (typeof Chart !== 'undefined') {
                const isDark = document.documentElement.classList.contains('dark');
                const textColor = isDark ? '#94a3b8' : '#64748b';

                charts['assetAllocationChart'] = new Chart(allocCtx, {
                    type: 'doughnut',
                    data: {
                        labels: (data.allocation || []).map(d => d.type),
                        datasets: [{
                            data: (data.allocation || []).map(d => d.total),
                            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#a855f7'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom', labels: { color: textColor, boxWidth: 12 } } }
                    }
                });
            }
        }
    }

    function renderTopTransactions(topExpenses) {
        const body = document.getElementById('top-transactions-body');
        if (!body) return;
        if (!topExpenses || topExpenses.length === 0) {
            body.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-slate-400 italic">No transactions found for this range.</td></tr>`;
            return;
        }

        body.innerHTML = topExpenses.map(exp => `
            <tr class="border-b border-slate-50 dark:border-slate-800">
                <td class="py-3 text-slate-600 dark:text-slate-400">${exp.date}</td>
                <td class="py-3">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-medium" style="background-color: ${CATEGORY_CHART_COLORS[exp.category] || '#cbd5e1'}20; color: ${CATEGORY_CHART_COLORS[exp.category] || '#64748b'}">
                        ${exp.category}
                    </span>
                </td>
                <td class="py-3 text-slate-700 dark:text-slate-300">${exp.description || 'No description'}</td>
                <td class="py-3 text-right font-bold text-slate-900 dark:text-white">₹${(exp.amount || 0).toLocaleString()}</td>
            </tr>
        `).join('');
    }

    function updateInsights(summary, distribution) {
        const container = document.getElementById('insights-container');
        if (!container || !summary) return;
        const insights = [];

        if (summary.net_savings < 0) {
            insights.push(`You've spent ₹${Math.abs(summary.net_savings).toLocaleString()} more than you earned this month.`);
        } else {
            insights.push(`Great job! You saved ₹${summary.net_savings.toLocaleString()} this period.`);
        }

        if (distribution && distribution.length > 0) {
            const top = distribution[0];
            const total = distribution.reduce((a, b) => a + (b.total || 0), 0);
            insights.push(`Your highest spend is in ${top.category}, accounting for ${total > 0 ? ((top.total / total)*100).toFixed(1) : '0'}% of expenses.`);
        }

        container.innerHTML = insights.map(text => `
            <div class="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                <span class="font-bold">💡 Insight:</span> ${text}
            </div>
        `).join('');
    }

    function showEmptyState(state = 'empty') {
        const emptyContainer = document.getElementById('empty-state-container');
        const contentContainer = document.getElementById('dashboard-content');
        if (!emptyContainer || !contentContainer) return;

        const isError = state === 'error';
        const isUnauthorized = state === 'unauthorized';

        emptyContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-center">
                <div class="size-20 ${isUnauthorized ? 'bg-amber-100 dark:bg-amber-900/20' : isError ? 'bg-rose-100 dark:bg-rose-900/20' : 'bg-slate-100 dark:bg-slate-800'} rounded-full flex items-center justify-center mb-4">
                    <svg class="size-10 ${isUnauthorized ? 'text-amber-500' : isError ? 'text-rose-500' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        ${isUnauthorized
                            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-2 2h4m-6-10a6 6 0 1112 0 6 6 0 01-12 0z"></path>'
                            : isError
                                ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
                                : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>'
                        }
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
                    ${isUnauthorized ? 'Session Expired' : isError ? 'Something went wrong' : 'No data for this range'}
                </h2>
                <p class="text-slate-500 dark:text-slate-400">
                    ${isUnauthorized
                        ? 'Your session has expired. Please sign in again to view your analytics.'
                        : isError
                            ? 'We encountered an error loading your analytics. Please try refreshing the page.'
                            : 'Try selecting a different time range or adding some transactions.'}
                </p>
                ${isUnauthorized ? `<a href="/login" class="mt-6 inline-block px-6 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">Sign In Again</a>` : ''}
            </div>
        `;

        emptyContainer.classList.remove('hidden');
        contentContainer.classList.add('hidden');
    }

    window.updateRange = async (range, category = 'All') => {
        AppState.range = range;
        AppState.categoryFilter = category;

        const now = new Date();
        let start = new Date();
        let end = new Date();

        switch(range) {
            case 'this_month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'last_month':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'last_3_months':
                start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                break;
            case 'this_year':
                start = new Date(now.getFullYear(), 0, 1);
                break;
            case 'all_time':
                start = new Date('1970-01-01');
                break;
            case 'custom':
                const s = document.getElementById('start-date')?.value;
                const e = document.getElementById('end-date')?.value;
                if (!s || !e) return alert('Please select both dates');
                start = new Date(s);
                end = new Date(e);
                break;
        }

        AppState.startDate = start.toISOString().split('T')[0];
        AppState.endDate = end.toISOString().split('T')[0];

        document.querySelectorAll('.range-btn').forEach(btn => {
            if (btn.dataset.range === range) {
                btn.classList.add('bg-white', 'dark:bg-slate-700', 'text-slate-900', 'dark:text-white', 'shadow-sm');
                btn.classList.remove('text-slate-600', 'dark:text-slate-400');
            } else {
                btn.classList.remove('bg-white', 'dark:bg-slate-700', 'text-slate-900', 'dark:text-white', 'shadow-sm');
                btn.classList.add('text-slate-600', 'dark:text-slate-400');
            }
        });

        await refreshDashboard();
    };

    window.toggleCumulative = (isCumulative) => {
        AppState.isCumulative = isCumulative;
        const pToggle = document.getElementById('period-toggle');
        const cToggle = document.getElementById('cumulative-toggle');
        if (pToggle) pToggle.className = isCumulative ?
            'px-3 py-1 text-xs font-medium rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white' :
            'px-3 py-1 text-xs font-medium rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm';
        if (cToggle) cToggle.className = isCumulative ?
            'px-3 py-1 text-xs font-medium rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' :
            'px-3 py-1 text-xs font-medium rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';

        refreshDashboard();
    };

    updateRange('this_month');
});
