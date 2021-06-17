import { AzureFunction, Context } from "@azure/functions"

const activityFunction: AzureFunction = async function (context: Context): Promise<JSON> {
    
    context.log.info(`Filtering update history for owner ${context.bindings.configuration.repositoryOwner} and repo ${context.bindings.configuration.repositoryName}`)

    const result = <JSON><any>context.bindings.updateHistory.find( entry => ( entry.RepositoryOwner === context.bindings.configuration.repositoryOwner && entry.RepositoryName === context.bindings.configuration.repositoryName))

    return result
}

export default activityFunction
