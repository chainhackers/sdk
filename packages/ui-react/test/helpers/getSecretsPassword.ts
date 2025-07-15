import fs from "node:fs"
import path from "node:path"

export function getSecretsPassword(): string {
  const secretsPath = path.resolve(process.cwd(), "../../.secrets")

  if (!fs.existsSync(secretsPath)) {
    throw new Error(`.secrets file not found at ${secretsPath}`)
  }

  const secretsContent = fs.readFileSync(secretsPath, "utf8")
  const passwordMatch = secretsContent.match(/WALLET_PASSWORD='([^']+)'/)

  if (!passwordMatch || !passwordMatch[1]) {
    throw new Error("WALLET_PASSWORD not found in .secrets file")
  }

  return passwordMatch[1]
}
