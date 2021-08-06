import 'chai/register-should';
import chai from 'chai';
import config from 'config';
import httpStatus from 'http-status-codes';
import httpMocks from 'node-mocks-http';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as customerService from 'vod-npm-services/vod-ms-customer/service';
import * as creditService from 'vod-npm-services/vod-ms-ecom-customer/service';

chai.use(sinonChai);
const expect = chai.expect;
const assert = sinon.assert;

// Controllers
import { handler as controller } from '../../src/controllers/getAffordabilityCheck';

// Mocks
import { success, failure, expected } from '../mocks/getAffordabilityCheckMocks';

let customerServiceStub, creditServiceStub, logger, req, res, next;

describe('Get Dealers Product Offering', function () {

  before(() => {
    customerServiceStub = sinon.stub(customerService, 'getCustomerInfoV3');
    logger = require('vod-npm-console-logger').createLogger({
      name: 'vod-ms-journey-upgrade',
      level: config.get('log.level')
    });
  });

  before(() => {
    creditServiceStub = sinon.stub(creditService, 'getCreditFilters');
    logger = require('vod-npm-console-logger').createLogger({
      name: 'vod-ms-journey-upgrade',
      level: config.get('log.level')
    });
  });

  beforeEach(() => {
    next = sinon.spy();
    customerServiceStub.reset();
    creditServiceStub.reset();

    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    req.log = logger;
  });

  after(() => {
    customerServiceStub.restore();
    creditServiceStub.restore();
  });

  afterEach(() => {
    req = null;
    res = null;
    next = null;
  });

  it('returns expected response when ok is true', async () => {
    req.query = {
      idNumber: '27609945441',
      idType: 'MSISDN',
      field: 'creditProfile'
    };

    const customerParams = {
      headers: req.headers,
      idNumber: req.params.idNumber,
      idType: req.query.idType,
      field: req.query.field
    };

    const creditParams = {
      headers: req.headers,
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
      }
    };

    customerServiceStub.withArgs(req, customerParams).resolves(success.mockCustomerInfo);
    creditServiceStub.withArgs(req, creditParams).resolves(success.mockCreditFilter);
    await controller(req, res, next);
    expect(res._getStatusCode()).to.equal(httpStatus.OK);
    const response = JSON.parse(res._getData());

    expect(response).to.deep.equal(expected.data);
  });

  it('invokes error middleware correctly when ok is false', async () => {

    const customerParams = {
      headers: req.headers,
      idNumber: req.params.idNumber,
      idType: req.query.idType,
      field: req.query.field
    };

    const creditParams = {
      headers: req.headers,
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
      }
    };

    customerServiceStub.withArgs(req, customerParams).resolves(failure.mock);
    creditServiceStub.withArgs(req, creditParams).resolves(failure.mock);
    await controller(req, res, next);
    assert.calledOnce(next);
    assert.calledWith(next, failure.mock.error);
  });

});
