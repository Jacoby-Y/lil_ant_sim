const canvas = document.querySelector("canvas");

const ctx = canvas.getContext("2d");

canvas.width = 1080;
canvas.height = 720;

const rect = (x,y,w,h, color="black")=>{
    if (ctx.fillStyle != color) ctx.fillStyle = color;
    ctx.fillRect(x,y,w,h);
}
const cRect = (x,y,w,h, color="black")=>{
    if (ctx.fillStyle != color) ctx.fillStyle = color;
    ctx.fillRect(x-w/2,y-h/2,w,h);
}
const dist = (x1,y1, x2,y2)=> Math.sqrt( Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) )

const ants = [];
const food = {
    _collected: 0,
    get collected() { return this._collected },
    set collected(x) { 
        this._collected = x;
        document.getElementById("collected").innerText = `Food: ${x}`;
    },
    list: [],
    tick: 0,
    max_tick: 0,
    max_food: 10000,
    addFood() {
        if (this.list.length >= this.max_food) return;
        this.list.push({
            x: Math.round(Math.random() * 1080),
            y: Math.round(Math.random() * 720),
        });
    },
    draw() {
        this.list.forEach(({x, y})=>{
            cRect(x, y, 10, 10, "orange");
        })
    }
}
const ant = {
    x: 100,
    y: 100,
    x2: 600,
    y2: 600,
    speed: 3,
    moving: false,
    draw() {
        cRect(this.x, this.y, 10, 10, "red");
        if (!this.moving) return;
        cRect(this.x2, this.y2, 10, 10, "green");
    },
    moveTo(x,y) {
        this.moving = true;
        this.x2 = x;
        this.y2 = y;
    }
}

const ai = {
    list: [],
    cd_max: 1,

    addAi() {
        this.list.push({
            x: Math.round(Math.random() * 1080),
            y: Math.round(Math.random() * 720),
            x2: 0,
            y2: 0,
            speed: 10,
            moving: false,
        
            cd: 0,
        })
    },
    draw(ai) {
        cRect(ai.x, ai.y, 10, 10, "blue");
    },
    moveTo(ai, x,y) {
        ai.moving = true;
        ai.x2 = x;
        ai.y2 = y;
    }
}

// for (let i = 0; i < 100; i++) ai.addAi();
for (let i = 0; i < 10; i++) ai.addAi();

const mouse = {
    x: 0,
    y: 0,
}

const System = {
    /** @type {Function[]} */
    systems: [],
    addSys(fn=()=>{}){ this.systems.push(fn); },
    runSys(){ this.systems.forEach(fn => fn())},
}

canvas.onmousemove = ({layerX, layerY})=>{
    mouse.x = layerX;
    mouse.y = layerY;
}
canvas.onmousedown = ({layerX, layerY})=>{
    ant.moveTo(layerX, layerY);
}

// Clear Drawing
System.addSys(()=>{
    ctx.clearRect(0, 0, 1080, 720);
});
// Main Ant
System.addSys(()=>{
    ant.draw();

    if (ant.moving) {
        const ang = Math.atan2(ant.y2 - ant.y, ant.x2 - ant.x);
        ant.x += Math.cos(ang) * ant.speed;
        ant.y += Math.sin(ang) * ant.speed;

        if (dist(ant.x, ant.y, ant.x2, ant.y2) <= 10) ant.moving = false;

        food.list = food.list.filter(({x,y})=> (dist(x,y, ant.x, ant.y) > 50 ? true : (food.collected++, false)));
    }
});
// Food
System.addSys(()=>{
    food.draw();
    if (food.tick++ < food.max_tick) return;
    food.tick = 0;
    food.addFood();
    // console.log(food.list);
});
// AI ant
System.addSys(()=>{
    for (let i = 0; i < ai.list.length; i++) {
        const lil = ai.list[i];
        ai.draw(lil);
        if (!lil.moving) {
            if (lil.cd++ < ai.cd_max || food.list.length == 0) continue;
            lil.cd = 0;
            const { x, y } = food.list[Math.floor(food.list.length * Math.random())];
            ai.moveTo(lil, x,y);
            continue;
        }
        if (dist(lil.x2, lil.y2, lil.x, lil.y) <= 10) lil.moving = false;

        const ang = Math.atan2(lil.y2 - lil.y, lil.x2 - lil.x);
        lil.x += Math.cos(ang) * lil.speed;
        lil.y += Math.sin(ang) * lil.speed;

        let got_food = false;
        food.list = food.list.filter(({x,y})=> (dist(x,y, lil.x, lil.y) > 50 ? true : (food.collected++, got_food = true, false)));
        // if (got_food) lil.moving = false;
    }
})


window.requestAnimationFrame(function mainLoop() {
    System.runSys();
    window.requestAnimationFrame(mainLoop);
})