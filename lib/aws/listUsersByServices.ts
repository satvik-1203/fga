import prisma from "#/prisma/prisma.config";
import {
  IAMClient,
  ListUsersCommand,
  ListAttachedUserPoliciesCommand,
  ListUserPoliciesCommand,
  GetPolicyCommand,
  GetPolicyVersionCommand,
  GetUserPolicyCommand,
} from "@aws-sdk/client-iam";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { currentUser } from "@clerk/nextjs/server";

// Map type definition: service name as key, array of users as value
type ServiceAccessMap = Map<string, string[]>;

const mainAwsServices = [
  "s3",
  "ec2",
  "dynamodb",
  "lambda",
  "sqs",
  "sns",
  "cloudwatch",
  "iam",
  "rds",
  "cloudformation",
  "apigateway",
  "s3",
  "amplify",
  "route53",
];

// Main function to retrieve service access map
export async function getServiceAccessMap(): Promise<ServiceAccessMap> {
  const serviceAccessMap: ServiceAccessMap = new Map();
  mainAwsServices.forEach((service) => serviceAccessMap.set(service, []));
  const currUser = await currentUser();
  const prismaUser = await prisma.user.findUnique({
    where: {
      id: currUser!.id,
    },
  });
  const sessionRoleArn = prismaUser?.awsRoleArn;

  // Initialize clients, using AssumeRole if a session role ARN is provided
  const iamClient = sessionRoleArn
    ? await getClientWithAssumedRole(sessionRoleArn)
    : new IAMClient({});

  try {
    // Step 1: List all IAM users
    const listUsersResponse = await iamClient.send(new ListUsersCommand({}));
    const users = listUsersResponse.Users || [];

    // Step 2: Iterate over each user
    for (const user of users) {
      const userName = user.UserName;
      if (!userName) {
        continue;
      }
      console.log(`Checking services accessible by user: ${userName}`);

      // Step 3: Get user's attached policies and inline policies
      const attachedPolicies = await iamClient.send(
        new ListAttachedUserPoliciesCommand({ UserName: userName })
      );
      const inlinePolicies = await iamClient.send(
        new ListUserPoliciesCommand({ UserName: userName })
      );

      // Step 4: Analyze attached policies for accessible services
      if (attachedPolicies.AttachedPolicies) {
        for (const policy of attachedPolicies.AttachedPolicies) {
          await addPolicyServicesToMap(
            iamClient,
            policy.PolicyArn!,
            userName,
            serviceAccessMap
          );
        }
      }

      // Step 5: Analyze inline policies for accessible services
      if (inlinePolicies.PolicyNames) {
        for (const policyName of inlinePolicies.PolicyNames) {
          const userPolicy = await iamClient.send(
            new GetUserPolicyCommand({
              UserName: userName,
              PolicyName: policyName,
            })
          );
          extractServicesFromPolicyDocument(
            userPolicy.PolicyDocument,
            userName,
            serviceAccessMap
          );
        }
      }
    }
  } catch (error) {
    console.error("Error retrieving service access map:", error);
  }

  return serviceAccessMap;
}

// Helper function to assume a role
async function getClientWithAssumedRole(roleArn: string) {
  const stsClient = new STSClient({});
  const assumedRole = await stsClient.send(
    new AssumeRoleCommand({
      RoleArn: roleArn,
      RoleSessionName: "ServiceAccessMapSession",
    })
  );
  return new IAMClient({
    credentials: {
      accessKeyId: assumedRole.Credentials?.AccessKeyId!,
      secretAccessKey: assumedRole.Credentials?.SecretAccessKey!,
      sessionToken: assumedRole.Credentials?.SessionToken!,
    },
  });
}

// Helper function to add services from an attached policy
async function addPolicyServicesToMap(
  iamClient: IAMClient,
  policyArn: string,
  userName: string,
  serviceAccessMap: ServiceAccessMap
) {
  const policy = await iamClient.send(
    new GetPolicyCommand({ PolicyArn: policyArn })
  );
  if (policy.Policy?.DefaultVersionId) {
    const policyVersion = await iamClient.send(
      new GetPolicyVersionCommand({
        PolicyArn: policyArn,
        VersionId: policy.Policy.DefaultVersionId,
      })
    );
    extractServicesFromPolicyDocument(
      policyVersion.PolicyVersion?.Document,
      userName,
      serviceAccessMap
    );
  }
}

// Helper function to extract services from a policy document
function extractServicesFromPolicyDocument(
  policyDocument: string | undefined,
  userName: string,
  serviceAccessMap: ServiceAccessMap
) {
  if (!policyDocument) return;

  try {
    const policy = JSON.parse(decodeURIComponent(policyDocument));
    const statements = Array.isArray(policy.Statement)
      ? policy.Statement
      : [policy.Statement];

    for (const statement of statements) {
      if (statement.Action) {
        const actions = Array.isArray(statement.Action)
          ? statement.Action
          : [statement.Action];
        actions.forEach((action: string) => {
          const service = action.split(":")[0];
          if (serviceAccessMap.has(service)) {
            serviceAccessMap.get(service)?.push(userName);
          } else {
            serviceAccessMap.set(service, [userName]);
          }
        });
      }
    }
  } catch (error) {
    console.error("Error parsing policy document:", error);
  }
}
