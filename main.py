import json
import requests
import datetime

channel_ids = [
    "UCBR8-60-B28hp2BmDPdntcQ", # YouTube
    "UC7c3Kb6jYCRj4JOHHZTxKsQ", # GitHub
    "UCX6OQ3DkcsbYNE6H8uQQuVA", # MrBeast
    "UCq-Fj5jknLsUf-MWSy4_brA", # T-Series
    "UCpEhnqL0y41EpW2TvWAHD7Q", # SET India
    "UCbp9MyKCTEww4CxEzc_Tp0Q", # Stokes Twins
    "UCiVs2pnGW5mLIc1jS2nxhjg", # 김프로KIMPRO
    "UCFFbwnve3yF62-tVXkTyHqg", # Zee Music Company
    "UCZs0WwC0Dn_noiQE2BHSTKg", # Alejo Igoa
    "UCJ5v_MCY6GNUBTO8-D3XoAg", # WWE
]

def main() -> None:
    history_path = "./history.json"
    with open(history_path, "r") as file:
        history = json.load(file)
    current_date = datetime.datetime.now(datetime.UTC)
    cutoff_date = current_date - datetime.timedelta(days=7)
    entries_to_remove = 0
    for entry in history:
        entry_date = datetime.datetime.fromisoformat(entry["date"])
        if entry_date > cutoff_date:
            break
        entries_to_remove += 1
    history = history[entries_to_remove:]
    for channel_id in channel_ids:
        url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
        response = requests.get(url=url, timeout=15)
        status = response.status_code
        if status != 200:
            break
    history.append({
        "date": current_date.isoformat(),
        "status": status
    })
    with open(history_path, "w") as file:
        json.dump(history, file)

if __name__ == "__main__":
    main()