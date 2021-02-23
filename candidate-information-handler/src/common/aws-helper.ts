import { DynamoDB } from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

class AwsHelper{
    private _db : DynamoDB.DocumentClient;
    private _AWS : any;

    constructor(){
        this._AWS = require('aws-sdk');

        this._db = this.initDB();
    }

    get db() : DynamoDB.DocumentClient{
        return this._db;
    }


    private initDB(): DynamoDB.DocumentClient{

        let config : DocumentClient.DocumentClientOptions & DynamoDB.Types.ClientConfiguration = {};

        if(process.env.AWS_SAM_LOCAL){
          config.endpoint = "http://dynamodb:8000";
          //return new DynamoDB.DocumentClient(config);
        }

        return new this._AWS.DynamoDB.DocumentClient(config);
    }

}

export const awsHelper = new AwsHelper();