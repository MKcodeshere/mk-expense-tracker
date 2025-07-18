const { useState, useEffect } = React;
const { Calendar, Plus, TrendingUp, User, Users, DollarSign, PieChart, BarChart3, Edit3, Trash2, Save, X } = lucide;

const ExpenseTracker = () => {
  // Utility function to get IST date in YYYY-MM-DD format
  const getISTDate = (date = new Date()) => {
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    const istDate = new Date(date.getTime() + istOffset);
    return istDate.toISOString().split('T')[0];
  };

  // Get current IST date
  const getCurrentISTDate = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    return istNow;
  };

  const [currentDate, setCurrentDate] = useState(() => getCurrentISTDate());
  const [selectedDate, setSelectedDate] = useState(() => getCurrentISTDate());
  const [expenses, setExpenses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // calendar, daily, weekly, monthly
  const [selectedUser, setSelectedUser] = useState('both'); // you, wife, both
  
  // Form state
  const [formData, setFormData] = useState({
    date: getISTDate(),
    user: 'you',
    category: 'vegetables',
    amount: '',
    description: ''
  });

  const categories = [
    'meat', 'fish', 'egg', 'flowers', 'elaki banana', 'red banana', 
    'baby diaper', 'cooking oil', 'outside food', 'zomato/swiggy', 
    'vegetables', 'fruits', 'manickam shop', 'akka shop', 
    'alice super market', 'nearby shop', 'coconut water', 'other'
  ];

  const userColors = {
    you: 'bg-blue-500',
    wife: 'bg-pink-500'
  };

  // Initialize form with selected date
  useEffect(() => {
    // Set form date to the selected calendar date
    setFormData(prev => ({
      ...prev,
      date: getISTDate(selectedDate)
    }));
  }, [selectedDate]);

  // Load expenses from localStorage
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // Save expenses to localStorage
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = () => {
    if (!formData.amount || !formData.description) return;
    
    const newExpense = {
      id: Date.now(),
      date: formData.date, // Use the exact date string from the form
      user: formData.user,
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
      timestamp: new Date().toISOString()
    };
    
    setExpenses([...expenses, newExpense]);
    setFormData({
      date: getISTDate(),
      user: 'you',
      category: 'vegetables',
      amount: '',
      description: ''
    });
    setShowAddForm(false);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense.id);
    setFormData({
      date: expense.date,
      user: expense.user,
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description
    });
    setShowAddForm(true);
  };

  const handleUpdateExpense = () => {
    if (!formData.amount || !formData.description) return;
    
    setExpenses(expenses.map(expense => 
      expense.id === editingExpense 
        ? {
            ...expense,
            date: formData.date,
            user: formData.user,
            category: formData.category,
            amount: parseFloat(formData.amount),
            description: formData.description
          }
        : expense
    ));
    
    setEditingExpense(null);
    setFormData({
      date: getISTDate(),
      user: 'you',
      category: 'vegetables',
      amount: '',
      description: ''
    });
    setShowAddForm(false);
  };

  const handleDeleteExpense = (expenseId) => {
    setExpenses(expenses.filter(expense => expense.id !== expenseId));
  };

  const getExpensesForDate = (date) => {
    const dateStr = getISTDate(date);
    return expenses.filter(expense => expense.date === dateStr);
  };

  const getExpensesForPeriod = (period) => {
    let startDate, endDate;
    
    if (period === 'daily') {
      // Get today's date in IST
      const todayStr = getISTDate();
      return expenses.filter(expense => expense.date === todayStr);
    } else if (period === 'weekly') {
      startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
    } else if (period === 'monthly') {
      startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    }
    
    if (period !== 'daily') {
      return expenses.filter(expense => {
        const expenseDate = new Date(expense.date + 'T00:00:00'); // Treat as local date
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    }
  };

  const getTotalAmount = (expensesList, user = 'both') => {
    const filtered = user === 'both' ? expensesList : expensesList.filter(e => e.user === user);
    return filtered.reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoryTotals = (expensesList) => {
    const totals = {};
    expensesList.forEach(expense => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return totals;
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return React.createElement('div', { className: 'bg-white rounded-lg shadow-lg p-6' },
      React.createElement('div', { className: 'flex items-center justify-between mb-6' },
        React.createElement('h2', { className: 'text-xl font-semibold' },
          currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        ),
        React.createElement('div', { className: 'flex gap-2' },
          React.createElement('button', {
            onClick: () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)),
            className: 'p-2 hover:bg-gray-100 rounded'
          }, '←'),
          React.createElement('button', {
            onClick: () => setCurrentDate(getCurrentISTDate()),
            className: 'px-3 py-1 bg-blue-500 text-white rounded text-sm'
          }, 'Today'),
          React.createElement('button', {
            onClick: () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)),
            className: 'p-2 hover:bg-gray-100 rounded'
          }, '→')
        )
      ),
      React.createElement('div', { className: 'grid grid-cols-7 gap-1 mb-2' },
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day =>
          React.createElement('div', { key: day, className: 'p-2 text-center text-sm font-medium text-gray-600' }, day)
        )
      ),
      React.createElement('div', { className: 'grid grid-cols-7 gap-1' },
        days.map((day, index) => {
          const dayExpenses = getExpensesForDate(day);
          const dayTotal = getTotalAmount(dayExpenses);
          const isCurrentMonth = day.getMonth() === month;
          const isSelected = getISTDate(day) === getISTDate(selectedDate);
          const isToday = getISTDate(day) === getISTDate();
          
          return React.createElement('div', {
            key: index,
            onClick: () => setSelectedDate(day),
            className: `p-2 min-h-[60px] cursor-pointer border rounded ${
              isSelected ? 'bg-blue-100 border-blue-500' : 
              isToday ? 'bg-gray-100 border-gray-400' : 'border-gray-200 hover:bg-gray-50'
            } ${!isCurrentMonth ? 'opacity-50' : ''}`
          },
            React.createElement('div', { className: `text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}` },
              day.getDate()
            ),
            dayExpenses.length > 0 && React.createElement('div', { className: 'mt-1' },
              React.createElement('div', { className: 'text-xs text-green-600 font-medium' },
                `₹${dayTotal.toFixed(2)}`
              ),
              React.createElement('div', { className: 'flex gap-1 mt-1' },
                dayExpenses.slice(0, 2).map(expense =>
                  React.createElement('div', {
                    key: expense.id,
                    className: `w-2 h-2 rounded-full ${userColors[expense.user]}`
                  })
                ),
                dayExpenses.length > 2 && React.createElement('div', { className: 'text-xs text-gray-500' },
                  `+${dayExpenses.length - 2}`
                )
              )
            )
          );
        })
      )
    );
  };

  const renderExpenseForm = () => {
    return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' },
      React.createElement('div', { className: 'bg-white rounded-lg p-6 w-full max-w-md' },
        React.createElement('div', { className: 'flex justify-between items-center mb-4' },
          React.createElement('h3', { className: 'text-lg font-semibold' },
            editingExpense ? 'Edit Expense' : 'Add New Expense'
          ),
          React.createElement('button', {
            onClick: () => {
              setShowAddForm(false);
              setEditingExpense(null);
              setFormData({
                date: getISTDate(),
                user: 'you',
                category: 'vegetables',
                amount: '',
                description: ''
              });
            },
            className: 'text-gray-500 hover:text-gray-700'
          }, React.createElement(X, { size: 20 }))
        ),
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Date'),
            React.createElement('input', {
              type: 'date',
              value: formData.date,
              onChange: (e) => setFormData({...formData, date: e.target.value}),
              className: 'w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Who spent?'),
            React.createElement('select', {
              value: formData.user,
              onChange: (e) => setFormData({...formData, user: e.target.value}),
              className: 'w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            },
              React.createElement('option', { value: 'you' }, 'You'),
              React.createElement('option', { value: 'wife' }, 'Wife')
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Category'),
            React.createElement('select', {
              value: formData.category,
              onChange: (e) => setFormData({...formData, category: e.target.value}),
              className: 'w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            },
              categories.map(cat =>
                React.createElement('option', { key: cat, value: cat },
                  cat.charAt(0).toUpperCase() + cat.slice(1)
                )
              )
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Amount (₹)'),
            React.createElement('input', {
              type: 'number',
              step: '0.01',
              value: formData.amount,
              onChange: (e) => setFormData({...formData, amount: e.target.value}),
              className: 'w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              placeholder: '0.00'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Description'),
            React.createElement('input', {
              type: 'text',
              value: formData.description,
              onChange: (e) => setFormData({...formData, description: e.target.value}),
              className: 'w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              placeholder: 'What was this expense for?'
            })
          )
        ),
        React.createElement('div', { className: 'flex gap-3 mt-6' },
          React.createElement('button', {
            onClick: editingExpense ? handleUpdateExpense : handleAddExpense,
            disabled: !formData.amount || !formData.description,
            className: 'flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
          }, `${editingExpense ? 'Update' : 'Add'} Expense`)
        )
      )
    );
  };

  const renderSummaryCards = () => {
    const dailyExpenses = getExpensesForPeriod('daily');
    const weeklyExpenses = getExpensesForPeriod('weekly');
    const monthlyExpenses = getExpensesForPeriod('monthly');
    
    return React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-6' },
      React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow' },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', null,
            React.createElement('p', { className: 'text-sm text-gray-600' }, "Today's Total"),
            React.createElement('p', { className: 'text-2xl font-semibold text-green-600' },
              `₹${getTotalAmount(dailyExpenses).toFixed(2)}`
            ),
            React.createElement('div', { className: 'text-xs text-gray-500 mt-1' },
              `You: ₹${getTotalAmount(dailyExpenses, 'you').toFixed(2)} | Wife: ₹${getTotalAmount(dailyExpenses, 'wife').toFixed(2)}`
            )
          ),
          React.createElement(Calendar, { className: 'text-gray-400', size: 24 })
        )
      ),
      React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow' },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', null,
            React.createElement('p', { className: 'text-sm text-gray-600' }, 'Weekly Total'),
            React.createElement('p', { className: 'text-2xl font-semibold text-blue-600' },
              `₹${getTotalAmount(weeklyExpenses).toFixed(2)}`
            ),
            React.createElement('div', { className: 'text-xs text-gray-500 mt-1' },
              `You: ₹${getTotalAmount(weeklyExpenses, 'you').toFixed(2)} | Wife: ₹${getTotalAmount(weeklyExpenses, 'wife').toFixed(2)}`
            )
          ),
          React.createElement(BarChart3, { className: 'text-gray-400', size: 24 })
        )
      ),
      React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow' },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', null,
            React.createElement('p', { className: 'text-sm text-gray-600' }, 'Monthly Total'),
            React.createElement('p', { className: 'text-2xl font-semibold text-purple-600' },
              `₹${getTotalAmount(monthlyExpenses).toFixed(2)}`
            ),
            React.createElement('div', { className: 'text-xs text-gray-500 mt-1' },
              `You: ₹${getTotalAmount(monthlyExpenses, 'you').toFixed(2)} | Wife: ₹${getTotalAmount(monthlyExpenses, 'wife').toFixed(2)}`
            )
          ),
          React.createElement(TrendingUp, { className: 'text-gray-400', size: 24 })
        )
      )
    );
  };

  const renderExpensesList = () => {
    const selectedDateExpenses = getExpensesForDate(selectedDate);
    
    return React.createElement('div', { className: 'bg-white rounded-lg shadow-lg p-6' },
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('h3', { className: 'text-lg font-semibold' },
          `Expenses for ${selectedDate.toLocaleDateString()}`
        ),
        React.createElement('button', {
          onClick: () => setShowAddForm(true),
          className: 'bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2'
        },
          React.createElement(Plus, { size: 16 }),
          'Add Expense'
        )
      ),
      selectedDateExpenses.length === 0 ? 
        React.createElement('p', { className: 'text-gray-500 text-center py-8' },
          'No expenses recorded for this date'
        ) :
        React.createElement('div', { className: 'space-y-3' },
          selectedDateExpenses.map(expense =>
            React.createElement('div', { key: expense.id, className: 'flex items-center justify-between p-3 bg-gray-50 rounded-md' },
              React.createElement('div', { className: 'flex items-center gap-3' },
                React.createElement('div', { className: `w-3 h-3 rounded-full ${userColors[expense.user]}` }),
                React.createElement('div', null,
                  React.createElement('p', { className: 'font-medium' }, expense.description),
                  React.createElement('p', { className: 'text-sm text-gray-600' },
                    `${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)} • ${expense.user === 'you' ? 'You' : 'Wife'}`
                  )
                )
              ),
              React.createElement('div', { className: 'flex items-center gap-2' },
                React.createElement('span', { className: 'font-semibold text-green-600' },
                  `₹${expense.amount.toFixed(2)}`
                ),
                React.createElement('button', {
                  onClick: () => handleEditExpense(expense),
                  className: 'text-blue-500 hover:text-blue-700 p-1'
                }, React.createElement(Edit3, { size: 16 })),
                React.createElement('button', {
                  onClick: () => handleDeleteExpense(expense.id),
                  className: 'text-red-500 hover:text-red-700 p-1'
                }, React.createElement(Trash2, { size: 16 }))
              )
            )
          )
        )
    );
  };

  return React.createElement('div', { className: 'min-h-screen bg-gray-100 p-4' },
    React.createElement('div', { className: 'max-w-6xl mx-auto' },
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement('h1', { className: 'text-3xl font-bold text-gray-900 mb-2' },
          'Shared Expense Tracker'
        ),
        React.createElement('p', { className: 'text-gray-600' },
          'Track your daily household expenses together'
        ),
        React.createElement('button', {
          onClick: () => {
            localStorage.removeItem('expenses');
            setExpenses([]);
            window.location.reload();
          },
          className: 'mt-2 text-sm text-red-600 hover:text-red-800 underline'
        }, 'Clear All Data & Start Fresh')
      ),
      renderSummaryCards(),
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
        renderCalendar(),
        renderExpensesList()
      ),
      showAddForm && renderExpenseForm()
    )
  );
};

ReactDOM.render(React.createElement(ExpenseTracker), document.getElementById('root'));
