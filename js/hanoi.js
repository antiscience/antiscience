const hanoi = async (n, src, aux, target) =>
{
    if (n == 0) return;
    if (stopRequested) return;

    await hanoi(n-1, src, target, aux);
    count += 1;
    await draw_move(src, target);
    await hanoi(n-1, aux, src, target);
}

const draw_move = async (src, target) =>
{
    if (stopRequested) return;
    await sleep(500);
    const src_rod = document.getElementById('rod-' + src);
    const target_rod = document.getElementById('rod-' + target);
    const disk = src_rod.removeChild(src_rod.lastChild);
    document.getElementById("count").textContent = count;
    target_rod.appendChild(disk);
}

/* end of algo */

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const draw = (n) =>
{
    for (let i = 1; i < 4; i++)
    {
        let rod = document.getElementById('rod-' + i);
        rod.innerHTML = '';
        if (i == 1)
        {
            for (let k = n; k > 0; k--)
            {
                const disk = document.createElement('div');
                disk.style.backgroundColor = colors[k % colors.length];
                disk.style.width = (k/n) * 100 + "%";
                disk.textContent = k;
                rod.appendChild(disk);
            }
        }
    }
}

const colors = 
[
    "rgba(158, 1, 66, 1)",
    "rgba(213, 62, 79, 1)",
    "rgba(244, 109, 67, 1)",
    "rgba(253, 174, 97, 1)",
    "rgba(254, 224, 139, 1)",
    "rgba(171, 221, 164, 1)",
    "rgba(102, 194, 165, 1)",
    "rgba(50, 136, 189, 1)",
    "rgba(94, 79, 162, 1)"
];

let stopRequested = false;
let count = 0;
const start = document.getElementById("start");
start.addEventListener("click", async () =>
{
    if (start.className == "start")
    {
        stopRequested = false;
        start.textContent = "Stop";
        start.className = "stop";
        await sleep(500);
        const height = document.getElementById("height").value;
        document.getElementById("count").textContent = "0";
        draw(height);
        count = 0;
        await hanoi(height, 1, 2, 3);

    } else
    {
        stopRequested = true;
    }

    start.textContent = "Start";
    start.className = "start";
})

draw(5);


