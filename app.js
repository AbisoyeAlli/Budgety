//IIFE to handle internal calculations of  input
var dataModule = (function () {
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }       
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }, 
        budget: 0,
        percentage: -1
    };
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            //create new item ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            //create new item (either inc or exp)
            if (type === 'exp') {
                newItem = new Expense (ID, des, val);
            }else if (type === 'inc') {
                newItem = new Income (ID, des, val);
            }
            //add new item to data structure
            data.allItems[type].push(newItem);
            //return new item
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        
        },       
        calculateBudget: function () {
            //to calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //to calculate budget (income - expenses)
            data.budget = data.totals.inc - data.totals.exp;
            
            //to calculate percentage of income spent
            if (data.totals.inc > 0) {
               data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); 
            } else {
                data.percentage = -1;
            }          
        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.allItems.inc);
            });        
        },
        getPercentages: function () {
           var allPerc;
            allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        getBudget: function () {
          return {
              budget: data.budget,
              totalInc: data.totals.inc,
              totalExp: data.totals.exp,
              percentage: data.percentage
          }; 
        },       
    };
})();
//IIFE to handle UI updates and input fields
var uiModule = (function () {
    //to store the class and id names for eventListeners
    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container clearfix',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    
        var formatNumber = function (num, type) {
            var numSplit, int, dec, type;
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            int = numSplit[0];
            if(numSplit[0] > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            
            dec = numSplit[1];
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
            
        };
    
        var nodeListForEach = function(list, callback) {
              for (var i = 0; i < list.length; i++) {
                  callback(list[i], i);
              }  
            };
    
    //input fields
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        //to add new item to the UI
        addListItem: function (obj, type) {
        var html, newHtml, element;
            
            //create HTML string with placeholder text
        if (type === 'inc'){
            element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        } else if (type === 'exp') {
             element = DOMstrings.expensesContainer;
             html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
            
            //replace placeholder text with actual data
        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            //insert HTML into the DOM
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function () {
          var el;
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
            //a method to clear fields after input
        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputValue);
            //trick to convert list to array since querySelectorAll produces a list not array
            fieldsArr = Array.prototype.slice.call(fields);
            //loop
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            //to return to the input description field
            fieldsArr[0].focus();
        },
        //method to display on UI
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%'; 
            } else {
            document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        //method to display percentages
        displayPercentages: function (percentages) {
           var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
    
            nodeListForEach(fields, function(current, index){
              if(percentages[index] > 0){
                  current.textContent = percentages[index] + '%';
              }  else {
                  current.textContent = '---';
                }
            });        
        },
        
        displayMonth: function () {
          var now, months, month, year;
            
            now = new Date();
            months = ['Janaury', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ', ' + year;
            
        },
        
        changedType: function () {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDesc + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },
        
        
        
        //method to make DOMstrings accessible to the public
        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})();


//to handle eventListeners
var controllerModule = (function (dataCtrl, uiCtrl) {

    var setUpEventListeners = function () {
        //to access the DOMstrings in UI module
        var DOM = uiCtrl.getDOMstrings();

        //when the 'ok' button is clicked
        document.querySelector(DOM.inputButton).addEventListener('click', addItem);
        //when enter/return key is pressed
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                addItem();
            }
        });
        //event listener for deleting item
        document.querySelector(DOM.container).addEventListener('click', deleteItem);
        
    //event Listener to improve UX
        document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changedType);
    };
    
    
    
    //DRY function to get and add items, calculate budget and display it
    var updateBudget = function () {
      //to calculate budget
      dataCtrl.calculateBudget();
      //to return calculated budget
      var budget = dataCtrl.getBudget();
      // to display calculated budget on UI
      uiCtrl.displayBudget(budget);
    };
    //function to update percentages
    var updatePercentges = function () {
        //calculate  percentages
        dataCtrl.calculatePercentages();
        //read percentages from budget controller
        var percentages = dataCtrl.getPercentages();
        //update the UI with the calculated percentages
        uiCtrl.displayPercentages(percentages);
        
    };
    //function to add items
    var addItem = function () {
        var input, newItem;
        //to get input data
        input = uiCtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //to add item to the data structure
            newItem = dataCtrl.addItem(input.type, input.description, input.value);
            //to add item to the UI
            uiCtrl.addListItem(newItem, input.type);
            //to clear fields after input
            uiCtrl.clearFields();
            // calculate and update budget function
            updateBudget(); 
            //calculate and update percentages
            updatePercentges();
         }      
        
    };
    //function to delete items
    var deleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            //to delete item from data structure
            dataCtrl.deleteItem(type, ID);
            //to delete item from UI
            uiCtrl.deleteListItem(itemID);
            //to update and display new budget on UI
            updateBudget();
            //calculate and update percentages
            updatePercentges();
        }
    };

    return {
        init: function () {
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setUpEventListeners();
        }
    };
})(dataModule, uiModule);

controllerModule.init();
