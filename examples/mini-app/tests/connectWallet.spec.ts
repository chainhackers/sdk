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
  const metamask = new MetaMask(
    context,
    metamaskPage,
    basicSetup.walletPassword,
    extensionId
  )

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const connectButton = page.getByTestId('ockConnectButton')
  await expect(connectButton).toBeVisible()
  await connectButton.click()

  const onchainkitModal = page.locator('[data-testid="ockModalOverlay"]')
  await expect(onchainkitModal).toBeVisible()
  const metamaskBtn = onchainkitModal.getByRole('button').filter({ hasText: /metamask/i })
  await metamaskBtn.click()

  await metamask.connectToDapp()

  const address = await metamask.getAccountAddress()
  expect(address).toBeDefined()
  const addressStart = address.slice(0, 6)
  
  const walletConectedBtn = page.locator('[data-testid="ockConnectWallet_Connected"]')
  await expect(walletConectedBtn).toBeVisible()

  const identityText = walletConectedBtn.locator('[data-testid="ockIdentity_Text"]')
  await expect(identityText).toContainText(addressStart)
})
