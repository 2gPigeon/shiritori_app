import csv
import json
import re

input_csv = "all.csv"
output_json = "cleaned_readings.json"

readings = []

def clean_reading(text):
    if not text:
        return None
    # ～ や （） を削除
    text = re.sub(r'～', '', text)
    text = re.sub(r'\(.*?\)', '', text)
    text = text.strip()
    # カタカナ・ひらがな以外がある場合は除外
    if re.fullmatch(r'[ぁ-んァ-ンー]+', text):
        return text
    return None

with open(input_csv, encoding="utf-8") as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        raw = row.get("reading", "")
        cleaned = clean_reading(raw)
        if cleaned:
            readings.append({"word": cleaned})

with open(output_json, "w", encoding="utf-8") as f:
    json.dump(readings, f, ensure_ascii=False, indent=2)

print(f"{len(readings)}件の単語を抽出しました。")
