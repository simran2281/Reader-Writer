function Semaphore(maxLimit)
{
    let current = 0;
    let queue = [];

    this.lower = async function()
    {
        if(current < maxLimit)
        {
            current = current + 1;
            return new Promise(resolve => resolve());
        }
        else
        {
            return new Promise(resolve => {
                queue.push(resolve);
            });
        }
    }
    this.raise = function() 
    {
        if (current > 0) 
        {
            current = current - 1;
            if(current < maxLimit && queue.length > 0)
            {
                let toGo = queue.shift();
                toGo();
                current = current + 1;
            }
        }
    }
}
function sleep(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

let freeSpots = 12;

let semaphore = new Semaphore(freeSpots);

let readerSemaphore = new Semaphore(1);

async function Reader(readerID, delay)
{
    while(true)
    {
        await sleep(delay * 2000);
        await readerSemaphore.lower();
        await semaphore.lower();
        readerSemaphore.raise();
        document.getElementById(readerID).innerHTML = "R";
        await sleep(delay * 1000);
        document.getElementById(readerID).innerHTML = "";
        semaphore.raise();
    }
}
async function Writer(writerID, delay)
{
    while(true)
    {
        await sleep(delay * 1000);
        await readerSemaphore.lower();
        
        for(let i = 1; i <= freeSpots; i++)
        {
            await semaphore.lower();
        }
        document.getElementById(writerID).innerHTML = "W";
        await sleep(4000);
        document.getElementById(writerID).innerHTML = "";

        readerSemaphore.raise();
        for(let i = 1; i <= freeSpots; i++)
        {
            semaphore.raise();
        }
        
    }
}

async function start()
{
    alert("Operation is start");
    Writer(1, 44);
    Writer(2, 28);
    Writer(3, 10);
    let id = 1;
    for (let i = 1; i <= freeSpots; i++)
    {
        Reader(i, Math.floor(Math.random() * (5 - 1)) + 1);
    }
}
