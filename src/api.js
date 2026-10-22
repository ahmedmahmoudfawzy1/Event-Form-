const API_URL = 'https://gcw.gosorsolutions.com/api/v1/questions'

async function request(options = {}) {
  const res = await fetch(API_URL, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body && { 'Content-Type': 'application/json' }),
    },
  })
  const json = await res.json().catch(() => ({}))

  if (!res.ok || json.success === false) {
    const error = new Error(json.message || 'حصل خطأ، حاول تاني')
    error.fields = json.errors || {}
    throw error
  }
  return json
}

export async function getQuestions() {
  const json = await request()
  return Array.isArray(json.data) ? json.data : []
}

export function postQuestion({ name, questions }) {
  return request({ method: 'POST', body: JSON.stringify({ name, questions }) })
}
