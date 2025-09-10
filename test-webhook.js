const axios = require('axios');

// Test script for the webhook function
const testWebhook = async () => {
    const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:7071/api/gravityFormsWebhook';
    
    console.log('Testing webhook at:', webhookUrl);
    
    // Test data simulating Gravity Forms submission
    const testData = {
        // Form field data
        'form_id': '1',
        'entry_id': '123',
        'input_1_3': 'John',      // First name
        'input_1_6': 'Smith',     // Last name  
        'input_2': 'john.smith@example.com', // Email
        'input_3': 'Example Primary School'  // School name
    };
    
    try {
        console.log('Sending test data:', testData);
        
        const response = await axios.post(webhookUrl, 
            new URLSearchParams(testData).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        
        console.log('✅ Success!');
        console.log('Status:', response.status);
        console.log('Response:', response.data);
        
    } catch (error) {
        console.log('❌ Error!');
        console.log('Status:', error.response?.status || 'No response');
        console.log('Error:', error.response?.data || error.message);
    }
};

// Test with JSON format too
const testWebhookJson = async () => {
    const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:7071/api/gravityFormsWebhook';
    
    console.log('\n--- Testing JSON format ---');
    
    const testData = {
        form_id: '1',
        entry_id: '124',
        fields: {
            '1': {
                '3': 'Jane',
                '6': 'Doe'
            },
            '2': 'jane.doe@example.com',
            '3': 'Another Primary School'
        }
    };
    
    try {
        console.log('Sending JSON test data:', testData);
        
        const response = await axios.post(webhookUrl, testData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ JSON Success!');
        console.log('Status:', response.status);
        console.log('Response:', response.data);
        
    } catch (error) {
        console.log('❌ JSON Error!');
        console.log('Status:', error.response?.status || 'No response');
        console.log('Error:', error.response?.data || error.message);
    }
};

// Run tests
const runTests = async () => {
    console.log('🧪 Testing Azure Function Webhook\n');
    
    await testWebhook();
    await testWebhookJson();
    
    console.log('\n🏁 Test complete!');
};

runTests().catch(console.error);