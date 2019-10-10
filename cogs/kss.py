import traceback
from datetime import datetime

import discord
from discord.ext import commands

GUILD = 520241835348721684
LOG_CHANNEL = 563857408363986954

class KSSDB():
    def __init__(self, mongo):
        self.db = mongo.kss

    async def get_challenge_by_flag(self, flag):
        return await self.db.challenges.find_one({"flag": flag})

    async def get_user(self, user):
        return await self.db.users.find_one({"id": user.id})

    async def create_user(self, user):
        print(dir(user))
        return await self.db.users.insert_one({
            "id": user.id,
            "name": user.name,
            "discriminator": user.discriminator,
            "tag": f'{user.name}#{user.discriminator}',
            "avatar": user.avatar,
            "completed_challenges": [],
            "permission": "Z"
        })

    async def solve_challenge(self, user, challenge):
        return await self.db.users.find_one_and_update(
            {"id": user.id},
            {"$push": {"completed_challenges": challenge.get("_id")}}
        )

class KSS(commands.Cog):
    """KSS specific commands"""

    roles = {
        2: 534131616990363671, # Script Kiddie
        6: 534131244355551233, # Hacker
        8: 534130064606887965  # Elite Hacker
    }

    def __init__(self, bot):
        self.bot = bot
        self.db = KSSDB(bot.mongo)

    async def cog_command_error(self, ctx, error):
        if isinstance(error, commands.BadArgument) or  isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(error)
        elif isinstance(error, commands.CommandInvokeError):
            original = error.original
            if isinstance(original, discord.Forbidden):
                await ctx.send('I do not have permission to execute this action.')
            elif isinstance(original, discord.NotFound):
                await ctx.send(f'This entity does not exist: {original.text}')
            elif isinstance(original, discord.HTTPException):
                await ctx.send('Somehow, an unexpected error occurred. Try again later?')
            else:
                print(traceback.format_exc())

                e = discord.Embed(color=0xF44336)
                e.description = f'Error in command {ctx.command}: \n ```{error}```\nIn channel: {ctx.channel}'
                e.timestamp = datetime.now()

                await self.bot.stats_webhook.send(embed=e)

    @property
    def guild(self):
        return self.bot.get_guild(GUILD)

    @commands.dm_only()
    @commands.command()
    async def flag(self, ctx, flag: str):
        challenge = await self.db.get_challenge_by_flag(flag)

        if not challenge:
            await ctx.send("This is not a valid flag")
            return

        user = await self.db.get_user(ctx.author)

        if not user:
            await self.db.create_user(ctx.author)
            user = await self.db.get_user(ctx.author)

        if challenge.get("_id") in user.get("completed_challenges"):
            await ctx.send(f'You have already completed challenge {challenge.get("name")}')
            return

        # ADD ROLES
        member = self.guild.get_member(ctx.author.id)
        roles = [self.guild.get_role(v) for k, v in self.roles.items() if len(user["completed_challenges"]) + 1 >= k]
        new_roles = list([role for role in roles if role not in member.roles])

        for role in new_roles:
            await member.add_roles(role)

        await self.db.solve_challenge(ctx.author, challenge)

        await ctx.send(f'You have completed challenge {challenge.get("name")}')

        # LOG TO ADMIN CHANNEL
        e = discord.Embed(color=0x4CAF50)
        e.set_author(name=f'{ctx.author.display_name}', icon_url=ctx.author.avatar_url)
        e.description = f'Completed challenge {challenge.get("name")}'
        e.set_footer(text=f'ID: {ctx.author.id}')
        e.timestamp = datetime.now()

        await self.bot.stats_webhook.send(embed=e)

        if new_roles:
            await ctx.send(f'Rank up: {" ".join([role.name for role in new_roles])}')

            e = discord.Embed(color=new_roles[0].color)
            e.set_author(name=f'{ctx.author.display_name}', icon_url=ctx.author.avatar_url)
            e.description = f'Achieved rank: {" ".join([role.mention for role in new_roles])}'
            e.set_footer(text=f'ID: {ctx.author.id}')
            e.timestamp = datetime.now()

            await self.bot.stats_webhook.send(embed=e)

def setup(bot):
    bot.add_cog(KSS(bot))
