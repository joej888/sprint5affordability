const success = {
  mockCustomerInfo: {
    ok: true,
    status: 200,
    data: {
      result: {
        creditProfile: {
          portfolioId: 'P0300',
          defaultLimit: '200',
          scndyInstlmntThrshld: '50',
          SecTarrifLimit: '552.63',
          ScndyPortflioId: 'P0420',
          instlmntThrshld: '50.0',
          scndyFinIndcator: 'Y',
          voluntary: '',
          TarrifLimit: '552.63',
          FinIndcator: 'N',
          mandatory: '-1.0',
          SecHandsetLimit: '19999.0',
          HandsetLimit: '19999.0'
        },
        subscriberAuth: [
          {
            msisdn: '27609945441',
            details: {
              reward: '',
              pmtMeth: 'C',
              mah: 'Y',
              privilege: 'VAS_SERV,SPON_MAH,ALL,CALL_LIMIT,CALL_SPON',
              twinCall: 'N'
            }
          }
        ]
      }
    }
  },
  mockCreditFilter: {
    ok: true,
    data: {
      status: 200,
      data: {
        result: {
          creditFilter: {
            total_monthly_payment: '552.63',
            financeIndicator: 'Y',
            deviceInstallment: null,
            message: 'Based on your credit profile, we can offer you deals with a device and a plan '
          }
        }
      }
    }
  }
};

const expected = {
  data: {
    productOfferingQualificationItem: [
      {
        product: {
          description: 'Based on your credit profile, we can offer you deals with a device and a plan ',
          productCharacteristic: [
            {
              name: 'total_monthly_payment',
              value: '552.63'
            },
            {
              name: 'financeIndicator',
              value: 'Y'
            },
            {
              name: 'deviceInstallment',
              value: null
            }
          ]
        }
      }
    ]
  }
};

const failure = {
  mock: {
    ok: false,
    error: {
      response: {
        status: 400,
        statusText: 'Bad Request'
      }
    }
  },
  expected: {
    result: {
      status: 400,
      error: 'Bad Request',
      message: 'Bad Request'
    }
  }
};

module.exports = {
  success,
  failure,
  expected
};
