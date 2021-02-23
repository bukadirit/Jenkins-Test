 import {Context, APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import { CandidateInformationHandlerApplicationService } from "./application/ci-handler-application-service";
import {CandidateInformationDomainService} from "./domain/service/ci-handler-domain-service";
import {CandidateInformationDDBRepository} from "./infrastructure/persistence/ci-handler-ddb-repository";
import {CandidateInformationEvent} from "./domain/model/ci-event";
import {awsHelper} from "./common/aws-helper";
 import {mdcLog} from "./domain/model/mdc-log";
 import {errorResponseModel} from "./common/util";
 import {ErrorResponseModel} from "./common/error-response-model";

export const handler = async (event:APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> =>{
    let batchReqDataArr: ErrorResponseModel[] = [];
    mdcLog.version = context.functionVersion;

    console.log(
        mdcLog.getClassMDC('candidateInformationHandlerFunction', 'candidate information retrieval function invoked')
    );

    try {
        console.log(mdcLog.getClassMDC('candidateInformationHandlerFunction', `incoming Event=${JSON.stringify(event)}`));

        mdcLog.rqstid = event.requestContext.requestId;

        const queries = JSON.stringify(event.pathParameters)+","+JSON.stringify(event.queryStringParameters);
        console.log(
            mdcLog.getClassMDC(
                'candidateInformationHandlerFunction',
                `requestId = ${event.requestContext.requestId}, httpMethod=${event.httpMethod.toUpperCase()}, queries = ${queries}`
            )
        );


        if(event.pathParameters && event.pathParameters.candidateId){
            mdcLog.candId = <string>event.pathParameters!.candidateId;
            console.log(
                mdcLog.getClassMDC(
                    'candidateInformationHandlerFunction',
                    `Received canidateId: ${event.pathParameters!.candidateId}`
                )
            );
        }

        const applicationService = new CandidateInformationHandlerApplicationService();
        const ciHandlerDomainService = new CandidateInformationDomainService();
        let ciDDBRepository = new CandidateInformationDDBRepository()

        ciDDBRepository.db = awsHelper.db;
        ciDDBRepository.configData = {
            candInfoTableName: process.env.candInfoTableName || '',
        };
        ciHandlerDomainService.ddbRepository = ciDDBRepository;
        applicationService.domainService = ciHandlerDomainService;

        let candidateInformationEvent: CandidateInformationEvent;
        if (event.pathParameters) {
            candidateInformationEvent = {
                httpMethod: event.httpMethod,
                body: event.body!,
                candidateId: event.pathParameters!.candidateId,
            }
        } else {
            candidateInformationEvent = {
                httpMethod: event.httpMethod,
                body: event.body!,
            }
        }

        return applicationService
            .processCandidateInformationEvent(candidateInformationEvent)
            .then(result => {
                return <APIGatewayProxyResult>{
                    statusCode: 200,
                    headers: {"Access-Control-Allow-Origin": "*"},
                    body: JSON.stringify(result)
                };
            })
            .catch(error => {
                console.error(
                    mdcLog.getClassMDCErrorWithAttrs(
                        'candidateInformationHandlerFunction',
                        'res=error',
                        new Error(`'Error in getting data from db' ${error}`)
                    )
                );
                errorResponseModel("502",`${error}`,batchReqDataArr);
                return <APIGatewayProxyResult>{
                    body: errorResponseModel("501","Lambda processing error",batchReqDataArr)
                };
            });
    }catch(error){
        console.error(mdcLog.getClassMDCErrorWithAttrs('candidateInformationHandlerFunction', 'res=error', error));
        throw error;
    }
}