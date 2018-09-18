// F12 goes to the definition of a certain function
// right clict and you can change all occurences
// just be at the beginning of a line and press ctlr+c and than on new line ctrl+v -> nemusis oznacovat cele
// to comment out a block of code do ctrl+shift+slash


let mr = 0.01;

class Vehicle {
    constructor(x, y, dna) {
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(0, -2);
        this.position = createVector(x, y);
        this.r = 4; // size of vehicle
        this.maxspeed = 8; //limitations of steering
        this.maxforce = 0.2;
        this.health = 1;

        // If I don't pass the argument dna  -> make dna randomly 
        this.dna = [];
        if (dna == undefined) {
            // food attraction (weight)
            this.dna[0] = random(-2, 2);
            // poison attraction (weight)
            this.dna[1] = random(-2, 2);
            // food perception
            this.dna[2] = random(0, 100);
            // poison perception
            this.dna[3] = random(0, 100);
        } else {
            // mutation
            this.dna[0] = dna[0];
            if (random(1) < mr) {
                this.dna[0] += random(-0.1, 0.1);
            }
            this.dna[1] = dna[1];
            if (random(1) < mr) {
                this.dna[1] += random(-0.1, 0.1);
            }
            this.dna[2] = dna[2];
            if (random(1) < mr) {
                this.dna[0] += random(-10, 10);
            }
            this.dna[3] = dna[3];
            if (random(1) < mr) {
                this.dna[0] += random(-10, 10);
            }
        }
    }

    // Method to update location
    update() {
        // every frame agent loses a little bit of health
        this.health -= 0.005;
        // Update velocity
        this.velocity.add(this.acceleration);
        // Limit speed
        this.velocity.limit(this.maxspeed);
        this.position.add(this.velocity);
        // Reset accelerationelertion to 0 each cycle
        this.acceleration.mult(0);
    }

    applyForce(force) {
        // We could add mass here if we want A = F / M
        this.acceleration.add(force);
    }

    // A method that calculates a steering force towards a target
    // STEER = DESIRED MINUS VELOCITY
    seek(target) {

        let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target

        // Scale to maximum speed
        desired.setMag(this.maxspeed);

        // Steering = Desired minus velocity
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce); // Limit to maximum steering force

        return steer;

    }
    // if less than 0 returns true otherwise false
    dead() {
        return (this.health < 0);
    }

    display() {
        // Draw a triangle rotated in the direction of velocity
        // heading() calculates the angle of rotation for this vector 
        let theta = this.velocity.heading() + PI / 2;

        // jeden extrem je zelena druhy je cervena a col bere interpolaci mezi nimi
        // na zaklade toho kolik maji health
        let gr = color(0, 255, 0);
        let rd = color(255, 0, 0);
        var col = lerpColor(rd, gr, this.health);

        fill(col);
        stroke(col);
        strokeWeight(1);
        push();
        translate(this.position.x, this.position.y);
        rotate(theta);
        beginShape();
        vertex(0, -this.r * 2);
        vertex(-this.r, this.r * 2);
        vertex(this.r, this.r * 2);
        endShape(CLOSE);
        // displayes a line from front of the vehicle

        strokeWeight(2);
        // visualizing food attraction
        noFill();
        stroke(0, 255, 0);
        line(0, 0, 0, -this.dna[0] * 25);
        ellipse(0, 0, this.dna[2]);
        // visualizing poison attraction
        stroke(255, 0, 0);
        line(0, 0, 0, -this.dna[1] * 25);
        ellipse(0, 0, this.dna[3]);
        pop();
    }
    // mezi vsema jidlama nejde to nejblizsi a to seekuje
    eat(list, nutrition, perception) {
        let record = Infinity;
        let closest = null;
        for (let i = list.length - 1; i >= 0; i--) {
            let d = this.position.dist(list[i]); // distance me a jidla
            // if less than record and perception -> it counts as something that it can see
            // anytime it is in that radius it etats the food or poison
            if (d < this.maxspeed) {
                list.splice(i, 1)
                this.health += nutrition;
            } else {
                if (d < record && d < perception) {
                    record = d;
                    closest = list[i];
                }
            }
        }
        // kdyz jsem bliz jak 5 pixelu tak snim jidlo, splice je funkce na odstraneni prvku
        // z arraye, chce index a kolik jich chci odstranit - v nasem pripade 1
        // bud to ho jim a zmizi nebo ho seekuju kdyz ho vidim

        if (closest != null) {
            return this.seek(closest);
        }
        return createVector(0, 0);
    }
    // how is vehicle attracted to food and how to poison?
    behaviours(good, bad) {
        // food has positive nutrition, poison bad nutrition
        // kdyz jsem od jidla tak eat() mi returne to koho mam seekovat
        // do prvniho jde perception jidla do druheho perception poisnu 
        // idealne chci evolvnou do toho, ze mam zelenou line a cervenou v opacnym smeru
        // a vidim zeleny co nejdal a cerveny co nejmin (?)
        let steerG = this.eat(good, 0.2, this.dna[2]);
        let steerB = this.eat(bad, -0.5, this.dna[3]);
        // ja chci steerovat poison v opacnym smeru a jidlo v pozitivnim smeru
        // to chci idealne naucit evolucne
        steerG.mult(this.dna[0]);
        steerB.mult(this.dna[1]);

        this.applyForce(steerG);
        this.applyForce(steerB);
    }
    // when vehicle is close to edge it steers it towards the centre to stay on canvas
    boundaries() {
        let d = 25; // distance from the edge
        let desired = null;

        if (this.position.x < d) {
            desired = createVector(this.maxspeed, this.velocity.y);
        } else if (this.position.x > width - d) {
            desired = createVector(-this.maxspeed, this.velocity.y);
        }

        if (this.position.y < d) {
            desired = createVector(this.velocity.x, this.maxspeed);
        } else if (this.position.y > height - d) {
            desired = createVector(this.velocity.x, -this.maxspeed);
        }

        if (desired !== null) {
            desired.normalize();
            desired.mult(this.maxspeed);
            let steer = p5.Vector.sub(desired, this.velocity);
            steer.limit(this.maxforce);
            this.applyForce(steer);
        }
    }
    // ty co prezivaji dlouho maji vetsi sanci ze se rozmnozi a i trochu zmutuji -> trochu jiny
    // pristup k  evolucnim alg.
    clone() {
        if (random(1) < 0.005) {
            return new Vehicle(this.position.x, this.position.y, this.dna);
        } else {
            return null;
        }
    }
}