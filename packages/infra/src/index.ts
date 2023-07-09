import { serverFactory } from "server";
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from "@as-integrations/aws-lambda";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const DATABASE_NAME = "postgres";
const DATABASE_SCHEMA = "public";

async function getSecret() {
  console.log(`Getting secret from: ${process.env.SECRET_ID}`);
  const secretsManagerClient = new SecretsManagerClient({
    region: process.env.AWS_REGION!,
  });
  const getSecretValueCommand = new GetSecretValueCommand({
    SecretId: process.env.SECRET_ID,
  });
  const getSecretValueCommandResponse = await secretsManagerClient.send(
    getSecretValueCommand
  );
  return JSON.parse(getSecretValueCommandResponse.SecretString!);
}

export const handler = async (event: any, context: any, callback: any) => {
  const secret = await getSecret();
  const databaseUrl = `postgresql://${secret.username}:${secret.password}@${secret.host}:${secret.port}/${DATABASE_NAME}?schema=${DATABASE_SCHEMA}`;

  const server = serverFactory(databaseUrl);
  const serverHandler = startServerAndCreateLambdaHandler(
    server,
    handlers.createAPIGatewayProxyEventRequestHandler()
  );

  return serverHandler(event, context, callback);
};
