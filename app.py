import os
from os import path
from os import sys
from flask import Flask, send_from_directory, json, jsonify, request, Response
from dotenv import load_dotenv, find_dotenv
from google.cloud import storage
from flask_socketio import SocketIO
from flask_cors import CORS
from werkzeug.utils import secure_filename
from flask_sqlalchemy import SQLAlchemy
from random import sample
import model

load_dotenv(find_dotenv())  # This is to load your env variables from .env

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

APP = Flask(__name__, static_folder='./build/static')

CORS = CORS(APP, resources={r"/*": {"origins": "*"}})

SOCKETIO = SocketIO(APP,
                    cors_allowed_origins="*",
                    json=json,
                    manage_session=False)

DB = SQLAlchemy(APP)

# Point SQLAlchemy to your Heroku database
APP.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
# Gets rid of a warning
APP.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

GBUCKET = 'cs490-testbucket'

User = model.define_user_class(DB)
Pool = model.define_pool_class(DB)
Image = model.define_image_class(DB)
PoolItem = model.define_poolitem_class(DB)
ImageTag = model.define_imagetag_class(DB)

#SOCKETIO = SocketIO(APP,
#                    cors_allowed_origins="*",
#                    json=json,
#                    manage_session=False)

def add_user(new_username, new_password):
    new_user = User(username=new_username, password=new_password)
    DB.session.add(new_user)
    DB.session.commit()
    return True


def add_pool(pool_name, username):
    try:
        new_pool = Pool(pool_name=pool_name, username=username)
        DB.session.add(new_pool)
        DB.session.commit()
        return True
    finally:
        return False


def add_image(image_name, image_url, pool_name):
    new_image = Image(image_name=image_name, image_url=image_url)
    DB.session.add(new_image)
    DB.session.commit()
    item_id = new_image.image_id
    new_item = PoolItem(pool_name=pool_name, image_id=item_id)
    DB.session.add(new_item)
    DB.session.commit()
    return item_id

def reassign_image(image_id, pool_name):
    try:
        new_item = PoolItem(pool_name=pool_name, image_id=image_id)
        DB.session.add(new_item)
        DB.session.commit()
        return True
    finally:
        return False

def add_tag(tag_name, image_id):
    new_tag = ImageTag(tag=tag_name, image_id=image_id)
    DB.session.add(new_tag)
    DB.session.commit()
    return tag_name

def get_images_by_tag(tag_name):
    print("tag search")
    images_with_tag = ImageTag.query.filter_by(tag=tag_name).all()
    print(images_with_tag)
    image_search = []
    for image in images_with_tag:
        image_search.append(image_url_url(Image.query.get(image.image_id).image_url))
        print(image_search)
    return image_search

def get_images(pool_name):
    temp = PoolItem.query.filter_by(pool_name=pool_name).all()
    pool_images = []
    for i in temp:
        pool_images.append(image_url_url(Image.query.get(i.image_id).image_url))
    return pool_images

def get_images_by_name(search_text):
    all_images = Image.query.all()
    image_search = []
    for image in all_images:
        if search_text.lower() in image.image_name.lower():
            image_search.append(image_url_url(image.image_url))
    return image_search

def image_exists(name):
    all_images = Image.query.all()
    for image in all_images:
        if image.image_name == name:
            return True
    return False

def user_exists(username):
    all_users = User.query.all()
    print(all_users)
    for user in all_users:
        if user.username == username:
            return True
    return False

def get_random_images(ammount):
    urls = []
    images = Image.query.all()
    for i in images:
        urls.append(image_url_url(i.image_url))
    if len(images) > ammount:
        urls = sample(urls, ammount)

    print(urls)
    return urls

def get_pools(user_name):
    temp = Pool.query.filter_by(username=user_name).all()
    pools = []
    for i in temp:
        pools.append(i.pool_name)
    return pools

def get_all_pools():
    temp = Pool.query.all()
    pools = []
    for i in temp:
        pools.append(i.pool_name)
    return pools

def get_owner(pool_name):
    temp = Pool.query.all()
    owner = ''
    for pool in temp:
        if pool.pool_name == pool_name:
            owner = pool.username
            break
    return owner

def image_url_url(image_url):
    global GBUCKET
    return 'https://storage.googleapis.com/' + GBUCKET + '/' + image_url
    
def get_bucket_name():
    global GBUCKET
    return GBUCKET

def check_login(username, password):
    query = User.query.filter_by(username=username).first()
    if query is None:
        return False
    return password == query.password

@APP.route('/', defaults={"filename": "index.html"})
@APP.route('/<path:filename>')
def index(filename):
    return send_from_directory('./build', filename)


@APP.route('/saveImage', methods=['POST'])
def upload_image():
    print('image received')
    print(request.form['tags'])
    global GBUCKET
    curr_pool_name = ''
    if 'poolName' in request.form.keys():
        curr_pool_name = request.form['poolName']
    curr_username = ''
    if 'username' in request.form.keys():
        curr_username = request.form['username']
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(GBUCKET)
    img = request.files['myFile']
    image_name = img.filename
    image_name = format_image(image_name)
    print(curr_pool_name)
    print(image_name)
    image_id = add_image(image_name, image_name, curr_pool_name)
    if 'tags' in request.form.keys():
        tag_list = request.form['tags'].split(',')
        for i in tag_list:
            print(i)
            add_tag(i, image_id)
    img.save(secure_filename(image_name))
    blob = bucket.blob(secure_filename(image_name))
    blob.upload_from_filename(secure_filename(image_name))
    os.remove(secure_filename(image_name))
    blob.make_public()
    print(image_url_url(secure_filename(img.filename)))
    return image_url_url(secure_filename(img.filename))


def format_image(image_name):
    if(image_exists(image_name)):
        index = image_name.rfind('.')
        image_name = image_name[:index] + '1' + image_name[index:]
    while(image_exists(image_name)):
        index = image_name.rfind('.')
        image_name = image_name[:index-1] + str(int(image_name[index-1])+1) + image_name[index:]
    return image_name
    
@SOCKETIO.on('connect')
def on_connect():
    """Triggered when a user connects"""

    print('User connected')


@SOCKETIO.on('disconnect')
def on_disconnect():
    """Triggered when a user disconnects"""

    print('User disconnected')


@SOCKETIO.on('login')
def on_login(data):
    """Triggered when a user logs in"""

    print("Login")

    username = str(data['user'])
    password = str(data['password'])

    sid = request.sid

    result = check_login(username, password)

    if result:
        SOCKETIO.emit('loginSuccess', {'username':username}, room=sid)
    else:
        SOCKETIO.emit('loginFailed', {}, room=sid)


@SOCKETIO.on('newUser')
def on_new_user(data):
    """Triggered when a user adds an account"""

    print("New User")

    username = str(data['user'])
    password = str(data['password'])

    sid = request.sid

    try:
        result = add_user(username, password)
        print(result)
        SOCKETIO.emit('loginSuccess', {'username':username}, room=sid)
    except:
        SOCKETIO.emit('newUserFailed', {}, room=sid)


@SOCKETIO.on('viewpools')
def on_view_pools(data):
    sid = request.sid
    all_pools = get_all_pools()
    SOCKETIO.emit('response', {'poolList' : all_pools}, room=sid)


@SOCKETIO.on('fetchPools')
def on_fetch_pools(data):
    sid = request.sid
    response = get_pools(str(data['username']))
    SOCKETIO.emit('list pools', {'poolList' : response}, room=sid)
    print('fetched pools')

@SOCKETIO.on('fetchImages')
def on_fetch_images(data):
    sid = request.sid
    response = get_images(str(data['pool']))
    SOCKETIO.emit('list images', {
        'imageList' : response, 'owner': get_owner(data['pool'])
    }, room=sid)
    print('fetched images')

@SOCKETIO.on('newPool')
def on_new_pool(data):
    add_pool(str(data['pool_name']), str(data['username']))

@SOCKETIO.on('search')
def on_search(data):
    search_text = data["searchText"]
    option = data["option"]
    sid = request.sid
    image_data = []
    if option == 'Username':
        pools_for_username = get_pools(search_text)
        for pool_name in pools_for_username:
            image_data.append(get_images(pool_name))
    elif option == 'Pool':
        image_data.append(get_images(search_text))
    elif option == 'Image Name':
        image_data.append(get_images_by_name(search_text))
    elif option == 'Tag':
        image_data.append(get_images_by_tag(search_text))
    elif option == 'Random Images':
        image_data.append(get_random_images(int(search_text)))

    print(image_data)
    SOCKETIO.emit('search results', {'imageList' : image_data}, room=sid)



SOCKETIO.run(
        APP,
        host=os.getenv('IP', '0.0.0.0'),
        port=8081 if os.getenv('C9_PORT') else int(os.getenv('PORT', default='8081')),
    )
