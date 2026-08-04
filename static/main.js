async function get_history() {
    /* const url = "history.json"; */
    const url = "https://raw.githubusercontent.com/ytrss/ytrss.github.io/refs/heads/main/static/history.json";
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
    const title = document.querySelector(".title");
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

function get_time_delta_string(start_date, end_date) {
    start_date = new Date(start_date);
    end_date = new Date(end_date);
    let time_delta = end_date - start_date;
    let unit = "millisecond";
    if (time_delta < 60000) {
        time_delta = Math.floor(time_delta / 1000);
        unit = "second";
    } else if (time_delta < 3600000) {
        time_delta = Math.floor(time_delta / 60000);
        unit = "minute";
    } else if (time_delta < 86400000) {
        time_delta = Math.floor(time_delta / 3600000);
        unit = "hour";
    } else {
        time_delta = Math.floor(time_delta / 86400000);
        unit = "day";
    }
    if (time_delta != 1) {
        unit += "s";
    }
    return `${time_delta} ${unit}`;
}

function set_timer(history) {
    const update_date = history[history.length-1].date;
    const timer = document.querySelector(".timer");
    const update_timer = () => {
        timer.textContent = `Updated ${get_time_delta_string(update_date, new Date())} ago...`;
    };
    update_timer();
    const interval = setInterval(update_timer, 500);
    return () => clearInterval(interval);
}

function get_history_groups(history, groups) {
    const small_group_size = Math.floor(history.length / groups);
    const large_group_size = small_group_size + 1;
    const large_groups = history.length - (small_group_size * groups);
    const small_groups = groups - large_groups;
    const group_sizes = [];
    group_sizes.push(...Array(small_groups).fill(small_group_size));
    group_sizes.push(...Array(large_groups).fill(large_group_size));
    let start = 0;
    const history_groups = [];
    for (const group_size of group_sizes) {
        const end = start + group_size;
        history_groups.push(history.slice(start, end));
        start = end;
    }
    return history_groups;
}

function set_graph(history) {
    const graph = document.querySelector(".graph");
    const status = graph.querySelector(".status");
    const start_date = graph.querySelector(".date.start");
    const end_date = graph.querySelector(".date.end");
    const update_status = () => {
        const groups = Math.floor(status.offsetWidth / 12);
        const history_groups = get_history_groups(history, groups);
        status.replaceChildren();
        for (const history_group of history_groups) {
            const group = document.createElement("div");
            group.classList.add("group");
            if (history_group.length > 0) {
                const offline = history_group.some(entry => entry.status != 200);
                if (offline) {
                    group.classList.add("offline");
                } else {
                    group.classList.add("online");
                }
            }
            status.appendChild(group);
        }
    };
    const update_dates = () => {
        if (history.length > 0) {
            start_date.textContent = `${get_time_delta_string(history[0].date, new Date())} ago`;
            end_date.textContent = `${get_time_delta_string(history[history.length-1].date, new Date())} ago`;
        }
    };
    const observer = new ResizeObserver(update_status);
    observer.observe(status);
    update_dates();
    const interval = setInterval(update_dates, 500);
    return () => {
        observer.disconnect();
        clearInterval(interval);
    };
}

function set_history_download(history) {
    const download = document.querySelector(".download");
    const json = JSON.stringify(history);
    const blob = new Blob([json], { type: "application/json" });
    download.href = URL.createObjectURL(blob);
}

document.addEventListener("DOMContentLoaded", () => {
    let clear_timer = () => {};
    let clear_graph = () => {};
    const update_history = async () => {
        clear_timer();
        clear_graph();
        const history = await get_history();
        set_title(history);
        clear_timer = set_timer(history);
        clear_graph = set_graph(history);
        set_history_download(history);
        console.info("Updated history");
    };
    clear_graph = set_graph([]);
    update_history();
    setInterval(update_history, 300000);
});