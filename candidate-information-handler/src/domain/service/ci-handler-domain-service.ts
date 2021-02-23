import { CandidateInformationDDBRepository } from "../../infrastructure/persistence/ci-handler-ddb-repository";
import {CandidateInformationApiItem, CandidateInformationDBEntity} from "../model/ci-db-entity";

export class CandidateInformationDomainService{
    private _ddbRepository!: CandidateInformationDDBRepository;

    public set ddbRepository(ddbRepository: CandidateInformationDDBRepository){
        this._ddbRepository =ddbRepository;
    }

    public async getCandidatesInformation(): Promise<CandidateInformationApiItem[]>{
        return await this._ddbRepository.getCandidateInformationApiItem();
    }

    public async getCandidatesInformationForOne(candidateId: string): Promise<CandidateInformationApiItem>{
        return await this._ddbRepository.getCandidateInformationApiItemForOne(candidateId);
    }

    public async addCandidatesInformation(addRequest: CandidateInformationApiItem): Promise<CandidateInformationApiItem> {
        let newCandidateDDBItem: CandidateInformationDBEntity = await this.createCandidateDDBItem(addRequest)
        return await this._ddbRepository.addCandidateInformationApiItem(newCandidateDDBItem);
    }

    public async deleteCandidatesInformation(candidateId: string): Promise<string> {
        return await this._ddbRepository.deleteCandidateInformationApiItem(candidateId);
    }

    public async putCandidatesInformation(candidateId: string, putRequest: CandidateInformationApiItem): Promise<CandidateInformationApiItem> {
        let oldCandInfo: CandidateInformationApiItem = await this._ddbRepository.getCandidateInformationApiItemForOne(candidateId);
        if (Object.keys(oldCandInfo).length != 0){
            let updateCandidateDDBItem: CandidateInformationDBEntity = await this.updateCandidateDDBItem(putRequest)
            return await this._ddbRepository.putCandidateInformationApiItem(updateCandidateDDBItem);
        }else{
            let newCandidateDDBItem: CandidateInformationDBEntity = await this.createCandidateDDBItem(putRequest)
            return await this._ddbRepository.putCandidateInformationApiItem(newCandidateDDBItem);
        }
    }

    public async createCandidateDDBItem(candidate: CandidateInformationApiItem): Promise<CandidateInformationDBEntity> {
        let newCandidateDDBItem: CandidateInformationDBEntity = {
            candidateId: candidate.candidateId,
            fNam: candidate.firstName,
            lNam: candidate.lastName,
            dob: candidate.dob,
            email: candidate.email,
            adr: {
                dflt: {
                    city: candidate.address?.default.city,
                    cntryCde: candidate.address?.default.countryCode,
                    ln1: candidate.address?.default.line1,
                    ln2: candidate.address?.default.line2,
                    stateCde: candidate.address?.default.stateCode,
                    zip4: candidate.address?.default.zip4,
                    zip5: candidate.address?.default.zip5,
                },
            },
            sk: 'CI',
            ssn: candidate.ssn,
            cretDte: new Date(Date.now()).toISOString(),
            updDte: new Date(Date.now()).toISOString()
        };
        return newCandidateDDBItem;
    }

    public async updateCandidateDDBItem(candidate: CandidateInformationApiItem): Promise<CandidateInformationDBEntity> {
        let updateCandidateDDBItem: CandidateInformationDBEntity = {
            candidateId: candidate.candidateId,
            fNam: candidate.firstName,
            lNam: candidate.lastName,
            dob: candidate.dob,
            email: candidate.email,
            adr: {
                dflt: {
                    city: candidate.address?.default.city,
                    cntryCde: candidate.address?.default.countryCode,
                    ln1: candidate.address?.default.line1,
                    ln2: candidate.address?.default.line2,
                    stateCde: candidate.address?.default.stateCode,
                    zip4: candidate.address?.default.zip4,
                    zip5: candidate.address?.default.zip5,
                },
            },
            sk: 'CI',
            ssn: candidate.ssn,
            cretDte: candidate.createDate,
            updDte: new Date(Date.now()).toISOString()
        };
        return updateCandidateDDBItem;
    }
}