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
        this.goals = new Array(10);
        this.cat_positions = [];
        this.mouse_position;
        this.generateWalls();
        this.positionCharacters();
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
    positionCharacters() {
        let pos = function(x, y) {
            console.log(this.x_offset);
            return vec2(x - this.x_offset, y - this.y_offset).scale(Level.scale);
        };
        cat.pos = pos(this.cat_positions[0][0], this.cat_positions[0][1]);
        mouse.pos = pos(this.mouse_position[0], this.mouse_position[1]);
        cheese.pos = pos(this.goals[0][0], this.goals[0][1]);
        laser.pos = cheese.pos;
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
W+++++++W
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