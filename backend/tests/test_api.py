from fastapi.testclient import TestClient
from app.main import app, seed_data, memory
import asyncio

asyncio.run(seed_data())
client = TestClient(app)

def test_health():
    response = client.get('/api/health')
    assert response.status_code == 200

def test_doctor_login():
    response = client.post('/api/auth/login', json={'email':'doctor@tribalcare.demo','password':'Doctor@123'})
    assert response.status_code == 200
    assert response.json()['user']['role'] == 'doctor'

def test_asha_login_and_patient():
    login = client.post('/api/auth/login', json={'email':'asha@tribalcare.demo','password':'Asha@123'})
    token = login.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    response = client.post('/api/patients', headers=headers, json={'name':'Test Patient','mobile':'9000000001','village':'Test','age':30,'gender':'Female','preferred_language':'Tamil','consent':True})
    assert response.status_code == 200

def test_sms_help():
    response = client.post('/api/sms/process', json={'mobile':'9876543210','keyword':'HELP'})
    assert response.status_code == 200
    assert 'Emergency' in response.json()['response']

def test_sms_requests_route_to_responsible_users():
    users = {user['role']: user for user in memory['users']}
    response = client.post('/api/sms/process', json={'mobile':'9876543210','keyword':'APPT'})
    assert response.status_code == 200
    assert response.json()['recipient_user_ids'] == [users['asha']['id']]

    callback = client.post('/api/sms/process', json={'mobile':'9876543210','keyword':'CALL'})
    assert callback.status_code == 200
    assert callback.json()['recipient_user_ids'] == [users['admin']['id']]

    help_request = client.post('/api/sms/process', json={'mobile':'9876543210','keyword':'HELP'})
    assert help_request.status_code == 200
    assert users['asha']['id'] in help_request.json()['recipient_user_ids']
    assert users['doctor']['id'] in help_request.json()['recipient_user_ids']
    assert users['admin']['id'] not in help_request.json()['recipient_user_ids']

def test_sms_validation_and_ivr_interaction_persistence():
    invalid = client.post('/api/sms/process', json={'mobile':'123','keyword':'HELP'})
    assert invalid.status_code == 422

    interaction = client.post('/api/patient/ivr', json={
        'mobile':'9876543210', 'language':'Hindi', 'option':'6'
    })
    assert interaction.status_code == 200
    assert interaction.json()['language'] == 'Hindi'
    assert 'Kottapalli PHC' in interaction.json()['response']
    assert any(item['id'] == interaction.json()['id'] for item in memory['sms'])
    asha_id = next(user['id'] for user in memory['users'] if user['role'] == 'asha')
    assert interaction.json()['recipient_user_ids'] == [asha_id]
    assert interaction.json()['status'] == 'Received'
    assert any(item.get('request_id') == interaction.json()['id'] for item in memory['notifications'])

def test_ivr_pregnancy_and_callback_route_to_care_team():
    worker_id = next(user['id'] for user in memory['users'] if user['role'] == 'asha')
    doctor_id = next(user['id'] for user in memory['users'] if user['role'] == 'doctor')
    admin_id = next(user['id'] for user in memory['users'] if user['role'] == 'admin')
    pregnancy = client.post('/api/patient/ivr', json={
        'mobile':'9876543210', 'language':'Tamil', 'option':'3'
    })
    assert pregnancy.status_code == 200
    assert pregnancy.json()['recipient_user_ids'] == [worker_id]
    assert any(item['id'] == pregnancy.json()['id'] and item['keyword'] == 'PREGNANCY' for item in memory['sms'])

    callback = client.post('/api/patient/ivr', json={
        'mobile':'9876543210', 'language':'Kannada', 'option':'0'
    })
    assert callback.status_code == 200
    assert callback.json()['recipient_user_ids'] == [admin_id]

    emergency = client.post('/api/patient/ivr', json={
        'mobile':'9876543210', 'language':'Telugu', 'option':'1'
    })
    assert emergency.status_code == 200
    assert set(emergency.json()['recipient_user_ids']) == {worker_id, doctor_id}

def test_admin_role_can_sign_in_and_notifications_are_scoped():
    login = client.post('/api/auth/login', json={
        'email':'admin@tribalcare.demo', 'password':'Admin@123'
    })
    assert login.status_code == 200
    assert login.json()['user']['role'] == 'admin'
    headers = {'Authorization': f"Bearer {login.json()['access_token']}"}
    assert client.get('/api/admin/users', headers=headers).status_code == 200

    doctor_login = client.post('/api/auth/login', json={
        'email':'doctor@tribalcare.demo', 'password':'Doctor@123'
    })
    doctor_headers = {'Authorization': f"Bearer {doctor_login.json()['access_token']}"}
    doctor_id = next(user['id'] for user in memory['users'] if user['role'] == 'doctor')
    assert all(item['user_id'] == doctor_id for item in client.get('/api/notifications', headers=doctor_headers).json())

def test_unassigned_patient_requests_fall_back_to_admin():
    admin = next(user for user in memory['users'] if user['role'] == 'admin')
    response = client.post('/api/sms/process', json={'mobile':'9000000000','keyword':'VACCINE'})
    assert response.status_code == 200
    assert response.json()['recipient_user_ids'] == [admin['id']]

def test_request_status_changes_are_limited_to_assigned_users():
    request = client.post('/api/sms/process', json={'mobile':'9876543210','keyword':'CALL'}).json()
    asha_login = client.post('/api/auth/login', json={
        'email':'asha@tribalcare.demo', 'password':'Asha@123'
    })
    asha_headers = {'Authorization': f"Bearer {asha_login.json()['access_token']}"}
    denied = client.put(f"/api/sms/{request['id']}/status", headers=asha_headers, json={'status':'Resolved'})
    assert denied.status_code == 403

    admin_login = client.post('/api/auth/login', json={
        'email':'admin@tribalcare.demo', 'password':'Admin@123'
    })
    admin_headers = {'Authorization': f"Bearer {admin_login.json()['access_token']}"}
    updated = client.put(f"/api/sms/{request['id']}/status", headers=admin_headers, json={'status':'Resolved'})
    assert updated.status_code == 200
    assert updated.json()['status'] == 'Resolved'

def test_voice_recording_is_saved_and_original_audio_is_protected():
    upload = client.post(
        '/api/voice/upload',
        data={'patient_mobile':'9876543210'},
        files={'file':('message.webm', b'fake-audio-data', 'audio/webm')}
    )
    assert upload.status_code == 200
    item = upload.json()
    assert item['size'] == len(b'fake-audio-data')
    assert 'audio_base64' not in item

    doctor_login = client.post('/api/auth/login', json={
        'email':'doctor@tribalcare.demo', 'password':'Doctor@123'
    })
    headers = {'Authorization': f"Bearer {doctor_login.json()['access_token']}"}
    messages = client.get('/api/voice/messages', headers=headers).json()
    assert any(message['id'] == item['id'] for message in messages)
    playback = client.get(f"/api/voice/messages/{item['id']}/audio", headers=headers)
    assert playback.status_code == 200
    assert playback.content == b'fake-audio-data'
