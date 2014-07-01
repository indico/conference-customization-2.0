import sys

from flask import current_app
from flask.ext.script import Manager, prompt_bool

from . import models
from .core import db, ContextfulManager
from .factory import make_app


manager = ContextfulManager(make_app)
db_manager = Manager(help='Manage database')
manager.add_command('db', db_manager)


@db_manager.command
def drop():
    """Drops all database tables"""
    if prompt_bool('Are you sure you want to lose all your data?'):
        db.drop_all()


@db_manager.command
def create():
    """Creates database tables"""
    with current_app.test_request_context():
        db.create_all()


@db_manager.command
def recreate():
    """Recreates database tables (same as issuing 'drop' and then 'create')"""
    drop()
    create()


@manager.shell
def shell_context():
    ctx = {'db': db}
    ctx.update((x, getattr(models, x)) for x in dir(models) if x[0].isupper())
    return ctx


def main():
    manager.run()
