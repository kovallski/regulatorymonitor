from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from urllib.parse import urljoin
import time

BASE_URL = "https://minfin.gov.ru"
DOCUMENTS_URL = f"{BASE_URL}/ru/document/"

def fetch_news_list():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    print("[INFO] Открытие браузера...")
    driver.get(DOCUMENTS_URL)

    time.sleep(5)
    cards = driver.find_elements(By.CLASS_NAME, "document_card")
    print(f"[DEBUG] Найдено карточек: {len(cards)}")

    news_data = []

    for card in cards:
        try:
            title_el = card.find_element(By.CLASS_NAME, "document_title")
            title = title_el.text.strip()
            relative_url = title_el.get_attribute("href")
            url = urljoin(BASE_URL, relative_url)

            date_el = card.find_element(By.CLASS_NAME, "date")
            date = date_el.text.strip()

            tag_els = card.find_elements(By.CSS_SELECTOR, "ul.tag_list li a")
            tags = [f"#{tag.text.strip().replace(' ', '_').upper()}" for tag in tag_els]

            news_data.append({
                "title": title,
                "url": url,
                "date": date,
                "tags": tags
            })
        except Exception as e:
            print("[ERROR]", e)
            continue

    driver.quit()
    return news_data
