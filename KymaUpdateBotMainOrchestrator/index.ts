import * as df from "durable-functions"

const orchestrator = df.orchestrator(function* (context) {

    const configuration = yield context.df.callActivity("KymaUpdateBotConfigReader")

    if (configuration) {

        const updateTasks = []

        for (const configurationEntry of configuration) {
            const child_id = context.df.instanceId + `:${configurationEntry.RowKey}`
            const updateTask = context.df.callSubOrchestrator("KymaUpdateBotNewsUpdateOrchestrator", configurationEntry, child_id)
            updateTasks.push(updateTask)
        }

        context.log.info(`Starting ${updateTasks.length} sub-orchestrations for update`)

        yield context.df.Task.all(updateTasks)
    }
    else {
        context.log.warn("No entries found in configuration")
    }

})

export default orchestrator
