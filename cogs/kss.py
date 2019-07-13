import discord
from discord.ext import commands

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

    def __init__(self, bot):
        self.bot = bot
        self.db = KSSDB(bot.mongo)

    @commands.command()
    async def flag(self, ctx, flag):
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

        await self.db.solve_challenge(ctx.author, challenge)
        await ctx.send(f'You have completed challenge {challenge.get("name")}')

def setup(bot):
    bot.add_cog(KSS(bot))
