import { ethers } from 'ethers';

const testLogin = async () => {
  // Use a random wallet for testing
  const wallet = ethers.Wallet.createRandom();
  const address = wallet.address;

  console.log('Testing with address:', address);

  // 1. Get Nonce
  const response = await fetch(`http://localhost:8000/auth/nonce?walletAddress=${address}`);
  const data = await response.json();
  const message = data.message;
  console.log('Received Message:', message);

  // 2. Sign the Nonce
  const signature = await wallet.signMessage(message);
  console.log('Generated Signature:', signature);

  // 3. Verify and get JWT
  const verifyRes = await fetch('http://localhost:8000/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress: address, signature })
  });

  const verifyData = await verifyRes.json();
  console.log('Verification Response:', verifyData);

  // 4. Test Protected API Route
  if (verifyData.token) {
    const profileRes = await fetch('http://localhost:8000/api/users/profile', {
      headers: { 'Authorization': `Bearer ${verifyData.token}` }
    });
    const profileData = await profileRes.json();
    console.log('Profile Data (Protected Route):', profileData);
  }
};

testLogin();
