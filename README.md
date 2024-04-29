# phonpe-payment-integration

This package will help you to integrate phone pe in you existing application


## Documentation

[Documentation](https://github.com/WebNaresh/phonepe)


## Installation

Install phonepe-payment-integration with npm

```
  npm install phonepe-payment-integration
```
    
## Init Phone Pay
```
  // Use it in you app.js/server.js
  const { initPhonePay } = require("phonepe-payment-integration");
  // No need to pass credential while testing only for production you need it
  initPhonePay();
```
## Phone pay instance
```
  // Use it anywhere when application running
  const { getPhonePayInstance } = require("phonepe-payment-integration");
  // You will get phone pay instance
  getPhonePayInstance();
```
## PhonePe pay instance
```
  // Use it anywhere when application running
  const { getPhonePayInstance } = require("phonepe-payment-integration");
  // You will get phone pay instance
   const { response } = await getPhonePayInstance().pay({
    amount,
    name,
    mobileNumber,
    redirectUrl,
  });
```
## PhonePe verify instance
```
  // Use it anywhere when application running
  const { getPhonePayInstance } = require("phonepe-payment-integration");
  // You will get phone pay instance
    const { response } = await getPhonePayInstance()?.verifyPayment(
    req?.body?.transactionId
  );
  console.log(`🚀 ~ file: razorypay.js:194 ~ response:`, response);
  if (response?.data.state === "COMPLETED") {
  console.log("Payment Done");
  }else{
  console.log("Something went wrong");
  };
```
## Let's Discuss how phonepe pay api
![image](https://github.com/WebNaresh/phonepe/assets/149777886/9b3c5890-d6bc-4dba-ba1e-d3dc576acb22)
