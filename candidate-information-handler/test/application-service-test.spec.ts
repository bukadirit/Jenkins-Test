import chai from 'chai';
import chaiPromised from 'chai-as-promised';
import sinon from 'sinon';

import { mdcLog } from '../src/domain/model/mdc-log';
import { awsHelper } from '../src/common/aws-helper'
import { CandidateInformationApiItem } from '../src/domain/model/ci-db-entity'
import { CandidateInformationDomainService } from "../src/domain/service/ci-handler-domain-service";
import { CandidateInformationHandlerApplicationService } from "../src/application/ci-handler-application-service";
import { CandidateInformationEvent } from "../src/domain/model/ci-event";
import { CandidateInformationDDBRepository } from "../src/infrastructure/persistence/ci-handler-ddb-repository";

describe('application-service-test-suite', function () {

    let sandbox = sinon.createSandbox();
    mdcLog.version = '1';

    let ciDDBRepository = new CandidateInformationDDBRepository();
    ciDDBRepository.db =  awsHelper.db;
    ciDDBRepository.configData = {
        candInfoTableName: process.env.candInfoTableName || '',
    };

    let ciHandlerDomainService = new CandidateInformationDomainService();
    ciHandlerDomainService.ddbRepository = ciDDBRepository;

    const applicationService = new CandidateInformationHandlerApplicationService();
    applicationService.domainService = ciHandlerDomainService;

    const candidateInformationApiItem: CandidateInformationApiItem ={
        candidateId:"1991-06-10-3435",
        firstName:"Jack",
        lastName:"Sparrow",
        dob:"1991-06-10T14:50:21Z",
        email:"jsparrow@gmail.com.com",
        sortKey:"email",
        ssn:"522-67-3435",
        updatedDate:"2021-02-18T01:01:56.242Z",
        createDate: "2021-02-18T01:01:56.242Z",
        address:{
            default:{
                city:"Bronx",
                countryCode:"US",
                line1:"453 Mongo Park",
                line2:"",
                stateCode:"Who Knows",
                zip4:"10253",
                zip5:""
            }
        }
    };

    chai.use(chaiPromised);
    let expect = chai.expect;

    this.afterEach(function () {
        sandbox.restore();
    });

    describe('input-validation', function () {

        it('save-candidate-information-with-no-ssn-value', function () {
            let candidateInformationEvent: CandidateInformationEvent = {
                httpMethod: 'POST',
                body: '{}'
            };

            return expect(
                applicationService.processCandidateInformationEvent(candidateInformationEvent)
            ).eventually.rejectedWith(Error,'The body is missing DOB or SSN which cannot be empty.');

        });

        it('save-candidate-information-with-body', function () {
            let candidateInformationEvent: CandidateInformationEvent = {
                httpMethod: 'POST',
                body: '{"candidateId":"", "firstName":"Jack", "lastName":"Sparrow", "dob":"1991-06-10T14:50:21Z", "email":"jsparrow@gmail.com.com", "sortKey":"email", "ssn":"522-67-3435", "createDate":"", "updatedDate":"", "address":{"default":{"city":"Bronx", "countryCode":"US", "line1":"453 Mongo Park", "line2":"", "stateCode":"Who Knows", "zip4":"10253", "zip5":"11574"}}}'
            };

            sandbox.stub(ciHandlerDomainService, 'addCandidatesInformation').resolves(candidateInformationApiItem);

            return expect(
                applicationService.processCandidateInformationEvent(candidateInformationEvent)
            ).become(candidateInformationApiItem);

        });

        it('get-all-candidate-information', function () {
            let candidateInformationEvent: CandidateInformationEvent = {
                httpMethod: 'GET',
                body: '',
            };

            sandbox.stub(ciHandlerDomainService, 'getCandidatesInformation').resolves(candidateInformationApiItem);

            return expect(
                applicationService.processCandidateInformationEvent(candidateInformationEvent)
            ).become(candidateInformationApiItem);

        });

        it('get-candidate-information-by-candidateId', function () {
            let candidateInformationEvent: CandidateInformationEvent = {
                httpMethod: 'GET',
                candidateId: "1991-06-10-3435",
                body: '',
            };

            sandbox.stub(ciHandlerDomainService, 'getCandidatesInformationForOne').resolves(candidateInformationApiItem);

            return expect(
                applicationService.processCandidateInformationEvent(candidateInformationEvent)
            ).become(candidateInformationApiItem);

        });

        it('delete-candidate-information-by-candidateId', function () {
            let candidateInformationEvent: CandidateInformationEvent = {
                httpMethod: 'DELETE',
                candidateId: "1991-06-10-3435",
                body: '',
            };

            sandbox.stub(ciHandlerDomainService, 'deleteCandidatesInformation').resolves("Item 1991-06-10-3435 has been deleted");

            return expect(
                applicationService.processCandidateInformationEvent(candidateInformationEvent)
            ).become("Item 1991-06-10-3435 has been deleted");

        });

        it('delete-candidate-information-with-no-candidateId', function () {
            let candidateInformationEvent: CandidateInformationEvent = {
                httpMethod: 'DELETE',
                candidateId: undefined,
                body: '',
            };

            return expect(
                applicationService.processCandidateInformationEvent(candidateInformationEvent)
            ).eventually.rejectedWith(Error,"No candidate ID in the path parameters. Candidate ID cannot be empty.");

        });

        it('update-candidate-information-with-no-body', function () {
            let candidateInformationEvent: CandidateInformationEvent = {
                httpMethod: 'PATCH',
                candidateId: '1991-06-10-3435',
                body: '{}',
            };

            return expect(
                applicationService.processCandidateInformationEvent(candidateInformationEvent)
            ).eventually.rejectedWith(Error, 'The body has no data. Request body cannot be empty.');

        });

        it('update-candidate-information-with-no-candidateId', function () {
            let candidateInformationEvent: CandidateInformationEvent = {
                httpMethod: 'PATCH',
                body: '{"candidateId":"", "firstName":"Jack", "lastName":"Sparrow", "dob":"1991-06-10T14:50:21Z", "email":"jsparrow@gmail.com.com", "sortKey":"email", "ssn":"522-67-3435", "createDate":"", "updatedDate":"", "address":{"default":{"city":"Bronx", "countryCode":"US", "line1":"453 Mongo Park", "line2":"", "stateCode":"Who Knows", "zip4":"10253", "zip5":"11574"}}}'
            };

            return expect(
                applicationService.processCandidateInformationEvent(candidateInformationEvent)
            ).eventually.rejectedWith(Error, 'No candidate ID in the path parameters. Candidate ID cannot be empty.');

        });

        it('update-candidate-information-normal', function () {
            let candidateInformationEvent: CandidateInformationEvent = {
                httpMethod: 'PATCH',
                candidateId: '1991-06-10-3435',
                body: '{"candidateId":"", "firstName":"Jack", "lastName":"Sparrow", "dob":"1991-06-10T14:50:21Z", "email":"jsparrow@gmail.com.com", "sortKey":"email", "ssn":"522-67-3435", "createDate":"", "updatedDate":"", "address":{"default":{"city":"Bronx", "countryCode":"US", "line1":"453 Mongo Park", "line2":"", "stateCode":"Who Knows", "zip4":"10253", "zip5":"11574"}}}'
            };

            sandbox.stub(ciHandlerDomainService, 'putCandidatesInformation').resolves(candidateInformationApiItem);

            return expect(
                applicationService.processCandidateInformationEvent(candidateInformationEvent)
            ).become(candidateInformationApiItem);

        });

    });
});