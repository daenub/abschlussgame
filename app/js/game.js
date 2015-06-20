'use strict';

(function(window){
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  var Game = function (options) {
    var self = this;

    this.options = $.extend({
      $el: $('#game'),
      currentMonth: 0,
      families: [],
      stocks: [],
      views: [FamilyListView]
    }, options);

    this.$el = this.options.$el;
    this.currentMonth = this.options.currentMonth;
    this.families = this.options.families;
    this.stocks = this.options.stocks;


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

  };

  Game.prototype.addFamily = function(data) {
    this.families.push(new Family({
      name: data.name
    }));
  };

  Game.prototype.addStock = function(data) {
    this.stocks.push(new Family({
      name: data.name
    }));
  };

  Game.prototype.showFamilyListView = function() {
    // body...
  };


  var FamilyListView = {
    $el: null,
    tagName: 'ul',
    objectList: null,
    render: function(){
      var self = this;

      if(this.$el === null) {
        this.$el = $('<'+this.tagName+'>');
      }

      this.objectList.forEach(function(){
        self.$el.append(this.render())
      });
    }
  };



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
    return $('<'+this.tagName+' class="family">'+this.name+'</li>')
  };

  var Stock = function(options) {
  
    this.options = $.extend({
      id: _.uniqueId(),
      name: '',
      shareAmount: 100,
      pricePerShare: 1,
      stakeholders: []
    }, options);

    this.id = this.options.id;
    this.name = this.options.name;
    this.shareAmount = this.options.shareAmount;
    this.pricePerShare = this.options.pricePerShare;
    this.stakeholders = this.options.stakeholders;
    
  };

  var game = new Game();


  window.game = game;

})(window);