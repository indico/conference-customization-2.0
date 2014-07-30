import inspect
import json
import re

from flask import render_template, redirect, url_for, jsonify, request, Markup
import markdown
from sqlalchemy.exc import SQLAlchemyError

from ..core import db
from ..layout import widgets
from ..models import Event, Page
from . import bp


@bp.route('/')
def index():
    conference = Event.query.first()
    if conference is None or Page.query.filter_by(id=conference.main_page_id).first() is None:
        db.drop_all()
        db.create_all()
        page = Page()
        db.session.add(page)
        db.session.commit()
        conference = Event(page.id)
        db.session.add(conference)
        db.session.commit()
    wvars = {
        'main_page_id': conference.main_page_id
    }
    return render_template('index.html', **wvars)


@bp.route('/edit/<id>')
def edit(id):
    page = Page.query.filter_by(id=id).first_or_404()
    page_content = {}
    for col in page.content:
        page_content[col] = []
        for container in page.content[col]:
            new_container = []
            page_content[col].append(new_container)
            for widget in container:
                new_container.append(render_widget(widget, True))
    wvars = {
        'cols': page.columns,
        'content': page_content,
        'page_id': id
    }
    return render_template('edit.html', **wvars)


@bp.route('/edit/<id>', methods=('PATCH',))
def update(id):
    page = Page.query.filter_by(id=id).first_or_404()
    page.content = request.get_json()
    page.columns = len(page.content)
    try:
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify(error=str(e)), 400
    return jsonify()


@bp.route('/view/<id>')
def view(id):
    page = Page.query.filter_by(id=id).first_or_404()
    page_content = {}
    for col in page.content:
        page_content[col] = []
        for container in page.content[col]:
            new_container = []
            page_content[col].append(new_container)
            for widget in container:
                new_container.append(render_widget(widget))
    wvars = {
        'cols': page.columns,
        'content': page_content,
        'page_id': id
    }
    return render_template('view.html', **wvars)


def render_widget(settings, edit=False):
    wvars = {
        'settings': settings,
        'edit': edit
    }
    if settings['type'] == 'Box':
        if wvars.get('settings', {}).get('content', None):
            wvars['settings']['render_content'] = Markup(markdown.markdown(wvars['settings']['content']))
        return render_template('widgets/box.html', **wvars)
    elif settings['type'] == 'Location':
        return render_template('widgets/location.html', **wvars)
    elif settings['type'] == 'People':
        return render_template('widgets/people.html', **wvars)
    return None


@bp.route('/render/', methods=('POST',))
def render():
    data = request.get_json()
    return render_widget(data['settings'], data['edit'])
