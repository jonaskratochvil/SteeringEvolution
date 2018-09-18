// We have a world (canvas) and inside are green dots representing food and red dots representing
// poison. In world we have agets (wehicles) that move around and in order so survive they
// need to eat food otherwise they will over time die, they have health property that goes
// up if they eat the food and down if they don't or eat poison
// steering force = desired velocity - current velocity (much line error in NN)


let vehicles = [];
let food = [];
let poison = [];

function setup() {
	createCanvas(640, 360);
	// create 10 vehicles at random locations
	for (let i = 0; i < 10; i++) {
		let x = random(width);
		let y = random(height);
		vehicles[i] = new Vehicle(x, y);

	}
	// create food at random locations
	for (let i = 0; i < 50; i++) {
		let x = random(width);
		let y = random(height);
		food.push(createVector(x, y));
	}
	// create poison at random locations
	for (let i = 0; i < 10; i++) {
		let x = random(width);
		let y = random(height);
		poison.push(createVector(x, y));
	}
}

function draw() {
	background(51);
	// Every frame there is a 5% prob of new food being diplayed
	if (random(1) < 0.05) {
		let x = random(width);
		let y = random(height);
		food.push(createVector(x, y));
	}
	// 1% chance of adding new piece of poison
	if (random(1) < 0.01) {
		let x = random(width);
		let y = random(height);
		poison.push(createVector(x, y));
	}

	//display the food
	for (let j = 0; j < food.length; j++) {
		fill(0, 255, 0);
		noStroke();
		ellipse(food[j].x, food[j].y, 8, 8);
	}

	for (let j = 0; j < poison.length; j++) {
		fill(255, 0, 0);
		noStroke();
		ellipse(poison[j].x, poison[j].y, 8, 8);
	}
	// I have issue as when I delate things and array will shift and stuff so solution is to
	// iterate backwards over it. 
	for (let i = vehicles.length - 1; i >= 0; i--) {
		// Call the appropriate steering behaviors for our agents
		vehicles[i].boundaries();
		vehicles[i].behaviours(food, poison);
		vehicles[i].eat(food);
		//v.seek(food);
		vehicles[i].update();
		vehicles[i].display();

		// mam 1% sanci na clone ten eventualne pridam do arraye vehiclu 
		let newVehicle = vehicles[i].clone();
		if (newVehicle != null) {
			vehicles.push(newVehicle);
		}

		//If vehicle's health is less than 0 delate it from the array.
		if (vehicles[i].dead()) {

			// if it dies it creates a new piece of food on that place
			let x = vehicles[i].position.x;
			let y = vehicles[i].position.y;

			food.push(createVector(x, y));
			vehicles.splice(i, 1);
		}
	}

}