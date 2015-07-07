'use strict';

(function(window){
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  var utils = {
    alertTemplate: Handlebars.compile($('#alert-template').html()),
    showAlert: function($el, content, type) {
      var $alertEl = this.alertTemplate({
        type: type,
        content: content
      });

      $el.prepend($alertEl);               
    }
  };
  

  var LocalStorage = function(prefix) {
    this.prefix = prefix;
    this.storedIds = [];
  };

  LocalStorage.prototype.setItem = function(object) {
    var stringifiedObject = JSON.stringify(object);

    if(this.storedIds.indexOf(object.id)) {
      this.storedIds.push(object.id);
    }

    localStorage.setItem(this.prefix+'-'+object.id, stringifiedObject);
    localStorage.setItem(this.prefix, this.storedIds);
  };

  LocalStorage.prototype.fetch = function() {
    var storedIds = localStorage.getItem(this.prefix),
        self = this,
        objects = [],
        object;

    if(storedIds !== null) {
      this.storedIds = storedIds.split(',');

      objects = this.storedIds.map(function(id){
        object = localStorage.getItem(self.prefix+'-'+id);
        object = JSON.parse(object);
        return object;
      });
    }

    return objects;
  };


  ////////////////////////
  //  List
  ////////////////////////

  var List = function(options) {
    var self = this,
        objects;

    this.objects = [];
    this.model = options.model;
    this.localStorage = new LocalStorage(options.localStoragePrefix);

    // fetch from localStorage
    objects = this.localStorage.fetch();

    objects.forEach(function (object) {
      self.create(object, true);
    });

    this.emit('reset');
  };

  // add emitter events to List class
  Emitter(List.prototype);

  List.prototype.create = function(data, silent) {
    var object = new this.model(data),
        self = this;

    this.objects.push(object);

    if(!silent) {
      this.localStorage.setItem(object);
      this.emit('add');
    }

    object.on('update', function () {
      self.localStorage.setItem(object);
    });

  };

  List.prototype.orderByMethod = function(methodName) {
    var orderedObjects = this.objects;

    orderedObjects.sort(function(a, b){
      
      if (a[methodName]() > b[methodName]()) {
        return 1;
      }

      if (a[methodName]() < b[methodName]()) {
        return -1;
      }

      // a must be equal to b
      return 0;
    });

    return orderedObjects;
  };

  List.prototype.getObjectById = function(id) {
    var obj = {};

    this.objects.forEach(function(o){
      if(o.id === id) {
        obj = o;
      }
    });

    return obj;
  };

  ////////////////////////
  //  List View
  ////////////////////////

  var ListView = function() {

  };

  ListView.prototype.render = function() {
    var self = this;

    this.$el.html('');

    this.list.objects.forEach(function(object){
      self.$el.append(object.render());
    });

    return this.$el;
  };
  



  ////////////////////////
  //  Game
  ////////////////////////

  var Game = function (options) {
    var self = this;

    this.options = $.extend({
      $el: $('#game'),
      currentMonth: 0,
      maxMonth: 12,
      MONTHS: MONTHS,
      $gameControl: $('#game-control'),
    }, options);

    this.$el = this.options.$el;
    this.currentMonth = this.options.currentMonth;
    this.maxMonth = this.options.maxMonth;
    this.MONTHS = this.options.MONTHS;
    this.$gameControl = this.options.$gameControl;

    this.lists = {
      families: new List({
        model: Family,
        localStoragePrefix: 'family'
      }),

      stocks: new List({
        model: Stock,
        localStoragePrefix: 'stock'
      }),

    };

    this.views = {
      FamiliesView: FamilyListView,
      FamilyRankingView: FamilyRankingView,
      FamilyDetailListView: FamilyDetailListView,
      StocksView: StockListView,
      StockChartView: StockChartView,
      GameControlView: GameControlView,
      GameInitializeView: GameInitializeView
    };

    // Event listeners
    // DOM Elements



    // Emitter events

    this.on('reset', function(e) {
      console.log('reset');
      console.log(e.data);
    });

    this.on('update', function () {
      self.render();
    });

    this.on('nextMonth', function() {
      self.nextMonth();
    });

    this.on('showGameInitializeView', function () {
      self.showGameInitializeView();
    });

    this.on('showFamilyRankingView', function () {
      self.showFamilyRankingView();
    });

    this.on('showFamilyDetailListView', function () {
      self.showFamilyDetailListView();
    });

    this.on('showStockChartView', function () {
      self.showStockChartView();
    });

    this.render();
  };

  Emitter(Game.prototype);


  Game.prototype.addFamily = function(data) {
    this.lists.families.create({
      name: data.name
    });
  };

  Game.prototype.addStock = function(data) {
    this.lists.stocks.create({
      name: data.name
    });
  };

  Game.prototype.getCurrentMonth = function() {
    return this.MONTHS[this.currentMonth];
  };

  Game.prototype.render = function() {
    // Render Views:

    
    var gameControlView = new this.views.GameControlView({model: this});
    this.$gameControl.html(gameControlView.render());
  };

  Game.prototype.showGameInitializeView = function() {
    var gameInitializeView = new this.views.GameInitializeView({model: this});
    this.$el.html(gameInitializeView.render());
  };

  Game.prototype.showFamilyRankingView = function() {
    var familyRankingView = new this.views.FamilyRankingView({list: this.lists.families});
    this.$el.html(familyRankingView.render());
  };

  Game.prototype.showFamilyDetailListView = function() {
    var familyDetailListView = new this.views.FamilyDetailListView({
      list: this.lists.families,
      stocks: this.lists.stocks
    });

    this.$el.html(familyDetailListView.render());
  };

  Game.prototype.showStockChartView = function() {
    var stockChartView = new this.views.StockChartView({
      list: this.lists.stocks,
      months: this.MONTHS
    });

    this.$el.html(stockChartView.render());
  };

  
  Game.prototype.nextMonth = function() {
    if (this.currentMonth + 1 === this.maxMonth) {
      this.end();
    } else {

      this.lists.stocks.objects.forEach(function(stock){
        stock.calcCurrentSharePrice();
      });

      this.lists.families.objects.forEach(function(family){
        family.resetLastIncome();
      });

      this.currentMonth += 1;
      this.emit('update');

    }
  };

  Game.prototype.end = function() {
    // body...
  };


  ////////////////////////
  //  Game Initialize View
  ////////////////////////


  var GameInitializeView = function (options) {

    this.options = $.extend({
      $templateElement: $('#game-initialize-template')
    }, options);

    var templateSource = this.options.$templateElement.html();
    this.template = Handlebars.compile(templateSource);
    this.model = options.model;
    this.$el = null;

  };

  GameInitializeView.prototype.initialize = function() {
    var self = this;
    // Event listeners
    
    this.$el.on('submit', '#add-family', function(e){
      e.preventDefault();

      self.model.addFamily({
        name: e.target.name.value
      });

      e.target.name.value = '';

      self.render();
    });

    this.$el.on('submit', '#add-stock', function(e){
      e.preventDefault();

      self.model.addStock({
        name: e.target.name.value
      });

      e.target.name.value = '';

      self.render();
    });

    /*this.model.lists.families.on('add', function () {
      self.render();
    });*/

    // var FamiliesView =  new this.views.FamiliesView({list: this.lists.families});
    // var StocksView = new this.views.StocksView({list: this.lists.stocks});

  };

  GameInitializeView.prototype.render = function() {
    this.$el = $(this.template({
      families: this.model.lists.families.objects,
      stocks: this.model.lists.stocks.objects
    }));
    this.initialize();

    return this.$el;
  };


  ////////////////////////
  //  Game Control View
  ////////////////////////

  var GameControlView = function (options) {

    this.options = $.extend({
      $templateElement: $('#game-control-template')
    }, options);

    var templateSource = this.options.$templateElement.html();
    this.template = Handlebars.compile(templateSource);
    this.model = options.model;
    this.$el = null;

  };

  GameControlView.prototype.initialize = function() {
    var self = this;
    // Event listeners

    this.$el.find('#next-month').on('click', function() {
      self.model.emit('nextMonth');
    });

    this.$el.find('#show-init-view').on('click', function() {
      self.model.emit('showGameInitializeView');
    });

    this.$el.find('#show-family-ranking-view').on('click', function() {
      self.model.emit('showFamilyRankingView');
    });

    this.$el.find('#show-family-detail-list-view').on('click', function() {
      self.model.emit('showFamilyDetailListView');
    });

    this.$el.find('#show-stock-chart-view').on('click', function() {
      self.model.emit('showStockChartView');
    });

  };

  GameControlView.prototype.render = function() {
    this.$el = $(this.template({currentMonth: this.model.getCurrentMonth()}));
    this.initialize();

    return this.$el;
  };


  ////////////////////////
  //  Family
  ////////////////////////


  var Family = function(options) {
    this.options = $.extend({
      id: _.uniqueId(),
      name: 'Name',
      stocks: [],
      cash: 5000,
      lastIncome: 0,
      tagName: 'li'
    }, options);

    this.id = this.options.id;
    this.name = this.options.name;
    this.stocks = this.options.stocks;
    this.cash = this.options.cash;
    this.lastIncome = this.options.lastIncome;
    this.tagName = this.options.tagName;
  };

  // add emitter events to Family class
  Emitter(Family.prototype);

  Family.prototype.getAsset = function() {
    var asset = 0,
        self = this;

    asset += this.cash;

    this.stocks.forEach(function(obj){
      asset += obj.stock.getShareValue(self);
    });

    asset = Math.round(asset * 20) / 20
    return asset;
  };

  Family.prototype.buyStockShares = function(data) {
    var status = data.stock.buy(data.amount, this),
        stockPos = this.getStockPos(data.stock);

    if(status.success) {

      if(stockPos === -1) {
        this.stocks.push({
          amount: 0,
          stock: data.stock
        });

        stockPos = this.stocks.length - 1;
      }

      this.stocks[stockPos].amount += data.amount;
    }

    return status;
  };

  Family.prototype.sellStockShares = function(data) {
    var status = data.stock.sell(data.amount, this),
        stockPos = this.getStockPos(data.stock);

    if(status.success) {
      this.stocks[stockPos].amount -= data.amount;

      if(this.stocks[stockPos].amount == 0) {
        this.stocks.splice(stockPos, 1);
      }
    }

    return status;
  };

  Family.prototype.getStockPos = function(stock) {
    var pos = -1;

    this.stocks.forEach(function(obj, i){
      if(obj.stock === stock){
        pos = i;
        return;
      }
    });
  
    return pos;
  };

  Family.prototype.resetLastIncome = function() {
    this.lastIncome = 0;
  };

  Family.prototype.render = function() {
    return $('<'+this.tagName+' class="family">'+this.name+'</li>');
  };


  var FamilyListView = function(options){
    var self = this;

    this.list = options.list;
    this.$el = $('#family-list');

    // render the view when the list is reset or has added a new object
    this.list.on('reset', function(){
      self.render();
    });

    this.list.on('add', function(){
      self.render();
    });
  };

  // inherit from ListView class.
  FamilyListView.prototype = Object.create(ListView.prototype);

  var FamilyRankingView = function (options) {
    this.options = $.extend({
      $templateElement: $('#family-ranking-template')
    }, options);

    var templateSource = this.options.$templateElement.html();
    this.template = Handlebars.compile(templateSource);
    this.list = options.list;
    this.$el = null;
  };

  FamilyRankingView.prototype.render = function() {
    var list = this.list.orderByMethod('getAsset');
    this.$el = $(this.template({families: list}));

    return this.$el;
  };


  var FamilyDetailListView = function (options) {
    this.options = $.extend({
      $templateElement: $('#family-detail-list-template')
    }, options);

    var templateSource = this.options.$templateElement.html();
    this.template = Handlebars.compile(templateSource);
    this.list = options.list;
    this.stocks = options.stocks;
    this.$el = null;
  };

  FamilyDetailListView.prototype.initialize = function() {
    var familyDetailView,
        self = this;

    this.list.objects.forEach(function(family){
      familyDetailView = new FamilyDetailView({model: family, stocks: self.stocks});
      self.$el.append(familyDetailView.render());
    });
  };

  FamilyDetailListView.prototype.render = function() {
    this.$el = $(this.template({families: this.list.objects, stocks: this.stocks.objects}));

    this.initialize();

    return this.$el;
  };


  var FamilyDetailView = function (options) {
    this.options = $.extend({
      $templateElement: $('#family-detail-template')
    }, options);

    var templateSource = this.options.$templateElement.html();
    this.template = Handlebars.compile(templateSource);
    this.model = this.options.model;
    this.stocks = this.options.stocks;
    this.$el = null;
  };

  FamilyDetailView.prototype.initialize = function() {
    var self = this,
        pieLabels,
        pieSeries,
        pieShareAmounts,
        $pieLegend;

    // open buy dialog
    this.$el.on('click', '.buy', function(){
      self.$el.find('.buy-modal').foundation('reveal', 'open');
    });

    // open sell dialog
    this.$el.on('click', '.sell', function(){
      self.$el.find('.sell-modal').foundation('reveal', 'open');
    });

    // open salary dialog
    this.$el.on('click', '.salary', function(){
      self.$el.find('.salary-modal').foundation('reveal', 'open');
    });

    // submit buy form
    this.$el.find('.buy-form').on('submit', function(e){
      e.preventDefault();

      self.buyStockShares({
        amount: parseInt(e.target.amount.value),
        stockId: e.target.stock.value,
        el: e.target
      });
    });

    // submit buy form
    this.$el.find('.sell-form').on('submit', function(e){
      e.preventDefault();

      self.sellStockShares({
        amount: parseInt(e.target.amount.value),
        stockId: e.target.stock.value,
        el: e.target
      });
    });

    // submit salary form
    this.$el.find('.salary-form').on('submit', function(e){
      e.preventDefault();

      self.paySalary({
        salary: parseInt(e.target.salary.value),
        el: e.target
      });
    });

    // Pie Chart

    pieLabels = this.model.stocks.map(function(obj){
      return obj.stock.name;
    });

    pieLabels.push('Cash');

    pieSeries = this.model.stocks.map(function(obj){
      return obj.stock.getShareValue(self.model);
    });

    pieSeries.push(this.model.cash);

    pieShareAmounts = this.model.stocks.map(function(obj){
      return obj.amount;
    });

    new Chartist.Pie(this.$el.find('.pie-chart')[0], {
      labels: pieLabels,
      series: pieSeries
    }, {
      chartPadding: 30,
      labelOffset: 50,
      labelDirection: 'explode'
    });

    // Pie Labels
    $pieLegend = this.$el.find('.ct-legend');

    $.each(pieLabels, function(i, val) {
      var listItem = $('<li />')
          .addClass('ct-series-' + i)
          .html(val + ' ' + pieSeries[i] + ' CHF' + ' ' + pieShareAmounts[i] + ' Shares')
          .appendTo($pieLegend);
    });

  };

  FamilyDetailView.prototype.buyStockShares = function(data) {
    var status,
        alertType;

    data.stock = this.stocks.getObjectById(data.stockId);

    status = this.model.buyStockShares(data);
    alertType = status.success ? 'success' : 'alert';

    utils.showAlert($(data.el), status.message, alertType);
  };

  FamilyDetailView.prototype.sellStockShares = function(data) {
    var status,
        alertType;

    data.stock = this.stocks.getObjectById(data.stockId);

    status = this.model.sellStockShares(data);
    alertType = status.success ? 'success' : 'alert';

    utils.showAlert($(data.el), status.message, alertType);
  };

  FamilyDetailView.prototype.paySalary = function(data) {
    var salary = parseInt(data.salary, 10);

    this.model.cash += salary;
    this.model.lastIncome += salary;

    // add emitter events to Family class
    this.model.emit('update');

    utils.showAlert($(data.el), 'The salary ('+ salary +' CHF) was payed successfully', 'success');
  };

  FamilyDetailView.prototype.render = function() {
    this.$el = $(this.template({
      family: this.model,
      asset: this.model.getAsset(),
      stocks: this.stocks.objects
    }));
    this.initialize();
    return this.$el;
  };




  ////////////////////////
  //  Stock
  ////////////////////////

  var Stock = function(options){
    var startPrice = Math.random() * 100;
    this.options = $.extend({
      id: _.uniqueId(),
      name: '',
      shareAmount: 100,
      price: startPrice,
      stakeholders: [],
      progression: [startPrice],
      shareFlow: 0,
      tagName: 'li'
    }, options);

    this.id = this.options.id;
    this.name = this.options.name;
    this.shareAmount = this.options.shareAmount;
    this.price = this.options.price;
    this.stakeholders = this.options.stakeholders;
    this.progression = this.options.progression;
    this.shareFlow = this.options.shareFlow;
    this.tagName = this.options.tagName;
  };

  // add emitter events to Stock class
  Emitter(Stock.prototype);

  Stock.prototype.buy = function(amount, family) {
    var familyPos = -1,
        hasEnoughCash = false, hasEnoughShares = false,
        status = {
          success: true,
          message: family.name + ' bought succesfully '+amount+' shares of '+this.name
        };

    // enough shares?
    if(amount <=  this.shareAmount - this.getAllSoldShares()){
      hasEnoughShares = true;
    }
    // enough cash?
    if(this.checkAbility(amount, family)){
      hasEnoughCash = true;
    }

    if(hasEnoughCash && hasEnoughShares){
        // do purchase
        family.cash -= amount * this.price;
        // add shares to family
        familyPos = this.getFamilyPos(family);
        if(familyPos === -1){
          this.stakeholders.push({family: family, amount: 0});
          familyPos = this.stakeholders.length - 1;
        }
        this.stakeholders[familyPos].amount += amount;
        this.shareFlow += amount;
        console.log('Purchase was successful.\n');
    } else {
      status.success = false;
      status.message = 'EnoughCash: ' + hasEnoughCash + ' ' + 'EnoughShares: ' + hasEnoughShares;
    }

    return status;
  };

  Stock.prototype.sell = function(amount, family) {
    var hasEntry = false,
        hasEnoughShares = false,
        status = {
          success: true,
          message: family.name + ' sold succesfully '+amount+' shares of '+this.name
        },
        familyPos = this.getFamilyPos(family);

    if(familyPos >= 0){
      hasEntry = true;
    }
    // enough shares to sell
    if(amount <= this.getSoldSharesByFamily(family)){
      hasEnoughShares = true;
    }

    if(hasEntry && hasEnoughShares){
      // sell all requested shares
      this.stakeholders[familyPos].amount -= amount;
      family.cash += amount * this.price;
      this.shareFlow -= amount;
      console.log('Sale was successful.' + '\n');
    } else {
      status.success = false;
      status.message = 'Not enough shares to sell.';
    }

    return status;
  };

  Stock.prototype.calcCurrentSharePrice = function() {
    // get the three different factors
    var random = this.calcRandomFactor(),
        game = this.calcGameFactor(200, 800),
        flow = this.calcShareFlowFactor(),
        // calc average over the three factors
        shareFactor = (random + game  + flow) / 3;  

    console.log('Random: ' + random);
    console.log('Game: ' + game);
    console.log('FlowFactor: ' + flow);

    console.log(shareFactor);

    // calc new stock price
    this.price += this.price * (shareFactor / 100);
    this.price = Math.round(this.price);
    // add new price to progression
    this.progression.push(this.price);
    // reset shareFlow
    this.shareFlow = 0;
  };

  Stock.prototype.calcRandomFactor = function() {
    var randomFactor = Math.random() * 20;
    randomFactor = Math.round(randomFactor) - 10;
    return randomFactor;
  };

  Stock.prototype.calcGameFactor = function(minWin, maxWin) {
    var allSoldShares = this.getAllSoldShares(),
        zeroFactor = ((maxWin + minWin) / 2 * allSoldShares) - (minWin * allSoldShares),
        gameFactor = 0;

    this.stakeholders.forEach(function(el){
      gameFactor += el.family.lastIncome * el.amount;
    });

    gameFactor = gameFactor - minWin * allSoldShares;

    gameFactor = Math.round((gameFactor * 10 / zeroFactor) - 10);

    if(isNaN(gameFactor)) {
      gameFactor = 0;
    }

    return gameFactor;
  };

  Stock.prototype.calcShareFlowFactor = function() {
    return Math.round(this.shareFlow * 10 / this.shareAmount);
  }; 

  Stock.prototype.getShareValue = function(family) {
    return this.getSoldSharesByFamily(family) * this.price;
  };  

  /*
   * return sold shares for one family.
  */
  Stock.prototype.getSoldSharesByFamily = function(family) {
    var familyPos = this.getFamilyPos(family);
    //return 10;
    if(familyPos >= 0){
      return this.stakeholders[familyPos].amount;
    } else {
      return 0;
    }
    
  };

  Stock.prototype.checkAbility = function(amount, family) {
    if(family.cash >= amount * this.price){
      return true;
    } else {
      return false;
    }
    // body...
  };

  Stock.prototype.getFamilyPos = function(family) {
    var pos = -1;
    this.stakeholders.forEach(function(el, i){
      if(el.family === family){
        pos = i;
        return;
      }
    });
    return pos;
    // body...
  };

  /*
   * return all sold shares
   * 
   * 
  */

  Stock.prototype.getAllSoldShares = function() {
    var soldShares = 0;

    this.stakeholders.forEach(function(shares){
      soldShares += shares.amount;
    });
    
    return soldShares;
  };


  Stock.prototype.render = function() {
    return $('<'+this.tagName+' class="stock">'+this.name+'</li>');
  };


  ////////////////////////
  //  Stock List View
  ////////////////////////


  var StockListView = function(options){
    var self = this;

    this.list = options.list;
    this.$el = $('#stock-list');

    // render the view when the list is reset or has added a new object
    this.list.on('reset', function(){
      self.render();
    });

    this.list.on('add', function(){
      self.render();
    });
  };

  // inherit from ListView class.
  StockListView.prototype = Object.create(ListView.prototype);


  var StockChartView = function (options) {
    this.options = $.extend({
      $templateElement: $('#stock-chart-template')
    }, options);

    var templateSource = this.options.$templateElement.html();
    this.template = Handlebars.compile(templateSource);
    this.list = this.options.list;
    this.months = this.options.months;
    this.$el = null;
  };

  StockChartView.prototype.initialize = function() {
    // event listeners and stuff


    var lineSeries = this.list.objects.map(function(o){
          return o.progression;
        }),
        data = {
          // A labels array that can contain any sort of values
          labels: this.months,
          // Our series array that contains series objects or in this case series data arrays
          series: lineSeries
        },
        // line chart legend
        $lineLegend = this.$el.find('.ct-legend');

    // In the global name space Chartist we call the Line function to initialize a line chart. As a first parameter we pass in a selector where we would like to get our chart created. Second parameter is the actual data object and as a third parameter we pass in our options
    new Chartist.Line(this.$el.find('.line-chart')[0], data);


    $.each(this.list.objects, function(i, object) {
      var listItem = $('<li />')
          .addClass('ct-series-' + i)
          .html(object.name + ' ' + lineSeries[i])
          .appendTo($lineLegend);
    });
  };


  StockChartView.prototype.render = function() {
    this.$el = $(this.template());

    this.initialize();

    return this.$el;
  };



  // initialize game
  var game = new Game();



  window.game = game;
  window.utils = utils;

})(window);