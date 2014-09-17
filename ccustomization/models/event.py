#coding: utf8

import itertools

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
                    'id': 0,
                    'name': 'Iason Andriopoulos',
                    'email': 'iason.andriopoulos@email.com',
                    'organisation': 'Athens University of Economics and Business (GR)'
                },
                {
                    'id': 1,
                    'name': 'Alejandro Aviles del Moral',
                    'email': 'ome.gak@email.com',
                    'organisation': 'Universidad de Granada (ES)'
                },
                {
                    'id': 2,
                    'name': 'Pedro Ferreira',
                    'email': 'pedro.ferreira@email.com',
                    'organisation': 'CERN'
                },
                {
                    'id': 3,
                    'name': 'Tommaso Papini',
                    'email': 'tommaso.papini@email.com',
                    'organisation': 'Università degli Studi di Firenze'
                }
            ],
            'authors': [
                {
                    'id': 2,
                    'name': 'Pedro Ferreira',
                    'email': 'pedro.ferreira@email.com',
                    'organisation': 'CERN'
                },
                {
                    'id': 3,
                    'name': 'Tommaso Papini',
                    'email': 'tommaso.papini@email.com',
                    'organisation': 'Università degli Studi di Firenze'
                },
                {
                    'id': 4,
                    'name': 'Adrian Mönnich',
                    'email': 'adrian.monnich@email.com',
                    'organisation': 'CERN'
                },
                {
                    'id': 5,
                    'name': 'Ilias Trichopoulos',
                    'email': 'ilias.trichopoulos@email.com',
                    'organisation': 'CERN'
                }
            ]
        }

    def __repr__(self):
        return '<Event {0}>'.format(self.id)

    def fetch(self, data_type):
        if data_type == 'all':
            fetched_data_duplicates = [element for element in itertools.chain.from_iterable(self.data.itervalues())]
            fetched_data = []
            for i in range(0, len(fetched_data_duplicates)):
                if fetched_data_duplicates[i] not in fetched_data_duplicates[i+1:]:
                    fetched_data.append(fetched_data_duplicates[i])
        else:
            fetched_data = self.data[data_type]
        return fetched_data
