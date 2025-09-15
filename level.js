let wall_textures = [];

class Level {
    static textures = [];
    static scale = 2;
    static goals_string = "0123456789";
    constructor(level_str) {
        let rows = level_str.trim().split("\n");
        // load level map
        this.level = new Array();
        for (let r of rows) {
            this.level.push(Array.from(r));
        }
        this.level.reverse();
        //
        this.width = this.level[0].length;
        this.height = this.level.length;
        this.x_offset = Math.round(this.width / 2);
        this.y_offset = Math.round(this.height / 2);
        this.sides = Wall._getSides(vec2(0, 0), vec2(this.width * Level.scale, this.height * Level.scale));
        //
        this.goals = new Array(10);
        this.goal_i = 0;
        this.cat_positions = [];
        this.mouse_position;
        this.generateWalls();
        this.createCharacters();
    }
    getTile(x, y) {
        if (x >= this.width || y >= this.height || x < 0 || y < 0) {
            return "+"
        }
        // x = x >= this.width ? this.width - 1 : x;
        // x = x < 0 ? 0 : x;
        // y = y >= this.height ? this.height - 1 : y;
        // y = y < 0 ? 0 : y;
        if (x < 0) {
            x = this.width - x;
        };
        if (y < 0) {
            y = this.height - y;
        };
        return this.level[y][x];
    }
    isWall(x, y) {
        let r = this.getTile(x, y) == "W";
        return r;
    }
    getTexture(x, y) {
        return Level.getTexture(this, x, y);
    }
    generateWalls() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.isWall(x, y)) {
                    new Wall(vec2(x - this.x_offset, y - this.y_offset).scale(Level.scale), vec2(1, 1).scale(Level.scale), this.getTexture(x, y))
                } else if (Level.goals_string.includes(this.getTile(x, y))) {
                    let goal_num = parseInt(this.getTile(x, y));
                    this.goals[goal_num] = [x, y]
                } else if (this.getTile(x, y) == "C") {
                    this.cat_positions.push([x, y]);
                } else if (this.getTile(x, y) == "M") {
                    this.mouse_position = [x, y];
                }
            }
        }
    }
    createCharacters() {
        for (let c of this.cat_positions) {
            cat = new Cat(this.cordinateConversion(c[0], c[1]), Cat.base_size, cat_texture);
        }
        mouse = new Mouse(this.cordinateConversion(this.mouse_position[0], this.mouse_position[1]), Mouse.base_size, mouse_texture);
        cheese = new Cheese(vec2(0, 0), cheese_texture);
        laser = new Laser();
        this.positionCheese();
    }
    positionCheese() {
        if (this.goals[this.goal_i] == undefined) {
            this.nextLevel();
        } else {
            cheese.pos = this.cordinateConversion(this.goals[this.goal_i][0], this.goals[this.goal_i][1]);
            laser.pos = cheese.pos;
        }
    }
    cordinateConversion(x, y) {
        return vec2(x - this.x_offset, y - this.y_offset).scale(Level.scale);
    };
    wipe() {
        Wall._wipeWalls();
        laser.wipe();
        laser = null;
        cat.destroy();
        cat = null;
        mouse.destroy();
        mouse = null;
        cheese.destroy();
        cheese = null;
    }
    nextLevel() { // handles transition to next level
        level_i++;
        if (level_i >= levels.length) {
            alert("End of Game");
            return;
        }
        this.wipe();
        game_state = "paused";
        level = new Level(levels[level_i]);
        console.log("Switched to Level", level_i);
    }
    static getTexture(level, x, y) {
        let index = 0;
        index += (1 * level.isWall(x, y + 1));
        index += (1 * level.isWall(x + 1, y) << 1);
        index += (1 * level.isWall(x, y - 1) << 2);
        index += (1 * level.isWall(x - 1, y) << 3);
        return Level.textures[index];
    }
    static loadWallTextures() {
        for (let y = 0.2; y < 64; y += 16) {
            for (let x = 192.2; x < 256; x += 16) {
                Level.textures.push(new TileInfo(vec2(x, y), vec2(15.6, 15.6)));
            }
        }
    }
}

function caughtHandler() {
    game_state = "caught";
    mouse.size = vec2(0); // for aesthetic purposes
    cat.size = vec2(0);
    stopAllMovement();
}

function uncaughtHandler() {
    // game_state is changed externally to whatever
    mouse.size = Mouse.base_size;
    cat.size = Cat.base_size;
}

///////////////LEVELS///////////////
const levels = [

    `
WWWWWWWWW
W++W++C+W
W+1+++++W
WM++WW++W
W+++WW+0W
WWWWWWWWW
`,

    `
WWWWWWWWWWWWWW
W+++W+C++W+++W
W+1+W+2++++++W
WM+++++++W+0+W
W+++W++++W+++W
WWWWWWWWWWWWWW
`,

]