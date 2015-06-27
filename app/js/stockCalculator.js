(function(){

var Stock = function(options){
	var self = this;
	this.name = options.name;
	this.shareAmount = options.shareAmount;
	this.price = options.price;
	this.stakeHolders = [];
	this.progression = [];
	this.shareFlow = undefined;


	// this.tmp = 0
	// arr.forEach(function(el, i){
 //  		self.tmp += el;
	// });
}

Stock.prototype.checkAbility = function(amount, family) {
	if(family.cash >= amount * this.price){
		return true;
	} else {
		return false;
	}
	// body...
};

Stock.prototype.getSoldShares = function() {
	var soldShares = 0;

	this.stakeHolders.forEach(function(shares, i){
		soldShares += shares.amount;
	});
	return soldShares;
	// body...
};

Stock.prototype.buy = function(amount, family) {
	var familyPos = -1;
	// enough shares?
	console.log("D1:" + this.getSoldShares() +  "\n");
	console.log("D2:" + family.cash +  "\n");
	if(amount <=  this.shareAmount - this.getSoldShares()){
		// enough cash?
		if(this.checkAbility(amount, family)){
			// do purchase

			// charge shares
			family.cash -= amount * this.price;
			// add shares to family
			familyPos = this.stakeHolders.indexOf(family);
			if(familyPos === -1){
				this.stakeHolders.push({family: family, amount: 0});
				familyPos = this.stakeHolders.length - 1;
			}
			this.stakeHolders[familyPos].amount += amount;
		} else {
			console.error("not enough cash");
		}
	} else {
		console.error("all shares sold out");
	}
	console.log("D3:" + this.stakeHolders[familyPos].amount + "\n");
}

Stock.prototype.sell = function() {
	// body...
};

Stock.prototype.calcStockPrice = function(first_argument) {
	// body...
};

Stock.prototype.getShareAmount = function(first_argument) {
	// body...
};

var family = {
	name: "Stutz",
	cash: 1000,
	lastIncome: 4000,
	stocks: []
}

var family1 = {
	name: "Dan",
	cash: 100000,
	lastIncome: 4000,
	stocks: []
}

var google = new Stock({
	name: "Google",
	shareAmount: 100,
	price: 200,
});

google.buy(5, family);
// google.buy(1, family);
// google.buy(19, family1);




}());