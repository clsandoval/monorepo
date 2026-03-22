const PAYMONGO_BASE = "https://api.paymongo.com/v1";
const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY!;

function headers() {
  return {
    Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET + ":").toString("base64")}`,
    "Content-Type": "application/json",
  };
}

export async function createCustomer(email: string, name: string) {
  const res = await fetch(`${PAYMONGO_BASE}/customers`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      data: { attributes: { email, first_name: name, last_name: "" } },
    }),
  });
  if (!res.ok) throw new Error(`PayMongo createCustomer failed: ${res.status}`);
  return res.json();
}

export async function createSubscription(customerId: string, planId: string, paymentMethodId: string) {
  const res = await fetch(`${PAYMONGO_BASE}/subscriptions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      data: {
        attributes: {
          customer_id: customerId,
          plan_id: planId,
          payment_method_id: paymentMethodId,
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`PayMongo createSubscription failed: ${res.status}`);
  return res.json();
}

export async function changePlan(subscriptionId: string, newPlanId: string) {
  const res = await fetch(`${PAYMONGO_BASE}/subscriptions/${subscriptionId}/plan`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      data: { attributes: { plan_id: newPlanId } },
    }),
  });
  if (!res.ok) throw new Error(`PayMongo changePlan failed: ${res.status}`);
  return res.json();
}

export async function cancelSubscription(subscriptionId: string, reason: string = "other") {
  const res = await fetch(`${PAYMONGO_BASE}/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      data: { attributes: { cancellation_reason: reason } },
    }),
  });
  if (!res.ok) throw new Error(`PayMongo cancelSubscription failed: ${res.status}`);
  return res.json();
}

export async function getSubscription(subscriptionId: string) {
  const res = await fetch(`${PAYMONGO_BASE}/subscriptions/${subscriptionId}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`PayMongo getSubscription failed: ${res.status}`);
  return res.json();
}
