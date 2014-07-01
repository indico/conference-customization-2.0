from ..core import db


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    main_page_id = db.Column(db.Integer, default=0, nullable=False)
    pages = db.relationship('Page', backref='event')

    def __init__(self, main_page_id=0):
        self.main_page_id = main_page_id

    def __repr__(self):
        return '<Event {0}>'.format(self.id)
