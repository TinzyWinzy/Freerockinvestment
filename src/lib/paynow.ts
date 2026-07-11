import { createHash } from 'crypto'

const PAYNOW_API = 'https://www.paynow.co.zw/interface/initiatetransaction'
const PAYNOW_QUERY = 'https://www.paynow.co.zw/interface/query/paynow'

export function getConfig() {
  const id = process.env.PAYNOW_MERCHANT_ID
  const key = process.env.PAYNOW_MERCHANT_KEY
  const authEmail = process.env.PAYNOW_AUTH_EMAIL
  if (!id || !key) return null
  return { id, key, authEmail }
}

/** SHA512-based hash used by Paynow for both initiation authentication and
 *  ITN/poll-result integrity verification.
 *
 *  The Paynow platform constructs the hash by concatenating every field value
 *  (in the order sent/returned, with the `hash` field itself excluded) together
 *  with no separator, then appending the integration key, and finally computing
 *  an upper-case hex-encoded SHA-512 digest of the resulting string.
 *
 *  This function reproduces that computation by taking an ordered list of field
 *  values and the integration key, and returning the expected hash string. */
export function computeHash(values: string[], key: string): string {
  return createHash('sha512').update(values.join('') + key).digest('hex').toUpperCase()
}

/** Build the form-urlencoded body for a Paynow initiation request.
 *  The `hash` field is computed server-side using the integration key and
 *  appended to the parameter list. The caller should POST this to
 *  `https://www.paynow.co.zw/interface/initiatetransaction` with content-type
 *  `application/x-www-form-urlencoded`. */
export function buildInitiateBody(params: {
  id: string
  reference: string
  amount: string
  additionalInfo: string
  returnUrl: string
  resultUrl: string
  authEmail?: string
  key: string
}): URLSearchParams {
  const fields = new URLSearchParams()
  fields.append('id', params.id)
  fields.append('reference', params.reference)
  fields.append('amount', params.amount)
  fields.append('additionalinfo', params.additionalInfo)
  fields.append('returnurl', params.returnUrl)
  fields.append('resulturl', params.resultUrl)
  if (params.authEmail) fields.append('authemail', params.authEmail)
  fields.append('status', 'Message')

  // Collect values in insertion order (excluding hash itself).
  const values: string[] = []
  for (const [, v] of fields) values.push(v)
  const hash = computeHash(values, params.key)
  fields.append('hash', hash)

  return fields
}

/** Parse the name-value-pair response Paynow returns from an initiation or
 *  status-query call. The response is a URL-encoded body (`key=value&key2=...`)
 *  that this function decodes into a plain object. */
export function parsePaynowResponse(text: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(text))
}

/** Verify that the `hash` value in an ITN / poll / status-response payload
 *  matches the hash we compute ourselves. This proves the payload was genuinely
 *  sent by Paynow and has not been tampered with. */
export function verifyPayloadHash(payload: Record<string, string>, key: string): boolean {
  const values: string[] = []
  // Paynow returns fields in a consistent order. We iterate object keys in
  // insertion order (which matches what Paynow sends), excluding the `hash`
  // field itself.
  for (const k of Object.keys(payload)) {
    if (k.toLowerCase() !== 'hash') {
      values.push(payload[k] ?? '')
    }
  }
  const computed = computeHash(values, key)
  return computed === (payload.hash ?? '').toUpperCase()
}

/** Poll the status of a transaction using the `pollurl` returned from a
 *  previous initiation call. Returns the parsed response object, or null
 *  if the poll URL is not provided or the upstream call fails. */
export async function pollTransaction(pollUrl: string): Promise<Record<string, string> | null> {
  if (!pollUrl) return null
  try {
    const res = await fetch(pollUrl, { signal: AbortSignal.timeout(10000) })
    const text = await res.text()
    return parsePaynowResponse(text)
  } catch {
    return null
  }
}

/** Query Paynow directly for a transaction's current status using the merchant
 *  credentials and the transaction reference. This is an alternative to using
 *  the poll URL, and is useful for server-side reconciliation. */
export async function queryTransaction(reference: string): Promise<Record<string, string> | null> {
  const config = getConfig()
  if (!config) return null
  try {
    const body = new URLSearchParams({ id: config.id, reference }).toString()
    const auth = Buffer.from(`${config.id}:${config.key}`).toString('base64')
    const res = await fetch(PAYNOW_QUERY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      body,
      signal: AbortSignal.timeout(10000),
    })
    const text = await res.text()
    return parsePaynowResponse(text)
  } catch {
    return null
  }
}
