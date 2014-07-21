import json

from sqlalchemy.types import TypeDecorator, VARCHAR

from ..core import db

DEFAULT_COLS = 0


class JSONEncodedDict(TypeDecorator):
    """
        Represents an immutable structure as a json-encoded string.
        Usage::
            JSONEncodedDict(255)
    """

    impl = VARCHAR

    def process_bind_param(self, value, dialect):
        if value is not None:
            value = json.dumps(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            value = json.loads(value)
        return value


class Page(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    content = db.Column(JSONEncodedDict, nullable=False)
    columns = db.Column(db.Integer, nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'))

    def __init__(self, name=None, columns=DEFAULT_COLS):
        self.name = name or "Page {0}".format(self.id)
        self.columns = columns
        content = {}
        self.content = content

    def __repr__(self):
        return '<Page {0}>'.format(self.id)
