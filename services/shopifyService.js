const axios = require('axios');

const SHOPIFY_STORE = process.env.SHOPIFY_SHOP_DOMAIN;
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

const shopifyGraphQL = async (query, variables = {}) => {
  const url = `https://${SHOPIFY_STORE}/admin/api/2025-01/graphql.json`;
  
  try {
    const response = await axios.post(url, {
      query,
      variables
    }, {
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('GraphQL Error:', error.response?.data || error.message);
    throw error;
  }
};

exports.createOrUpdateCustomer = async (customerData) => {
  try {
    // Search for existing customer
    const searchQuery = `
      query searchCustomer($email: String!) {
        customers(first: 1, query: $email) {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
            }
          }
        }
      }
    `;
    
    const searchResult = await shopifyGraphQL(searchQuery, {
      email: `email:${customerData.email}`
    });
    
    const existingCustomer = searchResult.data?.customers?.edges[0]?.node;
    
    if (existingCustomer) {
      // Update existing customer
      const updateMutation = `
        mutation updateCustomer($input: CustomerInput!) {
          customerUpdate(input: $input) {
            customer {
              id
              firstName
              lastName
              email
              phone
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      
      const updateResult = await shopifyGraphQL(updateMutation, {
        input: {
          id: existingCustomer.id,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          phone: customerData.phone,
          tags: [customerData.tags]
        }
      });
      
      return updateResult.data.customerUpdate.customer;
    } else {
      // Create new customer
      const createMutation = `
        mutation createCustomer($input: CustomerInput!) {
          customerCreate(input: $input) {
            customer {
              id
              firstName
              lastName
              email
              phone
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      
      const createResult = await shopifyGraphQL(createMutation, {
        input: {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
          tags: [customerData.tags]
        }
      });
      
      return createResult.data.customerCreate.customer;
    }
  } catch (error) {
    console.error('Customer operation error:', error);
    throw new Error(`Shopify API error: ${error.message}`);
  }
};