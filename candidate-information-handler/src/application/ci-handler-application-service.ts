import path from 'path';
import { CandidateInformationApiItem } from '../domain/model/ci-db-entity'
import { CandidateInformationDomainService } from "../domain/service/ci-handler-domain-service";
import {CandidateInformationEvent} from "../domain/model/ci-event";
import { mdcLog } from '../domain/model/mdc-log';

export class CandidateInformationHandlerApplicationService {
    private _domainService!: CandidateInformationDomainService;

    public set domainService(domainService: CandidateInformationDomainService){
        this._domainService = domainService;
    }

    public async processCandidateInformationEvent(event: CandidateInformationEvent): Promise<CandidateInformationApiItem | Object > {
        console.log(mdcLog.getClassMDC('CandidateInformationHandlerApplicationService', `processEvent-START`));

        let result: CandidateInformationApiItem = <CandidateInformationApiItem>{};

        if (event.httpMethod.toUpperCase() === 'GET') {
            if (event.candidateId){
                try{
                    result = await this._domainService.getCandidatesInformationForOne(event.candidateId);
                }catch(error){
                    throw error
                }
            }else{
                try{
                    let items: CandidateInformationApiItem[];
                    items = await this._domainService.getCandidatesInformation();
                    return items
                }catch(error){
                    throw error
                }
            }
        }

        if (event.httpMethod.toUpperCase() === 'POST') {
            let addRequest: CandidateInformationApiItem = <CandidateInformationApiItem>JSON.parse(event.body)

            try{
                if(!addRequest.dob || !addRequest.ssn){
                    throw new Error("The body is missing DOB or SSN which cannot be empty.")
                }
                addRequest.candidateId = addRequest.dob.substr(0,10) + '-' + addRequest.ssn.substr(7,10);

                result = await this._domainService.addCandidatesInformation(addRequest);
            }catch(error){
                throw error
            }
        }

        if (event.httpMethod.toUpperCase() === 'DELETE') {

            try{
                if(!event.candidateId){
                    throw new Error("No candidate ID in the path parameters. Candidate ID cannot be empty.");
                }

                let delResult: string = await this._domainService.deleteCandidatesInformation(event.candidateId);
                console.log(`%s sucessfully deleted candidate`, mdcLog.getMDC());
                return delResult
            }catch(error){
                throw error;
            }
        }


        if (event.httpMethod.toUpperCase() === 'PATCH') {
            let putRequest: CandidateInformationApiItem = <CandidateInformationApiItem>JSON.parse(event.body);

            try{
                if(!putRequest.ssn || !putRequest.dob){
                    throw new Error("The body has no data. Request body cannot be empty.");
                }

                if(!event.candidateId){
                    throw new Error("No candidate ID in the path parameters. Candidate ID cannot be empty.");
                }

                result = await this._domainService.putCandidatesInformation(event.candidateId, putRequest);
            }catch(error){
                throw error
            }

        }
        console.log(mdcLog.getClassMDC('CandidateInformationHandlerApplicationService', `processEvent-END`));

        return result;
    }

}
