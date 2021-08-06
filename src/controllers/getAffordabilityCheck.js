const config = require('config');
const { Sentry } = require('vod-npm-sentry');
const sentryCategory = config.get('sentry.categories.getAffordabilityCheck');
const { customerService } = require('vod-npm-services');
const creditService = require('vod-npm-services/vod-ms-ecom-customer');
const prometheusClient = require('restify-prom-bundle').client;

const affordabilityCheckErr = new prometheusClient.Counter({
  name: 'affordability_check_error_count',
  help: 'vod-ms-upgrade-journey affordability check error'
});

exports.handler = async function getAffordabilityCheck(req, res, next) {
  Sentry.info('Beginning affordabilitycheck...', {}, sentryCategory);

  const params = {
    headers: req.headers,
    idNumber: req.params.idNumber,
    idType: req.query.idType,
    field: req.query.field
  };

  const customerInformationResponse = await customerService.getCustomerInfoV3(req, params);

  if (!customerInformationResponse.ok) {
    affordabilityCheckErr.inc();
    return next(customerInformationResponse.error);
  }

  const creditParams = {
    headers: req.headers,
    creditProfile: customerInformationResponse.data.result.creditProfile
  };

  const creditProfileResponse = await creditService.getCreditFilters(req, creditParams);

  if (!creditProfileResponse.ok) {
    affordabilityCheckErr.inc();
    return next(creditProfileResponse.error);
  }

  res.status(creditProfileResponse.data.status);
  res.json({
    productOfferingQualificationItem: [
      {
        product: {
          description: creditProfileResponse.data.data.result.creditFilter.message,
          productCharacteristic: [
            {
              name: 'total_monthly_payment',
              value: creditProfileResponse.data.data.result.creditFilter.total_monthly_payment
            },
            {
              name: 'financeIndicator',
              value: creditProfileResponse.data.data.result.creditFilter.financeIndicator
            },
            {
              name: 'deviceInstallment',
              value: creditProfileResponse.data.data.result.creditFilter.deviceInstallment
            }
          ]
        }
      }
    ]
  });
  return next();
};
