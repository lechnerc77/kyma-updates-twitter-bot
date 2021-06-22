import * as df from "durable-functions"
import { IOrchestrationFunctionContext } from "durable-functions/lib/src/iorchestrationfunctioncontext"

const orchestrator = df.orchestrator(function* (context) {

    const retryConfig = getRetryConfig()

    const gitHubInfo = yield context.df.callActivityWithRetry("KymaUpdateBotGitHubReader", retryConfig, context.bindingData.input)

    const updateJournal = yield context.df.callActivityWithRetry("KymaUpdateHistoryReader", retryConfig, context.bindingData.input)

    handleUndefinedData(gitHubInfo, context)

    const doUpdate = isUpdateNecessary(gitHubInfo, updateJournal, context)

    if (process.env["SandboxMode"] === "active") {

        handleSandboxMode(doUpdate, context)

    }
    else {

        const updateInformation = buildUpdateInformation(context.bindingData.input, gitHubInfo)

        if (process.env["SendToTwitter"] === "active") {
            yield context.df.callActivityWithRetry("KymaUpdateTwitterSender", retryConfig, updateInformation)
        }
        else {
            context.log.info(`Sending to Twitter is switched off - Tweet would be sent for ${updateInformation.RepositoryName}`)
        }

        yield context.df.callActivityWithRetry("KymaUpdateHistoryWriter", retryConfig, updateInformation)

    }

})

function isUpdateNecessary(gitHubInfo: any, updateJournal: any, context: IOrchestrationFunctionContext): boolean {


    if (!updateJournal) {
        //Very first entry into the history table
        if (context.df.isReplaying === false) {
            context.log.info(`Update is necessary for repo ${context.bindingData.input.repositoryName} - first entry`)
        }
        return true
    }

    if ((gitHubInfo.TagName !== updateJournal.TagName) &&
        (updateJournal.PublishedAt < gitHubInfo.PublishedAt)
    ) {
        if (context.df.isReplaying === false) {
            context.log.info(`Update is necessary for repo ${context.bindingData.input.repositoryName}`)
        }

        return true
    }
    else {
        context.log.info(`Update is not necessary for repo ${context.bindingData.input.repositoryName}`)
        return false
    }

}

function buildUpdateInformation(configuration: any, gitHubInfo: any) {

    const updateInformation = {
        RowKey: configuration.rowKey,
        RepositoryOwner: configuration.repositoryOwner,
        RepositoryName: configuration.repositoryName,
        Name: gitHubInfo.Name,
        TagName: gitHubInfo.TagName,
        PublishedAt: gitHubInfo.PublishedAt,
        HtmlUrl: gitHubInfo.HtmlUrl,
        HashTags: configuration.hashTags
    }

    return updateInformation

}

function handleSandboxMode(doUpdate: boolean, context: IOrchestrationFunctionContext) {

    const sandboxMessage = (doUpdate === true) ? "Tweet will be sent and table will be updated" : "No update necessary"

    context.log.info(`SANDBOXMODE: ${sandboxMessage}`)

}

function handleUndefinedData(gitHubInfo: any, context: IOrchestrationFunctionContext) {

    if (!gitHubInfo) {
        context.log.error(`No Data from GitHub and/or Update History for repository ${context.bindingData.input.repositoryName}`)
        throw new Error(`No Data from GitHub and/or Update History for repository ${context.bindingData.input.repositoryName}`)
    }
}


function getRetryConfig(): df.RetryOptions {

    const retryConfig: df.RetryOptions = new df.RetryOptions(+process.env["FirstRetryIntervalInMilliseconds"], +process.env["MaxNumberOfRetryAttempts"])
    retryConfig.maxRetryIntervalInMilliseconds = +process.env["MaxRetryIntervalInMilliseconds"]
    retryConfig.retryTimeoutInMilliseconds = +process.env["RetryTimeoutInMilliseconds"]
    retryConfig.backoffCoefficient = +process.env["RetryBackoffCoefficient"]

    return retryConfig
}

export default orchestrator

