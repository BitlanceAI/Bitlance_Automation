import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('http://localhost:3001/api/billing/call-history', {
      headers: { Authorization: 'Bearer dummy-token-for-dev' }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
test();
