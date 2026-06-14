// Frontend debug script
console.log("🔍 Frontend Debug Started");

// Test API connection
async function testAPI() {
    try {
        console.log("📡 Testing API connection...");
        const response = await fetch('http://127.0.0.1:8000/api/subjects/', {
            headers: { 'Accept': 'application/json' }
        });

        console.log(`✅ API Response: ${response.status}`);
        const data = await response.json();
        console.log('📊 Data:', data);

        return true;
    } catch (error) {
        console.error('❌ API Error:', error);
        return false;
    }
}

// Test registration
async function testRegistration() {
    try {
        console.log("📝 Testing registration...");
        const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'frontendtest123',
                password: 'testpass123',
                first_name: 'Frontend',
                last_name: 'Test',
                email: 'frontendtest@example.com',
                phone: '+998901234567'
            })
        });

        console.log(`✅ Registration Response: ${response.status}`);
        const data = await response.json();
        console.log('📊 Response Data:', data);

        return response.status === 201;
    } catch (error) {
        console.error('❌ Registration Error:', error);
        return false;
    }
}

// Run tests
(async () => {
    await testAPI();
    await testRegistration();
    console.log("🔍 Debug Complete");
})();
