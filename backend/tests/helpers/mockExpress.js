export function createMockReq(init = {}) {
  return { params: {}, query: {}, body: {}, ...init };
}

export function createMockRes(store) {
  const result = store || { statusCode: 200, json: undefined, sent: undefined };
  const res = {
    status(code) { result.statusCode = code; return this; },
    json(payload) { result.json = payload; return this; },
    send(payload) { result.sent = payload; return this; },
  };
  return { res, result };
}

