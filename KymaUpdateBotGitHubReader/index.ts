
import { AzureFunction, Context } from "@azure/functions"
import { Octokit } from "@octokit/core"

const activityFunction: AzureFunction = async function (context: Context): Promise<JSON> {

    const octokit = new Octokit()

    const requestUrl = `/repos/${context.bindings.configuration.repositoryOwner.toString()}/${context.bindings.configuration.repositoryName.toString()}/releases/latest`

    const repositoryInformation = await octokit.request(requestUrl)

    if (repositoryInformation) {

        context.log.info(`Information successfully retrieved from GitHub for Owner ${context.bindings.configuration.repositoryOwner} and Repo ${context.bindings.configuration.repositoryName }`)

        const workingContext = <JSON><any>{
            "PartitionKey": context.bindings.configuration.partitionKey,
            "RowKey": context.bindings.configuration.rowKey,
            "RepositoryOwner": context.bindings.configuration.repositoryOwner,
            "RepositoryName": context.bindings.configuration.repositoryName,
            "HashTags": context.bindings.configuration.hashTags,
            "HtmlUrl": repositoryInformation.data.html_url,
            "PublishedAt": repositoryInformation.data.published_at,
            "Name": repositoryInformation.data.name,
            "TagName": repositoryInformation.data.tag_name
        }

        return workingContext 
    }
    else{

        context.log.warn(`No information found on GitHub for Owner ${context.bindings.configuration.repositoryOwner} and Repo ${context.bindings.configuration.repositoryName }`)

    }


}

export default activityFunction
