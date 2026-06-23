export function success(data: unknown, requestId: string, message = 'Success') {
  return {
    success: true,
    code: 'OK',
    message,
    data,
    requestId,
  };
}
