export interface HandlerConfigData {
    candInfoTableName : string;
}

export interface CandidateInformationDBEntity{
    candidateId : string,
    fNam: string,
    lNam: string,
    dob: string,
    email: string,
    adr: {
        dflt: {
            city: string,
            cntryCde: string,
            ln1: string,
            ln2: string,
            stateCde: string,
            zip4: string,
            zip5: string
        }
    },
    sk: string,
    ssn: string,
    cretDte: string,
    updDte: string,
}

export interface CandidateInformationApiItem{
    candidateId : string,
    firstName: string,
    lastName: string,
    dob: string,
    email: string,
    address: {
        default: {
            city: string,
            countryCode: string,
            line1: string,
            line2: string,
            stateCode: string,
            zip4: string,
            zip5: string
        }
    },
    sortKey: string,
    ssn: string,
    createDate: string,
    updatedDate: string,
}
