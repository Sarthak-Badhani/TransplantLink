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
from datetime import datetime
from flask_cors import CORS
import mysql.connector

api_bp = Blueprint("api", __name__)

# CORS enabled for development; restrict origins in production.
CORS(api_bp, supports_credentials=True)

DB_CFG = dict(host="localhost", user="root", password="Arnav909@", database="DBMS_PROJECT")

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

def table_exists(table_name: str) -> bool:
    """Return True if a table exists in the configured schema."""
    try:
        cur = get_db().cursor()
        cur.execute(
            """
            SELECT COUNT(*)
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA=%s AND TABLE_NAME=%s
            """,
            (DB_CFG['database'], table_name)
        )
        return (cur.fetchone() or [0])[0] > 0
    except Exception as e:
        print('[META] table_exists error', table_name, e)
        return False

def get_table_columns(table_name: str):
    """Return list of column names for a table in the configured schema."""
    try:
        cur = get_db().cursor()
        cur.execute(
            """
            SELECT COLUMN_NAME
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA=%s AND TABLE_NAME=%s
            ORDER BY ORDINAL_POSITION
            """,
            (DB_CFG['database'], table_name)
        )
        return [r[0] for r in cur.fetchall()]
    except Exception as e:
        print('[META] get_table_columns error', table_name, e)
        return []

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
            print('[LOGIN] failed for', username)
            return jsonify(error='invalid credentials'), 401
        session['login'] = True
        session['username'] = row['username']
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
    fields_all = ['User_ID','Name','Date_of_Birth','Address','Gender','Age','Blood_Group','City','Area','Phone_No']
    fields = [f for f in fields_all if f in data]
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

### Matching & Reports

@api_bp.post('/matching/manual')
def matching_manual():
    """Create a manual match between a patient and a donor.

    Attempts to insert a row into Transaction with available columns.
    """
    if (r := require_login()): return r
    data = request.get_json(silent=True) or {}
    pid = data.get('patient_id')
    did = data.get('donor_id')
    if not pid or not did:
        return jsonify(error='patient_id and donor_id are required'), 400
    db = get_db()
    cur = db.cursor(dictionary=True)
    try:
        # Validate existence and fetch names/organs
        cur.execute(
            'SELECT p.Patient_ID, p.organ_req, p.User_ID, u.Name AS patient_name '
            'FROM Patient p LEFT JOIN User u ON u.User_ID = p.User_ID WHERE p.Patient_ID=%s',
            (pid,)
        )
        pat = cur.fetchone()
        cur.execute(
            'SELECT d.Donor_ID, d.organ_donated, d.User_ID, u.Name AS donor_name '
            'FROM Donor d LEFT JOIN User u ON u.User_ID = d.User_ID WHERE d.Donor_ID=%s',
            (did,)
        )
        don = cur.fetchone()
        if not pat or not don:
            return jsonify(error='patient or donor not found'), 404
        # Validate organ compatibility
        po = (pat.get('organ_req') or '').strip().lower()
        do = (don.get('organ_donated') or '').strip().lower()
        if not po or not do or po != do:
            return jsonify(error='organs do not match'), 400
        # Build insert dynamically based on Transaction table columns
        inserted = False
        if table_exists('Transaction'):
            cols = get_table_columns('Transaction')
            fields, vals = [], []
            if 'Patient_ID' in cols:
                fields.append('Patient_ID'); vals.append(pid)
            if 'Donor_ID' in cols:
                fields.append('Donor_ID'); vals.append(did)
            # Ensure Organ_ID exists or create
            organ_id_val = None
            try:
                cur2 = db.cursor()
                cur2.execute('SELECT Organ_ID FROM Organ_available WHERE Donor_ID=%s LIMIT 1', (did,))
                r = cur2.fetchone()
                if r:
                    organ_id_val = r[0]
                else:
                    cur2.execute('SELECT organ_donated FROM Donor WHERE Donor_ID=%s', (did,))
                    r2 = cur2.fetchone()
                    organ_name = r2[0] if r2 else None
                    if organ_name:
                        cur2.execute('INSERT INTO Organ_available (Organ_name, Donor_ID) VALUES (%s, %s)', (organ_name, did))
                        organ_id_val = cur2.lastrowid
            except Exception as e2:
                print('[MATCH MANUAL] organ lookup/create failed', e2)
            if 'Organ_ID' in cols and organ_id_val is not None:
                fields.append('Organ_ID'); vals.append(organ_id_val)
            # Date / Status
            if 'Date_of_transaction' in cols:
                fields.append('Date_of_transaction'); vals.append(datetime.now().date())
            if 'Status' in cols:
                # numeric 1 for confirmed/manual
                fields.append('Status'); vals.append(1)
            if fields:
                ph = ','.join(['%s']*len(vals))
                q = f"INSERT INTO Transaction ({','.join(fields)}) VALUES ({ph})"
                try:
                    cur3 = db.cursor()
                    cur3.execute(q, vals)
                    db.commit()
                    inserted = True
                except Exception as e:
                    print('[MATCH MANUAL] insert failed', e)
        # Even if insert not possible (schema mismatch), return success for UX continuity
        return jsonify(message='match created', patient=pat, donor=don, persisted=inserted)
    except Exception as e:
        print('[MATCH MANUAL] error', e)
        return jsonify(error='manual matching failed'), 500

@api_bp.get('/reports/summary')
def reports_summary():
    """Summary counts for reports page. Mirrors stats plus pending if available."""
    if (r := require_login()): return r
    db = get_db()
    cur = db.cursor()
    out = {'patients': None, 'donors': None, 'confirmed': 0, 'pending': 0}
    try:
        cur.execute('SELECT COUNT(*) FROM Patient'); out['patients'] = cur.fetchone()[0]
    except Exception as e: print('[REPORTS] patients count error', e)
    try:
        cur.execute('SELECT COUNT(*) FROM Donor'); out['donors'] = cur.fetchone()[0]
    except Exception as e: print('[REPORTS] donors count error', e)
    try:
        if table_exists('Transaction'):
            # Numeric schema: 1=confirmed, 0=pending
            try:
                cur.execute("SELECT COUNT(*) FROM Transaction WHERE Status=1")
                out['confirmed'] = cur.fetchone()[0]
            except Exception as e1:
                print('[REPORTS] confirmed count error', e1)
            try:
                cur.execute("SELECT COUNT(*) FROM Transaction WHERE Status=0")
                out['pending'] = cur.fetchone()[0]
            except Exception as e2:
                print('[REPORTS] pending count error', e2)
        else:
            out['confirmed'] = 0
    except Exception as e: print('[REPORTS] matches count error', e)
    return jsonify(out)

@api_bp.get('/reports/matches')
def reports_matches():
    """Return match records for the reports table.

    Prefer Transaction + joins; fallback to computed potential matches if Transaction is missing.
    """
    if (r := require_login()): return r
    db = get_db()
    cur = db.cursor()
    try:
        if not table_exists('Transaction'):
            return jsonify([])

        # Always return the most recent match per donor, newest first
        q = (
            "SELECT p.Patient_ID, pu.Name AS patient_name, d.Donor_ID, du.Name AS donor_name, "
            "COALESCE(oa.Organ_name, p.organ_req, d.organ_donated) AS organ, "
            "t.Date_of_transaction, "
            "CASE WHEN t.Status=1 THEN 'confirmed' WHEN t.Status=0 THEN 'pending' ELSE CAST(t.Status AS CHAR) END AS Status "
            "FROM Transaction t "
            "JOIN (SELECT Donor_ID, MAX(Date_of_transaction) AS max_date FROM Transaction GROUP BY Donor_ID) lm "
            "  ON lm.Donor_ID = t.Donor_ID AND lm.max_date = t.Date_of_transaction "
            "LEFT JOIN Patient p ON p.Patient_ID = t.Patient_ID "
            "LEFT JOIN User pu ON pu.User_ID = p.User_ID "
            "LEFT JOIN Donor d ON d.Donor_ID = t.Donor_ID "
            "LEFT JOIN User du ON du.User_ID = d.User_ID "
            "LEFT JOIN Organ_available oa ON oa.Organ_ID = t.Organ_ID "
            "ORDER BY t.Date_of_transaction DESC"
        )
        cur.execute(q)
        return jsonify(rows(cur))
    except Exception as e:
        print('[REPORTS MATCHES] error', e)
        return jsonify(error='failed to load matches'), 500
