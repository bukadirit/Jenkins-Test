import chai from 'chai';
import chaiPromised from 'chai-as-promised';
import sinon from 'sinon';

import { awsHelper } from '../src/common/aws-helper'
import { CandidateInformationApiItem, CandidateInformationDBEntity } from '../src/domain/model/ci-db-entity'
import { CandidateInformationDomainService } from "../src/domain/service/ci-handler-domain-service";
import { CandidateInformationDDBRepository } from "../src/infrastructure/persistence/ci-handler-ddb-repository";

describe('ci-handler-domain-service-test-suite', function () {
    const sandbox = sinon.createSandbox();

    let ciDDBRepository = new CandidateInformationDDBRepository();
    ciDDBRepository.db =  awsHelper.db;
    ciDDBRepository.configData = {
        candInfoTableName: process.env.candInfoTableName || '',
    };

    let ciHandlerDomainService = new CandidateInformationDomainService();
    ciHandlerDomainService.ddbRepository = ciDDBRepository;

    chai.use(chaiPromised);
    let expect = chai.expect;

    this.afterEach(function () {
        sandbox.restore();
    });

    let candidateInformationApiItem: CandidateInformationApiItem ={
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

    const newCandidateDDBItem: CandidateInformationDBEntity = {
        candidateId:"1991-06-10-3435",
        fNam:"Jack",
        lNam:"Sparrow",
        dob:"1991-06-10T14:50:21Z",
        email:"jsparrow@gmail.com.com",
        sk:"CI",
        ssn:"522-67-3435",
        updDte:"2021-02-18T01:01:56.242Z",
        cretDte: "2021-02-18T01:01:56.242Z",
        adr:{
            dflt:{
                city:"Bronx",
                cntryCde:"US",
                ln1:"453 Mongo Park",
                ln2:"",
                stateCde:"Who Knows",
                zip4:"10253",
                zip5:""
            }
        }
    }

    describe('input-validation', function () {
        it('get-information-for-all-candidates', function () {
            sandbox.stub(ciDDBRepository, 'getCandidateInformationApiItem').resolves(candidateInformationApiItem);

            return expect(ciHandlerDomainService.getCandidatesInformation()).become(candidateInformationApiItem);
        });

        it('get-information-candidate-by-candidateId', function () {
            const candidateId: string = '1991-06-10-3435'

            sandbox.stub(ciDDBRepository, 'getCandidateInformationApiItemForOne').resolves(candidateInformationApiItem);

            return expect(ciHandlerDomainService.getCandidatesInformationForOne(candidateId)).become(candidateInformationApiItem);
        });

        it('create-information-for-candidate', function () {
            const testDate = "2021-02-18T01:01:56.242Z"
            sandbox.useFakeTimers(new Date(testDate));

            return expect(ciHandlerDomainService.createCandidateDDBItem(candidateInformationApiItem)).become(newCandidateDDBItem);
        });

        it('update-information-for-candidate', function () {
            const testDate = "2021-02-18T01:01:56.242Z"
            sandbox.useFakeTimers(new Date(testDate));

            return expect(ciHandlerDomainService.updateCandidateDDBItem(candidateInformationApiItem)).become(newCandidateDDBItem);
        });

        it('add-information-for-candidate', function () {

            sandbox.stub(ciDDBRepository, 'addCandidateInformationApiItem').resolves(candidateInformationApiItem);

            sandbox.stub(ciHandlerDomainService, 'updateCandidateDDBItem').resolves(newCandidateDDBItem);

            return expect(ciHandlerDomainService.addCandidatesInformation(candidateInformationApiItem)).become(candidateInformationApiItem);
        });

        it('delete-information-for-candidate', function () {
            const candidateId: string = '1991-06-10-3435';
            sandbox.stub(ciDDBRepository, 'deleteCandidateInformationApiItem').resolves(`Item '${candidateId}' has been deleted`);

            return expect(ciHandlerDomainService.deleteCandidatesInformation(candidateId)).become(`Item '${candidateId}' has been deleted`);
        });

        it('put-update-information-for-candidate', function () {
            const candidateId: string = '1991-06-10-3435';

            sandbox.stub(ciDDBRepository, 'getCandidateInformationApiItemForOne').resolves(candidateInformationApiItem);

            sandbox.stub(ciHandlerDomainService, 'updateCandidateDDBItem').resolves(newCandidateDDBItem);

            sandbox.stub(ciDDBRepository, 'putCandidateInformationApiItem').resolves(candidateInformationApiItem);

            return expect(ciHandlerDomainService.putCandidatesInformation(candidateId, candidateInformationApiItem)).become(candidateInformationApiItem);
        });

        it('put-create-information-for-candidate', function () {
            const candidateId: string = '1991-06-10-3435';

            sandbox.stub(ciDDBRepository, 'getCandidateInformationApiItemForOne').resolves({});

            sandbox.stub(ciHandlerDomainService, 'createCandidateDDBItem').resolves(newCandidateDDBItem);

            sandbox.stub(ciDDBRepository, 'putCandidateInformationApiItem').resolves(candidateInformationApiItem);

            return expect(ciHandlerDomainService.putCandidatesInformation(candidateId, candidateInformationApiItem)).become(candidateInformationApiItem);
        });

    });

});