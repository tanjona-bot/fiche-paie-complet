const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export async function getPayrolls() {
  const res = await fetch(`${API_URL}/api/payrolls`);
  return res.json();
}

export async function addPayroll(payload) {
  const res = await fetch(`${API_URL}/api/payrolls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}
