class Content(object):

    def __init__(self, data, img_src=None, description=None, action=None):
        self.data = data
        self.img_src = img_src
        self.description = description
        self.action = action


class _Widget(object):
    default_title = 'Widget'

    def __init__(self, title=None, width=1, height=1, content=None):
        self.title = title or self.default_title
        self.width = width
        self.height = height
        self.content = content or []


class _GenericWidget(_Widget):
    typical_applications = ()


class _DedicatedWidget(_Widget):
    pass


class List(_GenericWidget):
    default_title = 'List'
    typical_applications = (
        'Main topics', 'External links', 'Sponsors', 'Related events', 'People involved', 'Useful information',
        'News and warnings', 'Testimonials'
    )


class Carousel(_GenericWidget):
    default_title = 'Carousel'
    typical_applications = (
        'Main topics', 'Sponsors', 'Photo gallery', 'Related events', 'Useful information', 'Testimonials'
    )


class Box(_GenericWidget):
    default_title = 'Box'
    typical_applications = (
        'Description', 'Poster', 'Registration info', 'Useful information', 'News and warnings'
    )


class ImportantDates(_DedicatedWidget):
    default_title = 'Important dates'

    def __init__(self, *args, **kwargs):
        if 'content' not in kwargs:
            kwargs['content'] = self.get_dates()
        super(ImportantDates, self).__init__(self, *args, **kwargs)

    def get_dates(self):  # TODO!!
        return []


class Location(_DedicatedWidget):
    default_title = 'Location'

    def __init__(self, *args, **kwargs):
        if 'content' not in kwargs:
            kwargs['content'] = self.get_location()
        super(Location, self).__init__(self, *args, **kwargs)

    def get_location(self):  # TODO!!
        return []


class Material(_DedicatedWidget):
    default_title = 'Material'

    def __init__(self, material_type='contributions', *args, **kwargs):
        self.material_type = material_type
        if 'content' not in kwargs:
            kwargs['content'] = self.get_material(material_type)
        super(Material, self).__init__(self, *args, **kwargs)

    def get_material(self):  # TODO!!
        return []


class PeopleInvolved(_DedicatedWidget):
    default_title = 'People involved'

    def __init__(self, people_type='speakers', *args, **kwargs):
        self.people_type = people_type
        if 'content' not in kwargs:
            kwargs['content'] = self.get_people(people_type)
        super(PeopleInvolved, self).__init__(self, *args, **kwargs)

    def get_people(self):  # TODO!!
        return []


class SocialMediaShare(_DedicatedWidget):
    default_title = 'Social media share'


class SocialMediaNews(_DedicatedWidget):
    default_title = 'Social media news'


class Menu(_DedicatedWidget):
    default_title = 'Menu'


class Title(_DedicatedWidget):
    default_title = 'Title'


class Timetable(_DedicatedWidget):
    default_title = 'Timetable'
