from ..core import db
from ..utils import JSONEncodedDict


class Page(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    content = db.Column(JSONEncodedDict, nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'))

    def __init__(self, event_id, name=None):
        self.name = name or "Page {0}".format(self.id)
        content = [
            {
                'type': 'container',
                'settings': {
                    'orientation': 'vertical'
                },
                'content': []
            }
        ]
        self.content = content
        self.event_id = event_id

    def __repr__(self):
        return '<Page {0}>'.format(self.id)
