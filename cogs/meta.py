import random
from datetime import datetime

import discord
from discord.ext import commands

import pygit2
import platform

class Meta(commands.Cog):
    """Commands for utilities related to Discord or the Bot itself."""

    def __init__(self, bot):
        self.bot = bot

    def cog_unload(self):
        self.bot.help_command = self.old_help_command

    async def cog_command_error(self, ctx, error):
        if isinstance(error, commands.BadArgument):
            await ctx.send(error)

    @commands.Cog.listener()
    async def on_ready(self):
        activity = discord.Activity(
            type = discord.ActivityType.playing,
            name = "kryptsec.com/challenges"
        )

        await self.bot.change_presence(status=discord.Status.online, activity=activity)

    @commands.command(name='quit', hidden=True)
    @commands.is_owner()
    async def _quit(self, ctx):
        """Quits the bot."""
        await self.bot.logout()

    @commands.group(invoke_without_command=True)
    @commands.guild_only()
    async def info(self, ctx, *, member: discord.Member = None):
        """Shows info about a member.
        This cannot be used in private messages. If you don't specify
        a member then the info returned will be yours.
        """

        if member is None:
            member = ctx.author

        e = discord.Embed()
        roles = [role.name.replace('@', '@\u200b') for role in member.roles]
        shared = sum(1 for m in self.bot.get_all_members() if m.id == member.id)
        voice = member.voice
        if voice is not None:
            vc = voice.channel
            other_people = len(vc.members) - 1
            voice = f'{vc.name} with {other_people} others' if other_people else f'{vc.name} by themselves'
        else:
            voice = 'Not connected.'

        e.set_author(name=str(member))
        e.set_footer(text='Member since').timestamp = member.joined_at
        e.add_field(name='ID', value=member.id)
        e.add_field(name='Servers', value=f'{shared} shared')
        e.add_field(name='Created', value=member.created_at)
        e.add_field(name='Voice', value=voice)
        e.add_field(name='Roles', value=', '.join(roles) if len(roles) < 10 else f'{len(roles)} roles')
        e.colour = member.colour

        if member.avatar:
            e.set_thumbnail(url=member.avatar_url)

        await ctx.send(embed=e)

    @commands.command(aliases=['invite'])
    async def join(self, ctx):
        """Joins a server."""
        perms = discord.Permissions.none()
        perms.read_messages = True
        perms.external_emojis = True
        perms.send_messages = True
        perms.manage_roles = True
        perms.manage_channels = True
        perms.ban_members = True
        perms.kick_members = True
        perms.manage_messages = True
        perms.embed_links = True
        perms.read_message_history = True
        perms.attach_files = True
        perms.add_reactions = True
        await ctx.send(f'<{discord.utils.oauth_url(self.bot.client_id, perms)}>')

    @commands.command()
    async def about(self, ctx):
        "Shows information about the bot"

        repo = pygit2.Repository('.git')
        commit = repo.revparse_single(str(repo.head.target))

        colors = [
            discord.Color.red,
            discord.Color.blue,
            discord.Color.teal,
            discord.Color.green,
            discord.Color.purple,
            discord.Color.magenta,
            discord.Color.gold,
            discord.Color.orange,
        ]

        e = discord.Embed()
        e.color = random.choice(colors)()
        e.title = f'{self.bot.user.name}#{self.bot.user.discriminator}'
        e.url = repo.remotes["origin"].url
        e.set_thumbnail(url=self.bot.user.avatar_url_as(static_format='png', size=64))
        e.description = (
            f'**PLATFORM**\n'
            f'{platform.platform()}\n'
            f'{platform.python_implementation()} {platform.python_version()} {platform.python_build()[1]}\n'
            f'\n'
            f'**GIT**\n'
            f'{repo.remotes["origin"].url}\n'
            f'`{str(repo.head.target)[:7]}` *{commit.message.strip()}*\n'
            f'{commit.author.name} @ {datetime.fromtimestamp(commit.commit_time)}\n'
        )
        e.timestamp = datetime.now()
        e.set_footer(text=self.bot.user.id)

        await ctx.send(embed=e)

    @commands.command(rest_is_raw=True, hidden=True)
    @commands.is_owner()
    async def echo(self, ctx, *, content):
        await ctx.send(content)

def setup(bot):
    bot.add_cog(Meta(bot))
