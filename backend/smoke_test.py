import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

def test_full_flow():
    print("🚀 Starting E2E Smoke Test...")

    # 1. Setup Admin session (assuming admin/admin exists or using a created one)
    # For testing, we might need to create a superuser or use a specific one.
    # Let's assume we can register a user and manually promote to ADMIN via DB for this script if needed,
    # or just use the registration flow.
    
    print("\n--- 1. User Registration ---")
    
    # Register Participant
    p_data = {
        "username": f"user_{int(time.time())}",
        "email": f"user_{int(time.time())}@test.com",
        "password": "Password123!",
        "role": "PARTICIPANT",
        "has_accepted_terms": True
    }
    resp = requests.post(f"{BASE_URL}/users/register/", json=p_data)
    if resp.status_code != 201:
        print(f"❌ Failed to register participant: {resp.text}")
        return
    print("✅ Participant registered.")

    # Login Participant
    resp = requests.post(f"{BASE_URL}/users/login/", json={
        "username": p_data["username"],
        "password": p_data["password"]
    })
    p_token = resp.json()["access"]
    p_headers = {"Authorization": f"Bearer {p_token}"}
    print("✅ Participant logged in.")

    # Register Judge
    j_data = {
        "username": f"judge_{int(time.time())}",
        "email": f"judge_{int(time.time())}@test.com",
        "password": "Password123!",
        "role": "JUDGE",
        "has_accepted_terms": True
    }
    requests.post(f"{BASE_URL}/users/register/", json=j_data)
    resp = requests.post(f"{BASE_URL}/users/login/", json={
        "username": j_data["username"],
        "password": j_data["password"]
    })
    j_token = resp.json()["access"]
    j_headers = {"Authorization": f"Bearer {j_token}"}
    print("✅ Judge registered and logged in.")

    print("\n--- 2. Health Check ---")
    resp = requests.get(f"{BASE_URL}/monitoring/health/")
    if resp.status_code == 200:
        print("✅ Health check passed.")
    else:
        print(f"❌ Health check failed: {resp.text}")

    print("\n--- 3. Hackathon Management ---")
    # Need Admin for this. For smoke test purposes, I'll try to create a team in an existing hackathon
    # or check if I can create one.
    
    # Get Hackathons
    resp = requests.get(f"{BASE_URL}/hackathons/", headers=p_headers)
    hackathons = resp.json()
    if not hackathons:
        print("⚠️ No hackathons found. Skipping flow dependent on hackathons.")
        # In a real environment, I'd create one here if I had admin tokens.
        return
    
    h_id = hackathons[0]['id']
    print(f"✅ Found hackathon: {hackathons[0]['title']} (ID: {h_id})")

    print("\n--- 4. Team Flow ---")
    t_data = {
        "name": f"Team {int(time.time())}",
        "hackathon": h_id
    }
    resp = requests.post(f"{BASE_URL}/teams/", json=t_data, headers=p_headers)
    if resp.status_code == 201:
        team_id = resp.json()['id']
        print(f"✅ Team created: {t_data['name']}")
    else:
        print(f"❌ Failed to create team: {resp.text}")
        return

    print("\n--- 5. Submission Flow ---")
    s_data = {
        "team": team_id,
        "title": "My Awesome Project",
        "description": "This project solves everything.",
        "repository_url": "https://github.com/test/test",
        "video_url": "https://youtube.com/test"
    }
    resp = requests.post(f"{BASE_URL}/submissions/", json=s_data, headers=p_headers)
    if resp.status_code == 201:
        submission_id = resp.json()['id']
        print("✅ Project submitted.")
    else:
        print(f"❌ Failed to submit project: {resp.text}")
        return

    print("\n--- 5.5 Assign Judge to Hackathon (Admin Action) ---")
    import subprocess
    cmd = f"backend/venv/bin/python backend/manage.py shell -c \"from apps.hackathons.models import Hackathon; from apps.users.models import User; h = Hackathon.objects.get(id={h_id}); j = User.objects.get(username='{j_data['username']}'); h.judges.add(j)\""
    subprocess.run(cmd, shell=True, check=True)
    print(f"✅ Judge {j_data['username']} assigned to Hackathon.")

    print("\n--- 6. Evaluation Flow ---")
    # To evaluate, the judge must be assigned to the hackathon.
    # This usually requires Admin action. 
    # Let's check if the judge can see the hackathon.
    
    # Get criteria for the hackathon
    resp = requests.get(f"{BASE_URL}/evaluations/criteria/?hackathon_id={h_id}", headers=j_headers)
    criteria = resp.json()
    if not criteria:
        print("⚠️ No criteria found for hackathon. Cannot evaluate.")
    else:
        print(f"✅ Found {len(criteria)} criteria.")
        
        # Prepare scores
        scores = [{"criterion_id": c['id'], "value": 8.5} for c in criteria]
        e_data = {
            "submission_id": submission_id,
            "scores": scores,
            "comments": "Great work!"
        }
        resp = requests.post(f"{BASE_URL}/evaluations/evaluations/", json=e_data, headers=j_headers)
        if resp.status_code == 201:
            print("✅ Evaluation submitted.")
        elif resp.status_code == 403:
            print("ℹ️ Judge not assigned to hackathon (Expected behavior if not assigned by Admin).")
        else:
            print(f"❌ Evaluation failed: {resp.text}")

    print("\n--- 7. Ranking ---")
    resp = requests.get(f"{BASE_URL}/evaluations/ranking/{h_id}/", headers=p_headers)
    if resp.status_code == 200:
        print(f"✅ Ranking retrieved. Top team: {resp.json()[0]['team_name']}")
    else:
        print(f"❌ Failed to retrieve ranking: {resp.text}")

    print("\n--- 8. Audit Logs (Admin only) ---")
    # This will fail for participant
    resp = requests.get(f"{BASE_URL}/monitoring/logs/", headers=p_headers)
    if resp.status_code == 403:
        print("✅ Audit logs correctly restricted to Admin.")
    else:
        print(f"❌ Audit logs permission bug! Status: {resp.status_code}")

    print("\n🚀 E2E Smoke Test Finished.")

if __name__ == "__main__":
    test_full_flow()
