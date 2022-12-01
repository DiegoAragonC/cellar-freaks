class Tile {
    constructor(x, y, sprite, passable) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.passable = passable;
    }

    replace(newTileType) {
        tiles[this.x][this.y] = new newTileType(this.x, this.y);
        return tiles[this.x][this.y];
    }

    dist(other) {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }

    getNeighbor(dx, dy) {
        return getTile(this.x + dx, this.y + dy);
    }

    getAdjacentNeighbors() {
        return shuffle([this.getNeighbor(0, -1), this.getNeighbor(0, 1), this.getNeighbor(-1, 0), this.getNeighbor(1, 0)]);
    }

    getAdjacentPassableNeighbors() {
        return this.getAdjacentNeighbors().filter(t => t.passable);
    }

    getConnectedTiles() {
        let connected = [this];
        let frontier = [this];
        while (frontier.length) {
            let neighbors = frontier.pop().getAdjacentPassableNeighbors().filter(t => !connected.includes(t));
            connected = connected.concat(neighbors);
            frontier = frontier.concat(neighbors);
        }
        return connected;
    }

    draw() {
        drawSprite(this.sprite, this.x, this.y);
        if (this.treasure) {
            drawSprite(tileSprites.treasure, this.x, this.y);
        }
    }
    
}

class Floor extends Tile {
    constructor(x, y) {
        super(x, y, tileSprites.floor, true);
    }

    stepOn(monster) {
        if (monster.isPlayer && this.treasure) {
            score++;
            if (score % 3 == 0 && numSpells < 9) {
                numSpells++;
                player.addSpell();
            }
            playSound("treasure");
            this.treasure = false;
            spawnMonster();
        }
    }
}

class Wall extends Tile {
    constructor(x, y) {
        super(x, y, tileSprites.wall, false);
    }
}

class Exit extends Tile {
    constructor(x, y) {
        super(x, y, 11, true);
    }

    stepOn(monster) {
        if (monster.isPlayer) {
            playSound("newLevel");
            if (level == numLevels) {
                addScore(score, true);
                showTitle();
            } else {
                level++;
                startLevel(Math.min(maxHP, player.hp+1));
            }
        }
    }
}