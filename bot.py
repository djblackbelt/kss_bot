import os, sys
import asyncio
import logging
import traceback
import aiohttp

import discord
from discord.ext import commands

import motor.motor_asyncio
from pymongo.errors import ServerSelectionTimeoutError

# DISCORD
DISCORD_TOKEN = os.environ.get("DISCORD_TOKEN")
DISCORD_CLIENT_ID = os.environ.get("DISCORD_CLIENT_ID")

# MONGO
MONGO_URI = os.environ.get("MONGO_URI")

# STATS
STATS_ID = os.environ.get("STATS_ID")
STATS_TOKEN = os.environ.get("STATS_TOKEN")

loop = asyncio.get_event_loop()

log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

description = """
KryptSec
"""

initial_extensions = (
    'cogs.meta',
    'cogs.admin',
    'cogs.kss'
)

async def _prefix_callable(bot, msg):
    user_id = bot.user.id
    return [f'<@!{user_id}> ', f'<@{user_id}> ', '!']

class KSS(commands.AutoShardedBot):
    def __init__(self):
        super().__init__(command_prefix=_prefix_callable, description=description,
                         pm_help=None, help_attrs=dict(hidden=True), fetch_offline_members=False)
        self.session = aiohttp.ClientSession(loop=self.loop)

        self.client_id = DISCORD_CLIENT_ID

    def load_initial_extensions(self):
        for extension in initial_extensions:
            try:
                self.load_extension(extension)
            except Exception as e:
                print(f'Failed to load extension {extension}.', file=sys.stderr)
                traceback.print_exc()

    @property
    def stats_webhook(self):
        return discord.Webhook.partial(id=STATS_ID, token=STATS_TOKEN, adapter=discord.AsyncWebhookAdapter(self.session))

    async def on_ready(self):
        print(f"Connected as {self.user} - {self.user.id} on {len(self.guilds)} guilds")

    async def close(self):
        await super().close()
        await self.session.close()
        self.mongo.close()

    async def init_mongo(self):
        self.mongo = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
        # motor doesnt attempt a connection until you try to do something
        await self.mongo.admin.command("ismaster")
        print("Connected to mongo")

def run():
    bot = KSS()

    try:
        loop.run_until_complete(bot.init_mongo())
    except ServerSelectionTimeoutError:
        log.exception("Could not connect to mongo, timed out\nExiting.")
        return

    bot.load_initial_extensions()
    bot.run(DISCORD_TOKEN, reconnect=True)

if __name__ == "__main__":
    run()
