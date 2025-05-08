document.addEventListener('DOMContentLoaded', () => {
    const fishtankBody = document.getElementById('fishtank-body');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const socket = io();
    
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    fishtankBody.appendChild(canvas);

    document.addEventListener('keydown', (e) => {
        socket.emit('keydown', e.key);
    });

    class Fish {
        constructor(spritePath, width, height, speed, startY) {
            this.width = width;
            this.height = height;
            this.x = 0;
            this.y = startY;
            this.speed = speed;
            this.direction = 1;
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.05;
            this.sprite = new Image();
            this.sprite.src = spritePath;
        }

        update(canvasHeight) {
            this.x += this.speed * this.direction;
            this.wobble += this.wobbleSpeed;
            this.y += Math.sin(this.wobble) * 0.3;

            this.y = Math.max(this.height, Math.min(canvasHeight - this.height, this.y));

            if (this.x > canvas.width - this.width) {
                this.direction = -1;
            } else if (this.x < 0) {
                this.direction = 1;
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            ctx.scale(this.direction, 1);
            ctx.translate(-(this.width/2), -(this.height/2));
            
            if (this.sprite.complete) {
                ctx.drawImage(this.sprite, 0, 0, this.width, this.height);
            } else {
                ctx.fillStyle = 'orange';
                ctx.beginPath();
                ctx.moveTo(0, this.height/2);
                ctx.lineTo(this.width*0.8, 0);
                ctx.lineTo(this.width*0.8, this.height);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }
    }

    const fishes = [
        new Fish('/images/sealife1.png', 60, 40, 0.2, canvas.height * 0.3),
        new Fish('/images/sealife2.png', 90, 60, 0.1, canvas.height * 0.5),
        new Fish('/images/sealife3.png', 50, 25, 0.3, canvas.height * 0.7)
    ];

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        fishes.forEach((fish, i) => {
            fish.y = canvas.height * ((i + 1) / (fishes.length + 1));
        });
    }

    const background = new Image();
    background.src = '/images/underwater.png';

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        
        if (background.complete) {
            const scale = Math.max(
                canvas.width / background.width,
                canvas.height / background.height
            );
            const x = (canvas.width - background.width * scale) / 2;
            const y = (canvas.height - background.height * scale) / 2;
            
            ctx.drawImage(
                background,
                x, y,
                background.width * scale,
                background.height * scale
            );
        }

        fishes.forEach(fish => {
            fish.update(canvas.height);
            fish.draw(ctx);
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas);


    window.addEventListener('mousedown', (e) => {
        socket.emit('fishtank', `${e.clientX} ${e.clientY}`)
    })

    resizeCanvas();
    animate();
});