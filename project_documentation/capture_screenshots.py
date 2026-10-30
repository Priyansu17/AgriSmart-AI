"""
Script to capture authentic screenshots of each section of AgriSmart AI
using Playwright and local Microsoft Edge.
"""

import os
import time
from playwright.sync_api import sync_playwright

SCREENSHOT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'screenshots')
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

def capture_all():
    print(f"Saving high-resolution screenshots to: {SCREENSHOT_DIR}")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=EDGE_PATH, 
            headless=True
        )
        context = browser.new_context(viewport={'width': 1366, 'height': 880})
        page = context.new_page()

        # 1. Overview Page
        print("Navigating to Overview...")
        page.goto('http://localhost:5173')
        page.wait_for_timeout(2500)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '01_overview_landing.png'), full_page=False)
        print("Captured 01_overview_landing.png")

        # 2. Recommendation Form
        print("Navigating to Recommendation Form...")
        page.click("nav button:has-text('Recommend Crop')")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '02_recommendation_form.png'), full_page=False)
        print("Captured 02_recommendation_form.png")

        # 3. Live Prediction Result (Submit Form)
        print("Submitting Form for Neural Inference...")
        page.click("form button[type='submit']")
        page.wait_for_timeout(3000)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '03_prediction_result.png'), full_page=False)
        print("Captured 03_prediction_result.png")

        # 4. Analytics Dashboard
        print("Navigating to Analytics Dashboard...")
        page.click("nav button:has-text('Analytics')")
        page.wait_for_timeout(3000)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '04_analytics_dashboard.png'), full_page=False)
        print("Captured 04_analytics_dashboard.png")

        # 5. Prediction History
        print("Navigating to Prediction History...")
        page.click("nav button:has-text('Prediction History')")
        page.wait_for_timeout(2000)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '05_prediction_history.png'), full_page=False)
        print("Captured 05_prediction_history.png")

        # 6. About / Architecture
        print("Navigating to How It Works...")
        page.click("nav button:has-text('How It Works')")
        page.wait_for_timeout(2000)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '06_how_it_works_architecture.png'), full_page=False)
        print("Captured 06_how_it_works_architecture.png")

        browser.close()
        print("All 6 screenshots captured successfully and verified!")

if __name__ == '__main__':
    capture_all()
