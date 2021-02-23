import { DynamoDB } from 'aws-sdk';
import { CandidateInformationApiItem, CandidateInformationDBEntity, HandlerConfigData} from "../../domain/model/ci-db-entity";
import { mdcLog } from '../../domain/model/mdc-log';

export class CandidateInformationDDBRepository {
    private _db!: DynamoDB.DocumentClient;
    private _configData!: HandlerConfigData;

    public set db(db: DynamoDB.DocumentClient) {
        this._db = db;
    }

    public set configData(configData: HandlerConfigData) {
        this._configData = configData;
    }

    public async getCandidateInformationApiItem(): Promise<CandidateInformationApiItem[]> {
        let candidateInformationApiItem: CandidateInformationApiItem[] = [];
        console.log(
            mdcLog.getClassMDC(
                'CandidateInformationDDBRepository',
                `Querying Candidate Information for all candidates`
            )
        );

        let params ={
            TableName: this._configData.candInfoTableName,
        }

        try{
            const resp = await this._db.scan(params).promise();

            if (resp.Items) {
                for (const item of resp.Items) {
                    candidateInformationApiItem.push(await this.convertItem(<CandidateInformationDBEntity>item));
                }
            }
        }catch(err){
            console.log(`Failed to get data from repository, ${err}`)
            throw err;
        }

        console.log(
            mdcLog.getClassMDC(
                'CandidateInformationDDBRepository',
                `AllCandidateInformation= ${JSON.stringify(candidateInformationApiItem)}`
            )
        );

        return candidateInformationApiItem;
    }

    public async getCandidateInformationApiItemForOne(candidateId: string): Promise<CandidateInformationApiItem> {
        let candidateInformationApiItem: CandidateInformationApiItem = <CandidateInformationApiItem>{};
        console.log(
            mdcLog.getClassMDC(
                'CandidateInformationDDBRepository',
                `Querying Candidate Information for candidate ${candidateId}`
            )
        );

        let params ={
            TableName: this._configData.candInfoTableName,
            Key: {
                candidateId: candidateId,
                sk: 'CI'
            }
        }

        try{
            const resp = await this._db.get(params).promise();

            if (resp.Item) {
                return await this.convertItem(<CandidateInformationDBEntity>resp.Item).then((result) => {
                    console.log(
                        mdcLog.getClassMDC(
                            'CandidateInformationDDBRepository',
                            `CandidateInformation= ${JSON.stringify(result)}`
                        )
                    );
                    return result;
                })
            }
        }catch(error){
            console.log(`Failed to get data from repository, ${error}`)
            throw error
        }

        return candidateInformationApiItem;
    }

    public async addCandidateInformationApiItem(newCandidateDDBItem: CandidateInformationDBEntity): Promise<CandidateInformationApiItem>  {
        return this._db
            .put({
                TableName: this._configData.candInfoTableName,
                Item: newCandidateDDBItem,
            })
            .promise()
            .then((data) =>{
                return this.convertItem(newCandidateDDBItem)
                    .then(res =>{
                        return res;
                    })
            })
            .catch((error) =>{
                throw new Error(`Item not processed. Could not add item to database, ${error}`)
            })

    }

    public async deleteCandidateInformationApiItem(candidateId: string): Promise<string> {
        let result: string = 'Item not processed. Could not delete item to database';
        console.log(
            mdcLog.getClassMDC(
                'CandidateInformationDDBRepository',
                `Querying for delete Candidate Information for candidate ${candidateId}`
            )
        );

        let params = {
            TableName: this._configData.candInfoTableName,
            Key: {
                candidateId: candidateId,
                sk: 'CI'
            },
        };

        try {
            await this._db.delete(params).promise();
            result = `Item '${candidateId}' has been deleted`;
        } catch (error) {
            result = `Item not processed. Could not delete item from database, ${error}`;
            console.error(
                mdcLog.getClassMDC(
                    'CandidateInformationDDBRepository',
                    `Failed to delete Candidate Information for candidate ${candidateId} error= ${error}`
                )
            );

        }

        return result;
    }

    public async putCandidateInformationApiItem(updateCandidateDDBItem: CandidateInformationDBEntity): Promise<CandidateInformationApiItem> {
        return this._db
            .put({
                TableName: this._configData.candInfoTableName,
                Item: updateCandidateDDBItem,
            })
            .promise()
            .then((data) =>{
                return this.convertItem(updateCandidateDDBItem).then((res =>{
                    return res
                }))
            })
            .catch((error) =>{
                throw new Error(`Item not processed. Could not update item in database, ${error}`)
            })

    }

    public async convertItem(candidate: CandidateInformationDBEntity): Promise<CandidateInformationApiItem> {
        let item: CandidateInformationApiItem = {
            candidateId: candidate.candidateId,
            firstName: candidate.fNam,
            lastName: candidate.lNam,
            dob: candidate.dob,
            email: candidate.email,
            sortKey: candidate.sk,
            ssn: candidate.ssn,
            createDate: candidate.cretDte,
            updatedDate: candidate.updDte,
            address: {
                default: {
                    city: candidate.adr.dflt.city,
                    countryCode: candidate.adr.dflt.cntryCde,
                    line1: candidate.adr.dflt.ln1,
                    line2: candidate.adr.dflt.ln2,
                    stateCode: candidate.adr.dflt.stateCde,
                    zip4: candidate.adr.dflt.zip4,
                    zip5: candidate.adr.dflt.zip5,
                },
            },
        };
        return item;
    }
}
