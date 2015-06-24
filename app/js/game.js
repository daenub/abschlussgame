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
    }, options);

    this.$el = this.options.$el;
    this.currentMonth = this.options.currentMonth;

    this.lists = {
      families: new List({
        model: Family
      }),

      stocks: new List({
        model: Stock
      }),

    };

    this.views = {
      FamiliesView: new FamilyListView({list: this.lists.families}),
      StocksView: new StockListView({list: this.lists.stocks})
    };


    this.$el.on('submit', '#add-family', function(e){
      e.preventDefault();

      self.addFamily({
        name: e.target.name.value
      });

      e.target.name.value = '';
    });

    this.$el.on('submit', '#add-stock', function(e){
      e.preventDefault();

      self.addStock({
        name: e.target.name.value
      });

      e.target.name.value = '';
    });

    this.on('reset', function(e) {
      console.log('reset');
      console.log(e.data);
    });

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

  Game.prototype.triggerEvent = function() {
    this.emit('reset', {data: "data"});
  };


  ////////////////////////
  //  Game Initialize View
  ////////////////////////

  // GameInitializeView = function() {
  //   var templateSource = $('#game-initialize-template').html();
  //   this.template = Handlebars.compile(templateSource);
  // };

  // GameInitializeView.prototype.render = function() {
  //   this.template({})
  // };

  // ////////////////////////
  // //  Game  View
  // ////////////////////////

  // GameInitializeView = function() {
  //   var templateSource = $('#game-initialize-template').html();
  //   this.template = Handlebars.compile(templateSource);
  // };

  // GameInitializeView.prototype.render = function() {
  //   this.template({})
  // };



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
    this.$el = $("#familyList");

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
    this.$el = $('#stockList');

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