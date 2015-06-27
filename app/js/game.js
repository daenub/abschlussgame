'use strict';

(function(window){
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  ////////////////////////
  //  List View
  ////////////////////////

  var List = function(options) {
    this.objects = [];
    this.model = options.model;
    this.emit('reset');
  };

  // add emitter events to List class
  Emitter(List.prototype);

  List.prototype.create = function(data) {
    this.objects.push(new this.model(data));
    this.emit('add');
  };

  ////////////////////////
  //  List View
  ////////////////////////

  var ListView = function() {

  };

  ListView.prototype.render = function() {
    var self = this;

    this.$el.html('');

    this.list.objects.forEach(function(object, i){
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
        model: Family
      }),

      stocks: new List({
        model: Stock
      }),

    };

    this.views = {
      FamiliesView: FamilyListView,
      StocksView: StockListView,
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
    })

    this.on('nextMonth', function(e) {
      self.nextMonth();
    });

    this.on('showGameInitializeView', function () {
      self.showGameInitializeView();
    })

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
    var FamiliesView =  new this.views.FamiliesView({list: this.lists.families});
    var StocksView = new this.views.StocksView({list: this.lists.stocks});
  };

  
  Game.prototype.nextMonth = function() {
    if (this.currentMonth + 1 === this.maxMonth) {
      this.end();
    } else {
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
    });

    this.$el.on('submit', '#add-stock', function(e){
      e.preventDefault();

      self.model.addStock({
        name: e.target.name.value
      });

      e.target.name.value = '';
    });

  };

  GameInitializeView.prototype.render = function() {
    this.$el = $(this.template());
    this.initialize();

    return this.$el;
  };

  // ////////////////////////
  // //  Game  View
  // ////////////////////////

  // var GameInitializeView = function() {
  //   var templateSource = $('#game-initialize-template').html();
  //   this.template = Handlebars.compile(templateSource);
  // };

  // GameInitializeView.prototype.render = function() {
  //   this.template({})
  // };

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
      cash: 0,
      monthlyIncome: 4000,
      tagName: 'li'
    }, options);

    this.id = this.options.id;
    this.name = this.options.name;
    this.stocks = this.options.stocks;
    this.cash = this.options.cash;
    this.monthlyIncome = this.options.monthlyIncome;
    this.tagName = this.options.tagName;

  };

  Family.prototype.render = function() {
    return $('<'+this.tagName+' class="family">'+this.name+'</li>');
  };


  var FamilyListView = function(options){
    var self = this;

    this.list = options.list
    this.$el = $("#family-list");

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




  ////////////////////////
  //  Stock
  ////////////////////////


  var Stock = function(options) {
  
    this.options = $.extend({
      id: _.uniqueId(),
      name: '',
      shareAmount: 100,
      pricePerShare: 1,
      stakeholders: [],
      tagName: 'li'
    }, options);

    this.id = this.options.id;
    this.name = this.options.name;
    this.shareAmount = this.options.shareAmount;
    this.pricePerShare = this.options.pricePerShare;
    this.stakeholders = this.options.stakeholders;
    this.tagName = this.options.tagName;
    
  };

  Stock.prototype.render = function() {
    return $('<'+this.tagName+' class="stock">'+this.name+'</li>');
  };


  ////////////////////////
  //  Stock List View
  ////////////////////////


  var StockListView = function(options){
    var self = this;

    this.list = options.list
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



  // initialize game
  var game = new Game();



  window.game = game;

})(window);