import re
import asyncio
import traceback
from datetime import datetime

import discord
from discord.ext import commands

from texttable import Texttable

GUILD = 520241835348721684
LOG_CHANNEL = 563857408363986954
KSS_MOD_ROLE = 534130661322391567

class InteractiveExit(Exception):
    pass

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

    async def get_challenges(self):
        return await self.db.challenges.find().to_list(length=None)

    async def get_challenge_by_name(self, name):
        return await self.db.challenges.find_one({"name": name})

    async def delete_challenge_by_name(self, name):
        return await self.db.challenges.find_one_and_delete({"name": name})

    async def create_challenge(self, challenge):
        return await self.db.challenges.insert_one(challenge)


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

    @commands.group(name='challenges', invoke_without_command=True, aliases=["challenge", "c"])
    @commands.has_role(KSS_MOD_ROLE)
    async def challenges(self, ctx):
        challenges = await self.db.get_challenges();

        table = Texttable()
        table.add_row(["Name", "Author", "Difficulty", "Category"])

        for c in challenges:
            table.add_row([c.get("name"), c.get("author"), c.get("difficulty"), c.get("category")])

        await ctx.send(f'```\n{table.draw()}\n```')

    @challenges.command()
    async def create(self, ctx):
        fields = {
            "name": "Name (k#)",
            "authors": "Authors (space delimited mentions, IDs, or text (gross))",
            "difficulty": "Difficulty (beginner, easy, medium, hard, etc)",
            "category": "Category (web, stego, forensics, reversing, etc)",
            "flag": "Flag (k{sample_text})",
        }

        challenge = {}

        def build_challenge_embed():
            e = discord.Embed(color=0x03A9F4)
            e.add_field(name="name", value=challenge.get("name"), inline=True)

            authors = []
            for a in challenge.get("authors"):
                a = self.bot.get_user(a.get("id")).mention if "id" in a else a.get("text")
                authors.append(a)

            e.add_field(name="authors", value=", ".join(authors), inline=True)
            e.add_field(name="difficulty", value=challenge.get("difficulty"), inline=True)
            e.add_field(name="category", value=challenge.get("category"), inline=True)
            e.add_field(name="flag", value='*' * len(challenge.get("flag")), inline=True)
            return e

        def check(m):
            return m.author.id == ctx.author.id and \
                   m.channel.id == ctx.channel.id

        async def get_field(field, response):
            content = response.content.strip()

            if not content:
                await ctx.send("You must enter something.")

            # kinda shit but idk how to do it better tbh
            if field == "name":
                if await self.db.get_challenge_by_name(content):
                    await ctx.send(f'Challenge {content} already exists, please try again.')
                    return

                return content

            elif field == "authors":
                authors = []

                for user in response.mentions:
                    authors.append({
                        "id": user.id,
                        "name": f'{user.name}#{user.discriminator}'
                    })

                for s in re.sub("\<[^]]*\>", "", content).split(' '):
                    if not s: continue

                    try:
                        user = self.bot.get_user(int(s))
                        authors.append({
                            "id": user.id,
                            "name": f'{user.name}#{user.discriminator}'
                        })
                        continue

                    except: pass

                    authors.append({"text": s})

                return authors

            else: return content


        await ctx.send("Welcome to the interactive challenge creator!\nYou are creating a new challenge, type `exit()` at any time to quit.")

        for field, desc in fields.items():
            await ctx.send(f'`{desc}`')

            while True:
                try:
                    response = await self.bot.wait_for('message', check=check, timeout=10.0 * 60.0)
                except asyncio.TimeoutError:
                    await ctx.send('Exiting.')
                    return

                content = response.content.strip()

                if content in ('exit()', 'quit()'):
                    await ctx.send('Exiting.')
                    return

                data = await get_field(field, response)
                if data:
                    challenge[field] = data
                    break

        await ctx.send(embed=build_challenge_embed())
        await ctx.send("Type `save` or to edit, use `edit <field>`")

        while True:
            try:
                response = await self.bot.wait_for('message', check=check, timeout=10.0 * 60.0)
            except asyncio.TimeoutError:
                await ctx.send('Exiting.')
                return

            content = response.content.strip()

            if content in ('exit()', 'quit()'):
                await ctx.send('Exiting.')
                return

            if content.startswith("edit"):
                field = content.split()[1]
                if field not in fields:
                    await ctx.send(f'`{field}` is not a valid field ({", ".join([k for k in fields])})')
                    continue

                response.content = response.content.partition(field)[2]
                challenge[field] = await get_field(field, response)

                await ctx.send(embed=build_challenge_embed())
                await ctx.send("Type `save` or to edit use `edit <field>`")

            elif content.startswith("save"):
                await self.db.create_challenge(challenge)
                await ctx.send(f'Succesfully created the challenge {challenge.get("name")}')
                break

            else: await ctx.send("what")

    @challenges.command()
    async def delete(self, ctx, name: str):
        challenge = await self.db.get_challenge_by_name(name)

        if not challenge:
            return await ctx.send(f'Challenge `{name}` does not exist.')

        await ctx.send("Are you sure? (y/n)")

        def check(m):
            return m.author.id == ctx.author.id and \
                   m.channel.id == ctx.channel.id

        try:
            response = await self.bot.wait_for('message', check=check, timeout=30)
        except asyncio.TimeoutError:
            await ctx.send('Cancelled.')
            return

        content = response.content.strip()

        if content.lower() == 'y':
            r = await self.db.delete_challenge_by_name(name)
            await ctx.send(f'Challenge `{r.get("name")}` has been deleted')

        else: await ctx.send('Cancelled.')

def setup(bot):
    bot.add_cog(KSS(bot))
