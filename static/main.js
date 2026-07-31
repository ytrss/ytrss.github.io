async function get_history() {
    /* const url = "../history.json"; */
    const url = "https://raw.githubusercontent.com/ytrss/ytrss.github.io/refs/heads/main/history.json";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const history = await response.json();
        return history;
    } catch (error) {
        console.error(error.message);
    }
}

function set_title(history) {
    const status = history[history.length-1].status;
    const title = document.querySelector("#title");
    if (status == 200) {
        title.innerHTML = "YouTube's RSS feed is <strong>online</strong>";
        title.classList.remove("offline");
        title.classList.add("online");
    } else {
        title.innerHTML = "YouTube's RSS feed is <strong>offline</strong>";
        title.classList.remove("online");
        title.classList.add("offline");
    }
}

function set_timer(history) {
    const update_date = new Date(history[history.length-1].date);
    const timer = document.querySelector("#timer");
    const update_timer = () => {
        const current_date = new Date();
        let time_delta = current_date - update_date;
        let unit = "millisecond";
        if (time_delta < 60000) {
            time_delta = Math.floor(time_delta / 1000);
            unit = "second";
        } else if (time_delta < 3600000) {
            time_delta = Math.floor(time_delta / 60000);
            unit = "minute";
        } else {
            time_delta = Math.floor(time_delta / 3600000);
            unit = "hour";
        }
        if (time_delta != 1) {
            unit += "s";
        }
        timer.textContent = `Updated ${time_delta} ${unit} ago...`;
    };
    update_timer();
    return setInterval(update_timer, 500);
}

document.addEventListener("DOMContentLoaded", () => {
    let timer_interval;
    const update_history = async () => {
        clearInterval(timer_interval);
        const history = await get_history();
        set_title(history);
        timer_interval = set_timer(history);
    };
    update_history();
    setInterval(update_history, 300000);
});