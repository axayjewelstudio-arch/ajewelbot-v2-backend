import logging
from services.shopifyService import createCustomer, addCustomerAddress, addCustomerMetafields
from services.googleSheetsService import appendFormData

logger = logging.getLogger(__name__)

def handleFormSubmission(data):
    """
    Handle form submission:
    1. Create Shopify customer
    2. Add addresses
    3. Add metafields
    4. Log to Google Sheets
    """
    try:
        # Prepare customer data
        customer_data = {
            'first_name': data.get('firstName', ''),
            'last_name': data.get('lastName', ''),
            'email': data.get('email', ''),
            'phone': data.get('mobile', ''),
            'tags': ', '.join(filter(None, [
                data.get('customerType'),
                data.get('sourceOfReferral'),
                'join-us-registration'
            ])),
            'verified_email': True,
            'accepts_marketing': data.get('consentMarketing') == 'yes',
            'email_marketing_consent': {
                'state': 'subscribed' if data.get('consentMarketing') == 'yes' else 'unsubscribed',
                'opt_in_level': 'single_opt_in'
            },
            'sms_marketing_consent': {
                'state': 'subscribed' if data.get('consentWhatsApp') == 'yes' else 'unsubscribed',
                'opt_in_level': 'single_opt_in'
            }
        }
        
        # Create customer
        logger.info(f"Creating customer: {data.get('email')}")
        customer = createCustomer(customer_data)
        customer_id = customer['id']
        
        # Add primary address
        if data.get('houseNo') or data.get('city'):
            address_data = {
                'first_name': data.get('firstName', ''),
                'last_name': data.get('lastName', ''),
                'address1': f"{data.get('houseNo', '')}, {data.get('building', '')}, {data.get('street', '')}".strip(', '),
                'address2': data.get('area', ''),
                'city': data.get('city', ''),
                'province': data.get('state', ''),
                'zip': data.get('pincode', ''),
                'country': data.get('country', 'India'),
                'phone': data.get('mobile', '')
            }
            addCustomerAddress(customer_id, address_data)
            logger.info(f"Added primary address for customer {customer_id}")
        
        # Add delivery address if different
        if data.get('delHouseNo') or data.get('delCity'):
            delivery_address = {
                'first_name': data.get('firstName', ''),
                'last_name': data.get('lastName', ''),
                'address1': f"{data.get('delHouseNo', '')}, {data.get('delBuilding', '')}, {data.get('delStreet', '')}".strip(', '),
                'address2': data.get('delArea', ''),
                'city': data.get('delCity', ''),
                'province': data.get('delState', ''),
                'zip': data.get('delPincode', ''),
                'country': data.get('delCountry', 'India'),
                'phone': data.get('mobile', '')
            }
            addCustomerAddress(customer_id, delivery_address)
            logger.info(f"Added delivery address for customer {customer_id}")
        
        # Add business address if wholesale
        if data.get('customerType') == 'Wholesale' and (data.get('businessAddress') or data.get('businessCity')):
            business_address = {
                'first_name': data.get('businessName', data.get('firstName', '')),
                'last_name': 'Business',
                'company': data.get('businessName', ''),
                'address1': data.get('businessAddress', ''),
                'address2': data.get('businessArea', ''),
                'city': data.get('businessCity', ''),
                'province': data.get('businessState', ''),
                'zip': data.get('businessPincode', ''),
                'country': 'India',
                'phone': data.get('businessMobile', data.get('mobile', ''))
            }
            addCustomerAddress(customer_id, business_address)
            logger.info(f"Added business address for customer {customer_id}")
        
        # Prepare metafields
        metafields = []
        
        metafield_mapping = {
            'gender': 'gender',
            'dob': 'date_of_birth',
            'anniversary': 'wedding_anniversary',
            'ageGroup': 'age_group',
            'businessName': 'business_name',
            'businessCategory': 'business_category',
            'gstNumber': 'gst_number',
            'referralCode': 'referral_code'
        }
        
        for data_key, metafield_key in metafield_mapping.items():
            if data.get(data_key):
                metafields.append({
                    'namespace': 'custom',
                    'key': metafield_key,
                    'value': data[data_key],
                    'type': 'single_line_text_field'
                })
        
        # Add metafields
        if metafields:
            addCustomerMetafields(customer_id, metafields)
            logger.info(f"Added {len(metafields)} metafields for customer {customer_id}")
        
        # Add customer ID to data for Google Sheets
        data['shopifyCustomerId'] = customer_id
        data['mobileLog'] = f"{data.get('firstName', '')} {data.get('lastName', '')} - {data.get('mobile', '')}"
        
        # Log to Google Sheets
        appendFormData(data)
        logger.info(f"Logged data to Google Sheets for customer {customer_id}")
        
        return {
            'success': True,
            'message': 'Registration successful!',
            'customerId': customer_id
        }
        
    except Exception as e:
        logger.error(f"Form submission error: {str(e)}")
        return {
            'success': False,
            'message': 'Registration failed. Please try again.',
            'error': str(e)
        }
