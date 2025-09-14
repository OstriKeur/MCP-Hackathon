#!/usr/bin/env python3
"""
Enhanced demo of the Game Session API with AI-generated questions

Requirements:
1. Run the server first: python game_api.py
2. Set MISTRAL_API_KEY environment variable for AI questions (optional)

Usage:
- Test multiple themes: python game_client_demo.py
- Test specific theme: python game_client_demo.py "your custom theme"

Features tested:
- AI-generated questions based on themes
- Fallback to default questions if AI unavailable
- Dynamic question count
- Real-time scoring
- Multiple player support
"""

import requests
import json
import time

BASE_URL = "https://mcp-hackathon-291854097819.europe-west1.run.app/"#"http://localhost:8000"

def test_single_game(theme="general knowledge"):
    """Test a single game session with a specific theme"""
    print(f"🎮 Testing Game API with theme: '{theme}'\n")
    
    try:
        # Test if server is running
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Server is running: {response.json()['message']}\n")
        
        # 1. Create session with theme
        print("1️⃣  Creating game session...")
        response = requests.post(f"{BASE_URL}/create-session", 
                               json={"theme": theme})
        session_data = response.json()
        session_id = session_data["session_id"]
        print(f"   📝 Session ID: {session_id}")
        print(f"   🎯 Theme: {session_data['theme']}")
        print(f"   📊 Questions: {session_data['total_questions']}\n")
        
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
        
        # 3. Play all questions dynamically
        question_num = 1
        while True:
            print(f"🎯 Question {question_num}")
            
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
            print(f"   📍 Question {question.get('question_number', question_num)} of {question.get('total_questions', '?')}")
            
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
            advance_response = requests.post(f"{BASE_URL}/advance-question/{session_id}")
            if advance_response.status_code != 200:
                print("   ⚠️  Could not advance to next question")
            
            question_num += 1
            print()
        
        # Final scores
        print("🏁 Final Results:")
        response = requests.get(f"{BASE_URL}/scores/{session_id}")
        if response.status_code == 200:
            scores_data = response.json()
            for i, entry in enumerate(scores_data["scores"]):
                medal = ["🥇", "🥈", "🥉"][i] if i < 3 else "🏅"
                print(f"   {medal} {entry['name']}: {entry['score']} points")
        
        print(f"\n✨ Demo completed successfully for theme: '{theme}'!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Server not running! Start it with: python game_api.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_multiple_themes():
    """Test the API with different themes to showcase AI question generation"""
    themes = [
        "taekwondo",
        "tennis", 
        "basketball",
        "football"
    ]
    
    print("🚀 Testing Game API with Multiple Themes\n")
    print("=" * 50)
    
    for i, theme in enumerate(themes, 1):
        print(f"\n🎯 Test {i}/{len(themes)}")
        print("=" * 30)
        success = test_single_game(theme)
        if not success:
            break
        if i < len(themes):
            print("\n⏳ Waiting 2 seconds before next test...")
            time.sleep(2)
    
    print("\n🎉 All theme tests completed!")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Test specific theme if provided as argument
        theme = " ".join(sys.argv[1:])
        test_single_game(theme)
    else:
        # Test multiple themes by default
        test_multiple_themes()
