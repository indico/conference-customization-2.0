from sqlalchemy.types import TypeDecorator

DEFAULT_ROWS = 8
DEFAULT_COLS = 4


class Row(object):
    columns = DEFAULT_COLS
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


class Grid(TypeDecorator):
    rows_n = DEFAULT_ROWS
    columns_n = DEFAULT_COLS
    rows = []

    def __init__(self, columns=DEFAULT_COLS):
        self.columns_n = columns
        for i in range(0, self.rows_n):
            self.rows.append(Row(columns))
