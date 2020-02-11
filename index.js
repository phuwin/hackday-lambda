const aws = require('aws-sdk');

function createBackup(dbName, backupName){
    const dynamodb = new aws.DynamoDB({apiVersion: '2012-08-10'});
    const params = {
      BackupName: backupName,
      TableName: dbName
    };
    return dynamodb.createBackup(params).promise();
}

function sendEmail(recipients, title, message, sourceEmailAddress) {
    const ses = new aws.SES();
    const params = {
          Destination: { /* required */
            ToAddresses: recipients
          },
          Message: { /* required */
            Body: { /* required */
              Text: {
               Charset: "UTF-8",
               Data: message
              }
             },
             Subject: {
              Charset: 'UTF-8',
              Data: title
             }
            },
          Source: sourceEmailAddress
    };
    return ses.sendEmail(params).promise();
}

exports.handler = async (event) => {
    // TODO implement
    const {
        email, dynamoDbTable, region, sourceEmailAddress
    } = process.env;
    aws.config.update({region});
    try {
        const backUpName = `${dynamoDbTable}-backup-${new Date().getTime()}`;
        await createBackup(dynamoDbTable, backUpName);
        
        const title = `${dynamoDbTable} has been backed up`;
        const message = `${dynamoDbTable} has been backed up. \n\n You can check the backup data in DynamoDb now.`;
        await sendEmail([email], title, message, sourceEmailAddress);
    } catch (err) {
        console.error(err);
        const response = {
            statusCode: 500,
            body: err.message,
        };
        return response;
    }
};
