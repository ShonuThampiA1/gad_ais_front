import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 1024})
        print("Navigating to dashboard...")

        # Go to home and login first if needed? No, let's just go straight to dashboard.
        # Wait, if there's authentication, we might need to login or mock it.
        # Let's check if dashboard requires auth
        await page.goto("http://localhost:3000/dashboard", wait_until="networkidle")
        await asyncio.sleep(2)
        await page.screenshot(path="dashboard_screenshot.png")
        print("Dashboard screenshot taken.")

        # Navigate to user manual
        print("Navigating to user manual...")
        await page.goto("http://localhost:3000/knowledge-base/user-manual", wait_until="networkidle")
        await asyncio.sleep(2)
        await page.screenshot(path="manual_screenshot.png")
        print("Manual screenshot taken.")

        await browser.close()

asyncio.run(main())
