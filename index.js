const crypto = require("crypto");

/**
 * Represents a PhonePe payment interface
 */
class PhonePay {
  #saltKey;
  #merchantId;
  #keyIndex;
  #url;
  /**
   *
   * @param {string} saltKey - The API key provided by PhonePe
   * @param {string} merchantId - The merchant ID provided by PhonePe
   * @param {number} keyIndex - The key index provided by PhonePe
   * @param {"PROD"|"DEV"} environment -The environment to use, either "PROD" or "DEV"
   */
  constructor(
    saltKey = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399",
    merchantId = "PGTESTPAYUAT",
    keyIndex = 1,
    environment = "DEV"
  ) {
    this.#saltKey = saltKey;
    this.#merchantId = merchantId;
    this.#keyIndex = keyIndex;
    if (environment === "PROD") {
      this.#url = "https://api.phonepe.com/apis/hermes";
      console.log("\x1b[90m", "From Phone Pay Using PROD environment");
    } else {
      this.#url = "https://api-preprod.phonepe.com/apis/pg-sandbox";
      console.log("\x1b[36m%s\x1b[0m", "From Phone Pay Using DEV environment");
    }
  }
  //private method to generate transaction id
  #generateTransactionId() {
    return `T${Math.floor(Math.random() * 1000000)}`;
  }
  #generateMerchantUserId() {
    return `M${Math.floor(Math.random() * 1000000)}`;
  }

  /**
   * @typedef {Object} RedirectInfo
   * @property {string} url - Redirect URL
   * @property {string} method - Redirect method
   */
  /**
   * @typedef {Object} InstrumentResponse
   * @property {string} type - Type of payment instrument
   * @property {RedirectInfo} redirectInfo - Redirect information
   */
  /**
   * @typedef {Object} PaymentResponse
   * @property {string} merchantId - Merchant ID
   * @property {InstrumentResponse} instrumentResponse
   */
  /**
   * @typedef {Object} PaymentParams
   * @property {number} amount - If You amount is 100 rs then pass only 100 internally we multiply by 100
   * @property {string} name - Name of client
   * @property {number} mobileNumber - Mobile number of client it will 10 digit number
   * @property {string} redirectUrl - Redirect url after payment you should handle this as POST request in your server
   * @property {string} merchantTransactionId - Optional if you pass it is ok otherwise we will generate
   * @property {string} merchantUserId - Optional if you pass it is ok otherwise we will generate

   * @returns {Promise<{response: any}>} - Response from PhonePe
   */

  /**
   *
   * @param {PaymentParams} paymentParams - Payment parameters
   * @returns {Promise<{response: PaymentResponse}>} - Response from PhonePe
   */
  async pay({
    amount,
    name,
    mobileNumber,
    redirectUrl,
    merchantTransactionId = this.#generateTransactionId(),
    merchantUserId = this.#generateMerchantUserId(),
  }) {
    const data = {
      merchantId: this.#merchantId,
      merchantTransactionId,
      merchantUserId,
      amount: amount * 100,
      name,
      redirectUrl,
      redirectMode: "POST",
      mobileNumber,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    const payload = Buffer.from(JSON.stringify(data)).toString("base64");
    const string = payload + "/pg/v1/pay" + this.#saltKey;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + this.#keyIndex;
    const url = `${this.#url}/pg/v1/pay`;
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      body: JSON.stringify({
        request: payload,
      }),
    };
    const data1 = await fetch(url, options);
    const response = await data1.json();
    return {
      response: response?.data,
    };
  }
  /**
   * @typedef {Object|null} PaymentInstrument
   *
   * @typedef {Object} PaymentResponseData
   * @property {string} merchantId - The ID of the merchant.
   * @property {string} merchantTransactionId - The transaction ID from the merchant.
   * @property {number} amount - The amount of the transaction.
   * @property {string} state - The state of the transaction.
   * @property {string} responseCode - The response code of the transaction.
   * @property {PaymentInstrument} paymentInstrument - The payment instrument used for the transaction.
   *
   * @typedef {Object} VerifyPaymentResponse
   * @property {boolean} success - Whether the payment was successful.
   * @property {string} code - The code of the payment response.
   * @property {string} message - The message of the payment response.
   * @property {PaymentResponseData} data - The data of the payment response.
   */

  /**
   *
   * @param {string} transactionId - You will get it from request body after payment
   *                               - const transactionId = req.body.transactionId
   *                               - In that way you will get the transactionId
   * @returns {Promise<{response: VerifyPaymentResponse}>} - Response from PhonePe
   */
  async verifyPayment(transactionId) {
    console.log(
      `🚀 ~ file: phone-pay.js:135 ~ PhonePay ~ transactionId:`,
      transactionId
    );
    const sha256 = crypto
      .Hash("sha256")
      .update(
        `/pg/v1/status/${this.#merchantId}/${transactionId}` + this.#saltKey
      )
      .digest("hex");
    const checksum = sha256 + "###" + this.#keyIndex;
    const url = `${this.#url}/pg/v1/status/${
      this.#merchantId
    }/${transactionId}`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": this.#merchantId,
      },
    };
    console.log(`🚀 ~ file: phone-pay.js:156 ~ PhonePay ~ options:`, options);
    // const data1 = await fetch(url, options);
    const data1 = await fetch(url, options);
    console.log(`🚀 ~ file: phone-pay.js:159 ~ PhonePay ~ data1:`, data1);
    console.log(
      `🚀 ~ file: phone-pay.js:159 ~ PhonePay ~ data1:`,
      data1?.headers?.get("content-type")
    );
    let response;
    if (data1?.headers?.get("content-type").includes("application/json")) {
      response = await data1.json();
    } else {
      response = await data1.text();
    }

    return {
      response: response,
    };
  }
}

let phonePayInstance = null;
/**
 * Initialize the PhonePay instance.
 * - for development you can initialize  initPhonePay() without any arguments
 * - for production you need to pass the arguments or it will still work with default values
 * @param {Object} options - The options for initializing PhonePay.
 * @param {string} options.saltKey - The API key provided by PhonePe.
 * @param {string} options.merchantId - The merchant ID provided by PhonePe.
 * @param {number} options.keyIndex - The key index provided by PhonePe.
 * @param {"PROD"|"DEV"} options.environment - The environment to use, either "PROD" or "DEV".
 * @returns {PhonePay} The PhonePay instance */
function initPhonePay(options) {
  if (!options) {
    phonePayInstance = new PhonePay();
    console.log("\x1b[90m", "From Phone Pay Using DEV environment");
    return phonePayInstance;
  }
  if (!phonePayInstance) {
    phonePayInstance = new PhonePay(saltKey, merchantId, keyIndex, environment);
  }
  return phonePayInstance;
}

/**
 * Get the PhonePay instance.
 * @returns {PhonePay} The PhonePay instance.
 * @throws {Error} If the PhonePay instance is not initialized.
 */
function getPhonePayInstance() {
  if (!phonePayInstance) {
    throw new Error(
      "PhonePay instance not initialized. Call initPhonePay() first."
    );
  }
  return phonePayInstance;
}
module.exports = {
  initPhonePay,
  getPhonePayInstance,
};
