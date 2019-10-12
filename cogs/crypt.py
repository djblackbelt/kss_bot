import typing

import discord
from discord.ext import commands

import base64

class Crypt(commands.Cog):
    """Crypto / Hash utilities"""

    def __init__(self, bot):
        self.bot = bot

    @commands.group(name='base64', invoke_without_command=True, aliases=["b64"])
    async def base64(self, ctx, *, text: str):
        "Encodes input with base64"
        await ctx.send(f'`{base64.b64encode(text.encode("utf8")).decode("utf8")}`')

    @base64.command(name="-d")
    async def base64decode(self, ctx, text: str):
        "Decodes base64 input"
        await ctx.send(f'`{base64.b64decode(text.encode("utf8")).decode("utf8")}`')

def setup(bot):
    bot.add_cog(Crypt(bot))
