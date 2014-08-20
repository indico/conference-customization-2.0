#coding: utf8

from ..core import db
from ..utils import JSONEncodedDict


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    main_page_id = db.Column(db.Integer, default=0, nullable=False)
    pages = db.relationship('Page', backref='event')
    data = db.Column(JSONEncodedDict, nullable=False)

    def __init__(self, main_page_id=1):
        self.main_page_id = main_page_id
        self.data = {
            'speakers': [
                {
                    'name': 'Iason Andriopoulos',
                    'email': 'iason.andriopoulos@email.com',
                    'organisation': 'Athens University of Economics and Business (GR)'
                },
                {
                    'name': 'Alejandro Aviles del Moral',
                    'email': 'ome.gak@email.com',
                    'organisation': 'Universidad de Granada (ES)'
                },
                {
                    'name': 'Pedro Ferreira',
                    'email': 'pedro.ferreira@email.com',
                    'organisation': 'CERN'
                },
                {
                    'name': 'Tommaso Papini',
                    'email': 'tommaso.papini@email.com',
                    'organisation': 'Università degli Studi di Firenze'
                }
            ],
            'authors': [
                {
                    'name': 'Pedro Ferreira',
                    'email': 'pedro.ferreira@email.com',
                    'organisation': 'CERN'
                },
                {
                    'name': 'Tommaso Papini',
                    'email': 'tommaso.papini@email.com',
                    'organisation': 'Università degli Studi di Firenze'
                },
                {
                    'name': 'Adrian Mönnich',
                    'email': 'adrian.monnich@email.com',
                    'organisation': 'CERN'
                },
                {
                    'name': 'Ilias Trichopoulos',
                    'email': 'ilias.trichopoulos@email.com',
                    'organisation': 'CERN'
                }
            ]
        }

    def __repr__(self):
        return '<Event {0}>'.format(self.id)

    def fetch(self, data_type):
        return self.data[data_type]
