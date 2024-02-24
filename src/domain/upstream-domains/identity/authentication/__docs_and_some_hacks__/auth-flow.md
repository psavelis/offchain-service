### 1. Generate Auth Request (generate-auth-challenge)

Request:
POST /v2/oauth?grant_type=ERC-1271&client_id=MDEyMzQ1Njc4OTA%3D&client_secret=0x1b6453892473a467d07372d45eb05abc2031647a&scopes=scope1,scope2&network=ethereum

```env
grant_type=ERC-1271
client_id=0x1b6453892473a467d07372d45eb05abc2031647a
client_secret=uuidRandom()
network=ethereum
scope=scope1,scope2

provider=0x1b6453892473a467d07372d45eb05abc2031647a
nonce=(guardar local o ultimo nonce de sucesso que estiver)
first=(guardar local o primeiro login com sucesso)
```

````
Response 201:
```json
{
  "id": "uuid",
  "domain": "dapp.kannacoin.io",
  "address": "0x1234567890",
  "statement": "Sign in with ${chain.toString()} to Kanna dApp.",
  "uri": "https://dapp.kannacoin.io",
  "version": "1",
  "chainId": chain.id,
  "nonce": "randomlyGeneratedNonce"
}
````

### 2. Sign Challenge (generate-token)

Request:

PUT

```json
{
  "id": "uuid", // route param
  "address": "0x1234567890",
  "signature": "0x1234567890"
}
```

Response:

```json
{
  "access_token": "randomlyGeneratedToken",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "randomlyGeneratedRefreshToken", // expirar todos refresh de um client sempre que gerado um challenge ou um refresh novo (pode ser utilizado ate 24h depois de finalizar a sessao)
  "refresh_token_expires_in": 3600,
  "scope": "scope1,scope2"
}
```

### 3. Refresh Token (refresh-token)

Request:

POST /auth/refresh-token

```json
{
  "refresh_token": "randomlyGeneratedRefreshToken"
}
```

Response:

```json
{
  "access_token": "randomlyGeneratedToken",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "randomlyGeneratedRefreshToken",
  "refresh_token_expires_in": 3600,
  "scope": "scope1,scope2"
}
```

## ERC-1271

### 1. Generate Auth Request (generate-auth-challenge)

Request:
POST /auth?grant_type=ERC-1271&client_id=MDEyMzQ1Njc4OTA%3D&client_secret=0x1b6453892473a467d07372d45eb05abc2031647a&scopes=scope1,scope2&network=ethereum

```urlencoded
grant_type=ERC-
```

Response:

```json
{
  "id": "uuid",
  "domain": "dapp.kannacoin.io",
  "address": "0x1234567890",
  "statement": "Sign in with ${chain.toString()} to Kanna dApp.",
  "uri": "https://dapp.kannacoin.io",
  "version": "1",
  "chainId": chain.id,
  "nonce": "randomlyGeneratedNonce"
}
```

### 2. Sign Challenge (generate-token)

Request:

PUT

```json
{
  "id": "uuid", // route param
  "address": "0x1234567890",
  "signature": "0x1234567890"
}
```
