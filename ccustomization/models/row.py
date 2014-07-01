from ..core import db

DEFAULT_ROWS = 8
DEFAULT_COLS = 4

# how to model widgets spanning multiple rows?


class Row(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    columns = db.Column(db.Integer, default=DEFAULT_COLS, nullable=False)
    elements = []

    def __init__(self, columns):
        self.columns = columns
        for i in range(0, columns):
            self.elements.append((None, 1))

    def has_valid_length(self):
        count = 0
        for element in self.elements:
            count += element[1]
        if count != self.columns:
            return False
        return True

    def is_empty(self):
        for element in self.elements:
            if element[0] is not None:
                return False
        return True
