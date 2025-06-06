// Import necessary Synpress modules and setup
import { testWithSynpress } from '@synthetixio/synpress'
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright'
import basicSetup from '../test/wallet-setup/basic.setup'

const test = testWithSynpress(metaMaskFixtures(basicSetup))
const { expect } = test

test('should attempt MetaMask connection', async ({
  context,
  page,
  metamaskPage,
  extensionId,
}) => {
  test.setTimeout(180000)

  const metamask = new MetaMask(
    context,
    metamaskPage,
    basicSetup.walletPassword,
    extensionId
  )

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  await page.getByTestId('ockConnectButton').click()

  await page.waitForSelector('button.ock-bg-alternate', { timeout: 10000 })

  const metamaskButton = page.locator('button.ock-bg-alternate').filter({ hasText: 'MetaMask' })
  await expect(metamaskButton).toBeVisible()
  
  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    metamaskButton.click()
  ])

  await popup.waitForSelector('.metamask-loaded', { timeout: 15000 })
  
  await popup.waitForSelector('[data-testid="page-container-footer-next"]', { timeout: 15000 })
  const nextButton = popup.getByTestId('page-container-footer-next')
  
  await expect(nextButton).toBeVisible({ timeout: 10000 })
  await nextButton.click()

  /*const connectButton = page.getByTestId('ockConnectButton')
  await expect(connectButton).not.toHaveText('Connect', { timeout: 10000 })*/
})
