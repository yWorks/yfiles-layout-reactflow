import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('.')
  await expect(page).toHaveTitle(/yFiles Layout Algorithms for React Flow - Examples/)
})

const ignoredConsoleLogs = [
  '[vite]',
  'React DevTools',
  'running in development mode',
  // favicon.ico - we should also check failing network requests
  '404'
]

test('examples', async ({ page }) => {
  page.on('console', msg => {
    const text = msg.text()
    if (!ignoredConsoleLogs.some(ignored => text.includes(ignored))) {
      expect.soft(text, `Unexpected console output`).toBeUndefined()
    }
  })
  await page.goto('.')

  const comboLocator = page.getByRole('combobox', { name: 'examples' })
  await expect(comboLocator).toHaveCount(1)

  const options = comboLocator.getByRole('option')
  const optionCount = await options.count()
  for (let i = 0; i < optionCount; i++) {
    const option = options.nth(i)
    const exampleName = await option.textContent()
    console.log('Testing example', exampleName)
    await comboLocator.selectOption(exampleName)
  }
})
