#!/usr/bin/env python3
"""
Quick demo of the Game Session API
Run the server first: python game_api.py
Then run this: python game_client_demo.py
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_game_api():
    print("🎮 Testing Simple Game API\n")
    
    try:
        # Test if server is running
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Server is running: {response.json()['message']}\n")
        
        # 1. Create session
        print("1️⃣  Creating game session...")
        response = requests.post(f"{BASE_URL}/create-session")
        session_data = response.json()
        session_id = session_data["session_id"]
        print(f"   📝 Session ID: {session_id}\n")
        
        # 2. Add users
        print("2️⃣  Adding players...")
        players = ["Alice", "Bob"]
        user_ids = {}
        
        for name in players:
            response = requests.post(f"{BASE_URL}/add-user-to-session", 
                                   json={"name": name, "session_id": session_id})
            if response.status_code == 200:
                user_data = response.json()
                user_ids[name] = user_data["user_id"]
                print(f"   👤 {name} joined (ID: {user_data['user_id']})")
            else:
                print(f"   ❌ Failed to add {name}: {response.text}")
        
        print()
        
        # 3. Play questions
        for round_num in range(3):
            print(f"🎯 Question {round_num + 1}")
            
            # Get question
            response = requests.get(f"{BASE_URL}/next-question/{session_id}")
            if response.status_code != 200:
                print("   🏁 No more questions!")
                break
                
            question = response.json()
            if question.get("finished"):
                print("   🏁 Game finished!")
                break
                
            print(f"   ❓ {question['question']}")
            for i, option in enumerate(question['options']):
                print(f"      {i}. {option}")
            
            # Players submit answers
            import random
            for name, user_id in user_ids.items():
                answer = random.randint(0, 3)
                response = requests.post(f"{BASE_URL}/answer", 
                                       json={
                                           "session_id": session_id,
                                           "user_id": user_id,
                                           "answer": answer
                                       })
                
                if response.status_code == 200:
                    result = response.json()
                    status = "✅" if result["correct"] else "❌"
                    print(f"   {name}: chose option {answer} {status} (Score: {result['new_score']})")
                else:
                    print(f"   ❌ {name} failed to submit answer")
            
            # Show current scores
            response = requests.get(f"{BASE_URL}/scores/{session_id}")
            if response.status_code == 200:
                scores_data = response.json()
                print(f"   📊 Scoreboard:")
                for entry in scores_data["scores"]:
                    print(f"      🏆 {entry['name']}: {entry['score']} points")
            
            # Advance to next question
            requests.post(f"{BASE_URL}/advance-question/{session_id}")
            print()
        
        # Final scores
        print("🏁 Final Results:")
        response = requests.get(f"{BASE_URL}/scores/{session_id}")
        if response.status_code == 200:
            scores_data = response.json()
            for i, entry in enumerate(scores_data["scores"]):
                medal = ["🥇", "🥈", "🥉"][i] if i < 3 else "🏅"
                print(f"   {medal} {entry['name']}: {entry['score']} points")
        
        print("\n✨ Demo completed successfully!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Server not running! Start it with: python game_api.py")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_game_api()
