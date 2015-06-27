(function(){

var Stock = function(options){
	var self = this;
	this.name = options.name;
	this.shareAmount = options.shareAmount;
	// TODO
	this.price = options.price;
	this.stakeHolders = [];
	this.progression = [this.price];
	this.shareFlow = 0;


	// this.tmp = 0
	// arr.forEach(function(el, i){
 //  		self.tmp += el;
	// });
}

Stock.prototype.buy = function(amount, family) {
	var familyPos = -1;
	var hasEnoughCash = false, hasEnoughShares = false;

	console.log("D1:" + this.getAllSoldShares() +  "\n");
	console.log("D2:" + family.cash +  "\n");
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
				this.stakeHolders.push({family: family, amount: 0});
				familyPos = this.stakeHolders.length - 1;
			}
			this.stakeHolders[familyPos].amount += amount;
			this.shareFlow += amount;
			console.log("Purchase was successful.\n");
	} else {
		console.error("EnoughCash: " + hasEnoughCash + " " + "EnoughShares: " + hasEnoughShares + "\n");
	}
}

Stock.prototype.sell = function(amount, family) {
	hasEntry = false;
	hasEnoughShares = false;

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
		this.stakeHolders[familyPos].amount -= amount;
		family.cash += amount * this.price;
		console.log("Sale was successful.\n");
	} else {
		console.error("Not enough shares to sell.\n");
	}

	// body...
};

Stock.prototype.calcCurrentSharePrice = function() {
	// get the three different factors and calc the average 
	shareFactor = (this.calcRandomFactor() + this.calcGameFactor(200, 600) + this.calcShareFlowFactor()) / 3;
	console.log(shareFactor);
	// calc new stock price
	this.price += this.price * (shareFactor / 80);
	this.price = Math.round(this.price);
	// add new price to progression
	this.progression.push(this.price);
	// reset shareFlow
	this.shareFlow = 0;
};

Stock.prototype.calcRandomFactor = function() {
	var randomFactor = Math.random() * 20;
	randomFactor = Math.floor(randomFactor) - 10;
	return randomFactor;
};

Stock.prototype.calcGameFactor = function(minWin, maxWin) {
	var allSoldShares = this.getAllSoldShares();
	var zeroFactor = ((maxWin + minWin) / 2 * allSoldShares) - (minWin * allSoldShares);

	var gameFactor = 0;
	this.stakeHolders.forEach(function(el, i){
		gameFactor += el.family.lastIncome * el.amount;
	});
	gameFactor = gameFactor - minWin * allSoldShares;
	return (gameFactor * 10 / zeroFactor) - 10;
};

Stock.prototype.calcShareFlowFactor = function() {
	return this.shareFlow * 10 / this.shareAmount;
	// body...
};

Stock.prototype.getShareValue = function(family) {
	return this.getSoldSharesByFamily(family) * this.price;
};

/*
 * return sold shares for one family.
*/
Stock.prototype.getSoldSharesByFamily = function(family) {
	familyPos = this.getFamilyPos(family);
	//return 10;
	if(familyPos >= 0){
		return this.stakeHolders[familyPos].amount;
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
	this.stakeHolders.forEach(function(el, i){
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

	this.stakeHolders.forEach(function(shares, i){
		soldShares += shares.amount;
	});
	return soldShares;
	// body...
};


var stutz = {
	name: "Stutz",
	cash: 100000000000000,
	lastIncome: 200,
	stocks: []
}

var bueschlen = {
	name: "Bueschlen",
	cash: 100000,
	lastIncome: 400,
	stocks: []
}

var kleiner = {
	name: "Kleiner",
	cash: 100000,
	lastIncome: 600,
	stocks: []
}

var hitz = {
	name: "Hitz",
	cash: 100000,
	lastIncome: 800,
	stocks: []
}

var google = new Stock({
	name: "Google",
	shareAmount: 100,
	price: 200,
});

google.buy(1, hitz);
google.buy(3, bueschlen);
google.buy(10, stutz);
google.buy(5, kleiner);

google.calcCurrentSharePrice()
console.log("New Price: " + google.progression);

stutz.lastIncome = 200;
bueschlen.lastIncome = 600;
kleiner.lastIncome = 400;
hitz.lastIncome = 800;

google.buy(5, hitz);
google.buy(2, bueschlen);
google.buy(18, stutz);
google.buy(2, kleiner);

google.calcCurrentSharePrice()
console.log("New Price: " + google.progression);

stutz.lastIncome = 400;
bueschlen.lastIncome = 800;
kleiner.lastIncome = 200;
hitz.lastIncome = 600;

google.sell(4, hitz);
google.sell(4, bueschlen);
google.sell(24, stutz);
google.buy(20, kleiner);

google.calcCurrentSharePrice()
console.log("New Price: " + google.progression);

stutz.lastIncome = 200;
bueschlen.lastIncome = 400;
kleiner.lastIncome = 600;
hitz.lastIncome = 800;

google.sell(2, hitz);
google.buy(8, bueschlen);
google.buy(20, stutz);
google.sell(10, kleiner);

google.calcCurrentSharePrice()


}());