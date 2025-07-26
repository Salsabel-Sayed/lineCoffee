

export  function generateOrderCode(userId: string, orderId: string) {
  const userPrefix = userId.slice(0, 2);
  const orderSuffix = orderId.slice(-2);
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();// أو Math.random().toString(36).substr(2, 4).toUpperCase()
  return `${userPrefix}${orderSuffix}${randomPart}`;
}
