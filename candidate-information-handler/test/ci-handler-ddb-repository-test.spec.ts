import chai from 'chai';
import chaiPromised from 'chai-as-promised';
import sinon from 'sinon';

import {AWSError, DynamoDB} from 'aws-sdk';
import { CandidateInformationApiItem, CandidateInformationDBEntity } from '../src/domain/model/ci-db-entity'
import { CandidateInformationDDBRepository } from "../src/infrastructure/persistence/ci-handler-ddb-repository";

describe('ci-handler-ddb-repository-test-suite', function () {

    let sandbox = sinon.createSandbox();

    let ciDDBRepository = new CandidateInformationDDBRepository();

    let dbClient = new DynamoDB.DocumentClient();
    ciDDBRepository.db = dbClient
    ciDDBRepository.configData = {
        candInfoTableName: 'process.env.candInfoTableName',
    };

    chai.use(chaiPromised);
    let expect = chai.expect;

    this.afterEach(function () {
        sandbox.restore();
    });

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

    let candidateInformationApiItem: CandidateInformationApiItem ={
        candidateId:"1991-06-10-3435",
        firstName:"Jack",
        lastName:"Sparrow",
        dob:"1991-06-10T14:50:21Z",
        email:"jsparrow@gmail.com.com",
        sortKey:"CI",
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

    it('update-candidate-information-in-database', function () {
        sandbox.stub(dbClient, 'put').returns({
            promise: () =>
                Promise.resolve(<DynamoDB.DocumentClient.PutItemOutput>{
                    Item : newCandidateDDBItem
                }),
        });

        return expect(ciDDBRepository.putCandidateInformationApiItem(newCandidateDDBItem)).become(candidateInformationApiItem);
    });

    it('add-candidate-information-to-database', function () {
        sandbox.stub(dbClient, 'put').returns({
            promise: () =>
                Promise.resolve(<DynamoDB.DocumentClient.PutItemOutput>{
                    Item : newCandidateDDBItem
                }),
        });

        return expect(ciDDBRepository.addCandidateInformationApiItem(newCandidateDDBItem)).become(candidateInformationApiItem);
    });

    it('get-all-candidate-information-from-database', function () {
        sandbox.stub(dbClient, 'scan').returns({
            promise: () =>
                Promise.resolve(<DynamoDB.DocumentClient.ScanOutput>{}),
        });

        // @ts-ignore
        return expect(ciDDBRepository.getCandidateInformationApiItem()).become(<CandidateInformationApiItem>[]);
    });

    it('get-candidate-information-from-database-by-candidateId', function () {
        const candId: string = '1991-06-10-3435';

        sandbox.stub(dbClient, 'get').returns({
            promise: () =>
                Promise.resolve(<DynamoDB.DocumentClient.GetItemOutput>{
                    Key: {
                        candidateId: candId,
                        sk: 'CI'
                    },
                }),
        });

        sandbox.stub(ciDDBRepository, 'convertItem').resolves(candidateInformationApiItem);

        return expect(ciDDBRepository.getCandidateInformationApiItemForOne(candId)).become(<CandidateInformationApiItem>{});
    });

    it('delete-candidate-information-from-database-by-candidateId', function () {
        const candId: string = '1991-06-10-3435';

        sandbox.stub(dbClient, 'delete').returns({
            promise: () =>
                Promise.resolve(<DynamoDB.DocumentClient.DeleteItemOutput>{
                    Key: {
                        candidateId: candId,
                        sk: 'CI'
                    },
                }),
        });

        return expect(ciDDBRepository.deleteCandidateInformationApiItem(candId)).become("Item '1991-06-10-3435' has been deleted");
    });

    it('delete-candidate-information-from-database-by-candidateId-fails', function () {
        const candId: string = '1991-06-10-3435';

        sandbox.stub(dbClient, 'delete').throwsException();

        return expect(ciDDBRepository.deleteCandidateInformationApiItem(candId)).become("Item not processed. Could not delete item from database, Error: Error");
    });

    it('get-candidate-information-from-database-by-candidateId-fails', function () {
        const candId: string = '1991-06-10-3435';

        sandbox.stub(dbClient, 'get').throwsException();

        return expect(ciDDBRepository.getCandidateInformationApiItemForOne(candId)).eventually.rejectedWith(Error);
    });

    it('get-all-candidate-information-from-database-fails', function () {
        sandbox.stub(dbClient, 'get').throwsException();

        return expect(ciDDBRepository.getCandidateInformationApiItem()).eventually.rejectedWith(Error);
    });

    it('update-candidate-information-from-database-fails', function () {
        sandbox.stub(dbClient, 'put').returns({
            promise: () =>
                Promise.reject(<DynamoDB.DocumentClient.PutItemOutput>{
                    Item : newCandidateDDBItem
                }),
        });

        return expect(ciDDBRepository.putCandidateInformationApiItem(newCandidateDDBItem)).eventually.rejectedWith(Error);
    });

    it('add-candidate-information-to-database-fails', function () {
        sandbox.stub(dbClient, 'put').returns({
            promise: () =>
                Promise.reject(<DynamoDB.DocumentClient.PutItemOutput>{
                    Item : newCandidateDDBItem
                }),
        });

        return expect(ciDDBRepository.addCandidateInformationApiItem(newCandidateDDBItem)).eventually.rejectedWith(Error);
    });


    it('convert-information-for-candidate', function () {

        return expect(ciDDBRepository.convertItem(newCandidateDDBItem)).become(candidateInformationApiItem);
    });

});