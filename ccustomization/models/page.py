from ..core import db
from ..utils import JSONEncodedDict


class Page(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    content = db.Column(JSONEncodedDict, nullable=False)
    columns = db.Column(db.Integer, nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'))

    def __init__(self, event_id, name=None, columns=0):
        self.name = name or "Page {0}".format(self.id)
        self.columns = columns
        content = {}
        self.content = content
        self.event_id = event_id

    def __repr__(self):
        return '<Page {0}>'.format(self.id)
