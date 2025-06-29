import os
from aiogram import Bot
from aiogram.enums.parse_mode import ParseMode
from aiogram.client.default import DefaultBotProperties
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
CHANNEL_ID = os.getenv("CHANNEL_ID")

bot = Bot(
    token=BOT_TOKEN,
    default=DefaultBotProperties(parse_mode=ParseMode.HTML)
)

async def send_news_to_channel(news_item):
    text = f"📌 {news_item['date']} — {news_item['title']}\n{news_item['url']}\n{' '.join(news_item['tags'])}"
    print(f"[ОТПРАВКА] {text}")
    await bot.send_message(chat_id=CHANNEL_ID, text=text)
