/*
Title: Budget App - Javascript
Author: Ylli Gorce
GitHub: https://github.com/ylligorce
Version: 1.0
 */

//Budget Controller
const budgetController = (function () {

    const Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalInc) {

        if (totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const dataObj = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percent: -1
    };

    function calculateTotal(type) {
        let sum = 0;

        dataObj.allItems[type].forEach(function (elem) {

            sum += elem.value

        });

        dataObj.totals[type] = sum;
    }


    //Functions
    const addNewItem = function (type, desc, value) {

        let newItem,
            ID = dataObj.allItems[type].length > 0 ?
                dataObj.allItems[type][dataObj.allItems[type].length - 1].id + 1
                : 0;

        if (type === 'exp') {

            newItem = new Expense(ID, desc, value);

        } else if (type === 'inc') {
            newItem = new Income(ID, desc, value);
        } else {
            throw new Error('Invalid operator type!');
        }

        dataObj.allItems[type].push(newItem);

        return newItem;
    };

    const deleteItem = function (type, id) {

        let IDs, index;

        IDs = dataObj.allItems[type].map(function (elem) {
            return elem.id;
        });

        index = IDs.indexOf(id);

        if (index === -1) return;

        dataObj.allItems[type].splice(index, 1);

    };

    const calculateBudget = function (type) {

        //calc total income, expenses
        calculateTotal(type);

        //calc budget: income - expenses
        dataObj.budget = dataObj.totals.inc - dataObj.totals.exp;

        //calc percentage of income
        if (dataObj.totals.inc <= 0) {
            dataObj.percent = -1;
            return
        }
        dataObj.percent = Math.round((dataObj.totals.exp / dataObj.totals.inc) * 100);

    };

    const getBudget = function () {
        return {
            budget: dataObj.budget,
            percent: dataObj.percent,
            totalInc: dataObj.totals.inc,
            totalExp: dataObj.totals.exp
        };
    };

    const calcItemPercentages = function () {

        dataObj.allItems.exp.forEach(function (elem) {
            elem.calcPercentage(dataObj.totals.inc);
        })

    };

    const getPercentages = function () {
        return dataObj.allItems.exp.map(function (elem) {
            return elem.getPercentage();
        });
    };

    return {
        addNewItem,
        deleteItem,
        calculateBudget,
        getBudget,
        calcItemPercentages,
        getPercentages
    }


})();

//UI Controller
const UIController = (function () {

    const DOM_Strings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputAdd: '.add__btn',
        expenseContainer: '.expenses__list',
        incomeContainer: '.income__list',
        budgetMonthLabel: '.budget__title--month',
        budgetLabel: '.budget__value',
        budgetIncomeLabel: '.budget__income--value',
        budgetExpensesLabel: '.budget__expenses--value',
        budgetExpensesPercentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentLabel: '.item__percentage',
    };

    function nodeListForEach(list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    function formatNumber(num, type) {
        num = Math.abs(num);
        num = num.toFixed(2);

        let numSplit = num.split('.');
        let int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) +
                ','
                + int.substr(int.length - 3, 3); //2310 => 2,310
        }

        let dec = numSplit[1];

        let sign;

        type === 'exp' ? sign = '-' : sign = '+';

        return sign + ' ' + int + '.' + dec;
    }

    //Functions
    const getDomStrings = function () {
        return DOM_Strings;
    };

    const getInput = function () {
        let typeVal = document.querySelector(DOM_Strings.inputType).value, //inc | exp
            descriptionVal = document.querySelector(DOM_Strings.inputDesc).value,
            value = parseFloat(document.querySelector(DOM_Strings.inputValue).value);

        return {
            typeVal,
            descriptionVal,
            value
        };
    };

    const resetInput = function () {
        let fields;
        //Old
        // document.querySelector(DOM_Strings.inputType).value = 'inc';
        // document.querySelector(DOM_Strings.inputDesc).value = '';
        // document.querySelector(DOM_Strings.inputValue).value = '';

        fields = document.querySelectorAll(DOM_Strings.inputDesc + ',' + DOM_Strings.inputValue);

        let fieldsArray = Array.prototype.slice.call(fields);

        fieldsArray.forEach(function (elem) {
            elem.value = '';
        });

    };

    const addListItem = function (obj, type) {

        let idString = '',
            itemValue = formatNumber(obj.value, type),
            itemPercent = '',
            containerList;

        if (type === 'exp') {
            idString = `exp-${obj.id}`;
            containerList = DOM_Strings.expenseContainer;
            itemPercent = '<div class="item__percentage"></div>';

        } else if (type === 'inc') {
            idString = `inc-${obj.id}`;
            containerList = DOM_Strings.incomeContainer;

        } else {
            throw new Error('Invalid type format!');
        }

        //generate html string
        let output = '<div class="item clearfix" id="' + idString + '">\n' +
            '                    <div class="item__description">' + obj.description + '</div>\n' +
            '                    <div class="right clearfix">\n' +
            '                        <div class="item__value">' + itemValue + '</div>\n' +
            itemPercent +
            '                        <div class="item__delete">\n' +
            '                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '                </div>';

        document.querySelector(containerList).insertAdjacentHTML('beforeend', output);
    };

    const deleteListItem = function (selectedID) {
        let elem = document.getElementById(selectedID);
        elem.parentNode.removeChild(elem);
    };

    const showBudget = function (obj) {
        let type;
        obj.budget > 0 ? type = 'inc' : type = 'exp';

        //budget labels
        document.querySelector(DOM_Strings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOM_Strings.budgetIncomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector(DOM_Strings.budgetExpensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

        if (obj.percent > 0) {
            document.querySelector(DOM_Strings.budgetExpensesPercentageLabel)
                .textContent = `${obj.percent} %`;

        } else {
            document.querySelector(DOM_Strings.budgetExpensesPercentageLabel)
                .textContent = `0 %`;
        }

    };

    const displayMonth = function () {
        let now = new Date();
        let months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        let year = now.getFullYear();
        let month = months[now.getMonth() - 1];

        document.querySelector(DOM_Strings.budgetMonthLabel).textContent = month + ' ' + year;
    };

    const displayPercentages = function (percentages) {

        let elements = document.querySelectorAll(DOM_Strings.expPercentLabel);

        nodeListForEach(elements, function (current, index) {
            current.textContent = percentages[index] === 0 ? '0' : percentages[index] + '%';
        });

    };

    const changeType = function () {
        let fields = document.querySelectorAll(
            DOM_Strings.inputType + ',' +
            DOM_Strings.inputDesc + ',' +
            DOM_Strings.inputValue);

        nodeListForEach(fields, function (curr) {
            curr.classList.toggle('red-focus');
        });

        document.querySelector(DOM_Strings.inputAdd).classList.toggle('red');
    };

    return {
        getDomStrings,
        getInput,
        resetInput,
        addListItem,
        deleteListItem,
        displayPercentages,
        displayMonth,
        changeType,
        showBudget
    };

})();

//App Controller
const App = (function (budgetCtrl, UICtrl) {

    const setupEventListeners = function () {

        document.querySelector(UICtrl.getDomStrings().inputAdd).addEventListener('click', addItemCtrl);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                addItemCtrl()
            }
        });

        document.querySelector(UICtrl.getDomStrings().container).addEventListener('click', deleteItemCtrl);

        //change input color on exp
        document.querySelector(UICtrl.getDomStrings().inputType).addEventListener('change', UICtrl.changeType);
    };

    const addItemCtrl = function () {

        let inputData,
            newItem;

        //get input data
        inputData = UICtrl.getInput();

        //check input data
        if (!checkInputFields(inputData)) return;

        //add item to budgetCtrl
        newItem = budgetCtrl.addNewItem(inputData.typeVal, inputData.descriptionVal, inputData.value);

        //update ui
        UICtrl.addListItem(newItem, inputData.typeVal);

        //reset field
        UICtrl.resetInput();

        //calc budget
        updateBudget(inputData.typeVal);

        //update percentage
        updatePercentages();

    };

    const deleteItemCtrl = function (event) {

        let itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (!itemID) return;

        splitID = itemID.split('-');
        type = splitID[0];
        ID = parseInt(splitID[1]);

        //delete item from data structure
        budgetCtrl.deleteItem(type, ID);

        //delete from ui
        UICtrl.deleteListItem(itemID);

        //show new budget
        updateBudget(type);
    };

    const updateBudget = function (type) {
        //calculate budget
        budgetCtrl.calculateBudget(type);

        //return budget
        const budgetData = budgetCtrl.getBudget();

        //display ui
        UICtrl.showBudget(budgetData);

    };

    function updatePercentages() {
        //calc percent
        budgetCtrl.calcItemPercentages();

        //read from budgetCtrl
        let percentages = budgetCtrl.getPercentages();

        //update ui
        UICtrl.displayPercentages(percentages);
    }

    function checkInputFields(input) {
        return !(input.descriptionVal === '' ||
            Number.isNaN(input.value) ||
            input.value <= 0 ||
            input.value === '');
    }

    return {
        init: function () {
            setupEventListeners();
            UICtrl.showBudget({
                budget: 0,
                percent: -1,
                totalInc: 0,
                totalExp: -0
            });
            UICtrl.displayMonth();
        }
    }

})(budgetController, UIController);

App.init();
