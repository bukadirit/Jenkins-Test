import {ErrorResponseModel} from "./error-response-model";

export function errorResponseModel(errCode:string, errDescription:string, batchReqData: ErrorResponseModel[]):string{

    let errorResponseModel: ErrorResponseModel = {
        errorCode:errCode,
        errorDescription:errDescription
    };
    batchReqData.push(errorResponseModel);
    return JSON.stringify(batchReqData);
}