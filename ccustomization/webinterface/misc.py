import copy
import inspect
import json
import os
import re
import time

import markdown
from flask import render_template, redirect, url_for, jsonify, request, Markup, g, current_app
from sqlalchemy.exc import SQLAlchemyError

from ..core import db
from ..menu import menu, breadcrumb, make_breadcrumb
from ..models import Event, Page
from . import bp

counter = 0


@bp.route('/')
@menu('index')
def index():
    conference = Event.query.first()
    if conference is None or Page.query.filter_by(id=conference.main_page_id).first() is None:
        db.drop_all()
        db.create_all()
        conference = Event()
        db.session.add(conference)
        db.session.commit()
        page = Page(event_id=conference.id)
        db.session.add(page)
        db.session.commit()
        conference.main_page_id = page.id
        db.session.commit()
    wvars = {
        'main_page_id': conference.main_page_id,
        'page_id': conference.main_page_id
    }
    return render_template('index.html', **wvars)


def render_serialization(content, edit):
    page_content = copy.deepcopy(content)
    for first_lvl_cnt in page_content['content']:
        for second_lvl_cnt in first_lvl_cnt['content']:
            for i, widget in enumerate(second_lvl_cnt['content']):
                second_lvl_cnt['content'][i] = render_widget(widget, edit)
    return page_content


@bp.route('/edit/<int:id>')
@menu('edit')
def edit(id):
    page = Page.query.filter_by(id=id).first_or_404()
    global counter
    counter = 0
    wvars = {
        'mainCnt': render_serialization(page.content, True),
        'page_id': id,
        'edit': True
    }
    return render_template('edit.html', **wvars)


@bp.route('/edit/<int:id>', methods=('PATCH',))
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


@bp.route('/view/<int:id>')
@menu('view')
def view(id):
    page = Page.query.filter_by(id=id).first_or_404()
    global counter
    counter = 0
    wvars = {
        'mainCnt': render_serialization(page.content, False),
        'page_id': id,
        'edit': False
    }
    return render_template('view.html', **wvars)


def render_widget(settings, edit):
    global counter
    counter += 1
    wvars = {
        'settings': settings,
        'edit': edit,
        'counter': counter
    }
    if settings['type'] == 'box' and wvars.get('settings', {}).get('content', None):
        wvars['settings']['render_content'] = Markup(markdown.markdown(wvars['settings']['content']))
    elif settings['type'] == 'people':
        wvars['icon_url'] = os.path.join(str(current_app.static_url_path), 'pics/glyphicons_003_user.png')
    return render_template('widgets/{0}.html'.format(settings['type']), **wvars)


@bp.route('/render/', methods=('POST',))
def render():
    data = request.get_json()
    return render_widget(data['settings'], data['edit'])


def fetch_data(page_id, data_type):
    page = Page.query.filter_by(id=page_id).first_or_404()
    event = Event.query.filter_by(id=page.event_id).first_or_404()
    return event.fetch(data_type)


@bp.route('/fetch/<int:id>')
def fetch(id):
    data_type = request.args['data_type']
    query = request.args['query'].lower()
    fetched_data = fetch_data(id, data_type)
    matching_data = [data for data in fetched_data if query in data['name'].lower()]
    return jsonify(data=matching_data)


@bp.route('/upload/', methods=('POST',))
def upload():
    picture = request.files['file']
    file_name, file_extension = os.path.splitext(picture.filename)
    file_url = 'pics/{0}{1}'.format(time.time(), file_extension)
    try:
        picture.save(os.path.join(str(current_app.static_folder), file_url))
    except IOError:
        return jsonify(), 400
    return os.path.join(str(current_app.static_url_path), file_url)
