"""API blueprint definitions.

Only JSON endpoints are defined here; the React UI consumes them via XHR.
Key conventions:
  * Each collection has GET (list) + POST (create).
  * Individual resources support GET (detail) + DELETE.
  * Patients use a composite key (Patient_ID, organ_req) reflected in URL.
  * Session-based auth: successful login seeds ``session['login']`` and
    ``session['username']``; other endpoints call ``require_login``.
  * A per-request MySQL connection is opened lazily and closed on teardown.
"""

from flask import Blueprint, request, jsonify, session, g
from flask_cors import CORS
import mysql.connector

api_bp = Blueprint("api", __name__)

# CORS enabled for development; restrict origins in production.
CORS(api_bp, supports_credentials=True)

DB_CFG = dict(host="localhost", user="root", password="your_password", database="DBMS_PROJECT")

def get_db():
    """Return a cached MySQL connection for the current request."""
    if 'db' not in g:
        g.db = mysql.connector.connect(**DB_CFG)
    return g.db

@api_bp.teardown_request
def teardown_db(exception):
    """Close the per-request DB connection if it was opened."""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def require_login():
    """Guard helper: returns a 401 response if not authenticated."""
    if not session.get('login'):
        return jsonify(error='unauthorized'), 401

def rows(cur):
    """Convert a cursor result set into a list[dict]."""
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, r)) for r in cur.fetchall()]

@api_bp.get('/ping')
def ping():
    """Health probe endpoint."""
    return jsonify(status='ok')

### Auth
@api_bp.post('/auth/login')
def login():
    data = request.get_json(silent=True) or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify(error='missing credentials'), 400
    cur = get_db().cursor(dictionary=True)
    try:
        cur.execute('SELECT username, password FROM login WHERE username=%s AND password=%s', (username, password))
        row = cur.fetchone()
        if not row:
            # Debug output (remove in production)
            print('[LOGIN] failed for', username)
            return jsonify(error='invalid credentials'), 401
        session['login'] = True
        session['username'] = row['username']
        print('[LOGIN] success for', username)
        return jsonify(message='ok', token='session', user={'username': row['username']})
    except Exception as e:
        print('[LOGIN] error', e)
        return jsonify(error='server error'), 500

@api_bp.post('/auth/logout')
def logout():
    session.clear()
    return jsonify(message='logged out')

@api_bp.get('/auth/me')
def me():
    if not session.get('login'):
        return jsonify(user=None), 401
    return jsonify(user={'username': session.get('username')})

### Users (table: User)
@api_bp.get('/users')
def users_list():
    if (r := require_login()): return r
    cur = get_db().cursor()
    cur.execute('SELECT * FROM User')
    return jsonify(rows(cur))

@api_bp.post('/users')
def users_create():
    if (r := require_login()): return r
    data = request.get_json(silent=True) or {}
    required = ['User_ID','Name','Date_of_Birth']
    missing = [f for f in required if data.get(f) in [None,'']]
    if missing:
        return jsonify(error=f"Missing required fields: {', '.join(missing)}"), 400
    # Optional / nullable fields
    fields = ['User_ID','Name','Date_of_Birth','Medical_insurance','Medical_history','Street','City','State']
    values = [data.get(f) if data.get(f) not in [''] else None for f in fields]
    try:
        cur = get_db().cursor()
        placeholders = ','.join(['%s']*len(fields))
        cur.execute(f"INSERT INTO User ({','.join(fields)}) VALUES ({placeholders})", values)
        get_db().commit()
        return jsonify(message='created', User_ID=data['User_ID']), 201
    except Exception as e:
        print('[USER CREATE] error', e)
        return jsonify(error='insert failed'), 500

@api_bp.get('/users/<int:user_id>')
def users_detail(user_id):
    if (r := require_login()): return r
    cur = get_db().cursor()
    cur.execute('SELECT * FROM User WHERE User_ID=%s', (user_id,))
    data = rows(cur)
    if not data:
        return jsonify(error='not found'), 404
    return jsonify(data[0])

@api_bp.delete('/users/<int:user_id>')
def users_delete(user_id):
    if (r := require_login()): return r
    cur = get_db().cursor()
    cur.execute('DELETE FROM User WHERE User_ID=%s', (user_id,))
    get_db().commit()
    if cur.rowcount == 0:
        return jsonify(error='not found'), 404
    return jsonify(message='deleted')

### Donors (table: Donor)
@api_bp.get('/donors')
def donors_list():
    if (r := require_login()): return r
    cur = get_db().cursor()
    cur.execute('SELECT * FROM Donor')
    return jsonify(rows(cur))

@api_bp.post('/donors')
def donors_create():
    if (r := require_login()): return r
    data = request.get_json(silent=True) or {}
    required = ['Donor_ID','organ_donated','Organization_ID','User_ID']
    missing = [f for f in required if data.get(f) in [None,'']]
    if missing:
        return jsonify(error=f"Missing required fields: {', '.join(missing)}"), 400
    fields = ['Donor_ID','organ_donated','reason_of_donation','Organization_ID','User_ID']
    values = [data.get(f) if data.get(f) not in [''] else None for f in fields]
    try:
        cur = get_db().cursor()
        placeholders = ','.join(['%s']*len(fields))
        cur.execute(f"INSERT INTO Donor ({','.join(fields)}) VALUES ({placeholders})", values)
        get_db().commit()
        return jsonify(message='created', Donor_ID=data['Donor_ID']), 201
    except Exception as e:
        print('[DONOR CREATE] error', e)
        return jsonify(error='insert failed'), 500

@api_bp.get('/donors/<int:donor_id>')
def donors_detail(donor_id):
    if (r := require_login()): return r
    cur = get_db().cursor()
    cur.execute('SELECT * FROM Donor WHERE Donor_ID=%s', (donor_id,))
    data = rows(cur)
    if not data:
        return jsonify(error='not found'), 404
    return jsonify(data[0])

@api_bp.delete('/donors/<int:donor_id>')
def donors_delete(donor_id):
    if (r := require_login()): return r
    cur = get_db().cursor()
    cur.execute('DELETE FROM Donor WHERE Donor_ID=%s', (donor_id,))
    get_db().commit()
    if cur.rowcount == 0:
        return jsonify(error='not found'), 404
    return jsonify(message='deleted')

### Patients (table: Patient)
@api_bp.get('/patients')
def patients_list():
    if (r := require_login()): return r
    cur = get_db().cursor()
    cur.execute('SELECT * FROM Patient')
    return jsonify(rows(cur))

@api_bp.post('/patients')
def patients_create():
    if (r := require_login()): return r
    data = request.get_json(silent=True) or {}
    required = ['Patient_ID','organ_req','Doctor_ID','User_ID']
    missing = [f for f in required if data.get(f) in [None,'']]
    if missing:
        return jsonify(error=f"Missing required fields: {', '.join(missing)}"), 400
    fields = ['Patient_ID','organ_req','reason_of_procurement','Doctor_ID','User_ID']
    values = [data.get(f) if data.get(f) not in [''] else None for f in fields]
    try:
        cur = get_db().cursor()
        placeholders = ','.join(['%s']*len(fields))
        cur.execute(f"INSERT INTO Patient ({','.join(fields)}) VALUES ({placeholders})", values)
        get_db().commit()
        return jsonify(message='created', Patient_ID=data['Patient_ID'], organ_req=data['organ_req']), 201
    except Exception as e:
        print('[PATIENT CREATE] error', e)
        return jsonify(error='insert failed'), 500

@api_bp.get('/patients/<int:patient_id>/<organ_req>')
def patients_detail(patient_id, organ_req):
    if (r := require_login()): return r
    cur = get_db().cursor()
    cur.execute('SELECT * FROM Patient WHERE Patient_ID=%s AND organ_req=%s', (patient_id, organ_req))
    data = rows(cur)
    if not data:
        return jsonify(error='not found'), 404
    return jsonify(data[0])

@api_bp.delete('/patients/<int:patient_id>/<organ_req>')
def patients_delete(patient_id, organ_req):
    if (r := require_login()): return r
    cur = get_db().cursor()
    cur.execute('DELETE FROM Patient WHERE Patient_ID=%s AND organ_req=%s', (patient_id, organ_req))
    get_db().commit()
    if cur.rowcount == 0:
        return jsonify(error='not found'), 404
    return jsonify(message='deleted')

@api_bp.get('/stats/summary')
def stats_summary():
    """Return simple aggregate counts for dashboard cards.

    Any individual table failure is logged and surfaced as ``null`` for that
    key instead of failing the entire response.
    """
    if (r := require_login()): return r
    cur = get_db().cursor()
    summary = {}
    for table, key in [('User','users'),('Donor','donors'),('Patient','patients'),('Transaction','matches')]:
        try:
            cur.execute(f'SELECT COUNT(*) FROM {table}')
            summary[key] = cur.fetchone()[0]
        except Exception as e:
            print('[STATS] error counting', table, e)
            summary[key] = None
    return jsonify(summary)
